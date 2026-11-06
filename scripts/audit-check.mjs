#!/usr/bin/env node
/* 산출물 신선도 · 검수 대장 검사기 — 축 검수(axis-audit) 스킬의 유일한 실행 도구.
   어느 언어로 만든 프로젝트에서도 돈다. 필요한 것은 node 와 (대장을 쓸 때만) git 뿐이다.

   쓰는 법
     node audit-check.mjs                프로젝트의 audit.json 을 찾아 산출물·대장을 검사
     node audit-check.mjs --write        어긋난 산출물을 다시 씀 (생성기를 실제로 돌린다)
     node audit-check.mjs --ledger       대장만
     node audit-check.mjs --artifacts    산출물만
     node audit-check.mjs --strict       대장의 «썩음·안 훑음»·만료된 정책도 실패로 친다
     node audit-check.mjs --catalog      이 스킬의 축·시선 카탈로그 지문만 찍는다 (대장의 «카탈로그» 줄에 적는 값)
     node audit-check.mjs --yield        시선 × 축 적중률·기각 비율 (발견 대장 + 검수 대장)
     node audit-check.mjs --mode         지금 간편 / 정밀 중 무엇을 추천하는지와 이유
     node audit-check.mjs --config <경로> --root <경로>

   종료코드:  0 통과 · 1 설정·실행 문제 · 2 어긋남(산출물 불일치, --strict 면 대장도)

   왜 이렇게 만들었나
   - 손으로 그린 산출물은 두 번째 배포부터 거짓말을 한다. 그래서 «생성기로 다시 뽑아 보고 같은가» 를 묻는다.
   - 검사가 작업본을 더럽히면 아무도 안 돌린다. 그래서 파일을 백업하고 돌린 뒤 **원래대로 되돌린다**.
   - 코드에서 못 뽑는 문서(유스케이스 등)는 git 기록으로 «기준 코드가 더 새로운가» 만 본다. */

import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const ROOT = path.resolve(opt('--root', process.cwd()));
const WRITE = has('--write');
const STRICT = has('--strict');
const ONLY_LEDGER = has('--ledger');
const ONLY_ART = has('--artifacts');
const TODAY = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

/* ── 스킬 카탈로그 지문: 축·시선 문서가 바뀌면 달라진다. 대장의 «카탈로그» 줄과 다르면 «새 축·구멍이 생겼으니 전부 다시» ── */
const SKILL_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
function catalogPrint() {
  const h = crypto.createHash('sha256');
  for (const f of ['references/axes.md', 'references/perspectives.md']) {
    const p = path.join(SKILL_DIR, f);
    h.update(f + '\n' + (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') + '\n');
  }
  return h.digest('hex').slice(0, 10);
}
if (has('--catalog')) { console.log(catalogPrint()); process.exit(0); }
const ONLY_YIELD = has('--yield');
const ONLY_MODE = has('--mode');

/* ── 설정 찾기 ── */
const CONFIG_NAMES = ['audit.json', '.audit.json', 'docs/audit/audit.json', '.claude/audit.json'];
function findConfig() {
  const given = opt('--config', '');
  if (given) return path.resolve(ROOT, given);
  for (const n of CONFIG_NAMES) { const p = path.join(ROOT, n); if (fs.existsSync(p)) return p; }
  return '';
}
const CFG_PATH = findConfig();
if (!CFG_PATH || !fs.existsSync(CFG_PATH)) {
  console.error('설정 파일을 찾지 못했습니다. 저장소 뿌리에 audit.json 을 두세요.');
  console.error('서식은 스킬의 templates/audit.json 을 복사해 쓰면 됩니다. (' + CONFIG_NAMES.join(' · ') + ')');
  process.exit(1);
}
let CFG;
try { CFG = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8')); }
catch (e) { console.error('설정 파일을 읽지 못했습니다: ' + CFG_PATH + '\n  ' + e.message); process.exit(1); }

const AREAS = Array.isArray(CFG.areas) ? CFG.areas : [];
const SHARED = Array.isArray(CFG.shared) ? CFG.shared : [];          /* 여러 구역이 함께 쓰는 파일 — 바뀌면 모든 칸이 다시 볼 칸 */
const FULL_DAYS = Number(CFG.fullEveryDays === undefined ? 30 : CFG.fullEveryDays);
const FINDINGS = CFG.findings || 'docs/audit/FINDINGS.md';
const PERSPECTIVES = Array.isArray(CFG.perspectives) && CFG.perspectives.length ? CFG.perspectives : ['기획자', '개발자', '퍼블리셔', '고객', '운영자', '공격자'];
const ARTIFACTS = Array.isArray(CFG.artifacts) ? CFG.artifacts : [];
/* axes 를 비우면 카탈로그(references/axes.md)의 전 축 — «기본은 전 축을 도는 것» 이다.
   번호를 여기에 적어 두면 카탈로그가 늘 때 뒤처진다(1~12 에 머물러 13번부터는 안 훑어도 조용했다). */
function catalogAxes() {
  const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'references', 'axes.md');
  if (!fs.existsSync(p)) return [];
  return [...new Set([...fs.readFileSync(p, 'utf8').matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1])))];
}
const AXES = CFG.axes || catalogAxes();
const LEDGER = CFG.ledger || 'docs/audit/LEDGER.md';

let bad = 0, warn = 0;
const ok = (m) => console.log('  ✓ ' + m);
const no = (m) => { bad++; console.log('  ✗ ' + m); };
const hm = (m) => { warn++; console.log('  ! ' + m); };

/* ── 도우미 ── */
function sh(cmd, cwd) {
  const r = spawnSync(cmd, { cwd: cwd || ROOT, shell: true, encoding: 'utf8' });
  return { code: r.status === null ? 1 : r.status, out: (r.stdout || '') + (r.stderr || '') };
}
function git(args) {
  try { return execSync('git ' + args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}
const hasGit = () => !!git('rev-parse --git-dir');
/* 경로 목록을 git 이 이해하는 꼴로 — 와일드카드가 있으면 :(glob) 을 붙여야 src/** 가 먹는다 */
const spec = (ps) => ps.map((p) => JSON.stringify(/[*?\[]/.test(p) ? ':(glob)' + p : p)).join(' ');
/* 그 커밋 «이후» 에 이 경로를 건드린 커밋이 있나 — 시각 비교보다 정확하다(같은 초에 두 커밋이 날 수 있다) */
const changedSince = (sha, ps) => !!git('log ' + JSON.stringify(sha) + '..HEAD --format=%h -- ' + spec(ps));
const isCommit = (sha) => !!git('cat-file -e ' + JSON.stringify(sha) + '^{commit} && echo ok') || !!git('rev-parse --verify --quiet ' + JSON.stringify(sha) + '^{commit}');
const readIf = (p) => fs.existsSync(p) ? fs.readFileSync(p) : null;

/* ── 1. 산출물 ── */
function checkArtifacts() {
  console.log('[산출물] 코드와 어긋나지 않았나 — ' + ARTIFACTS.length + '건');
  if (!ARTIFACTS.length) { hm('audit.json 에 artifacts 가 비어 있습니다 (검사할 산출물이 없습니다)'); return; }

  for (const a of ARTIFACTS) {
    const label = a.path || a.name || '(이름 없음)';
    const paths = (a.paths && a.paths.length ? a.paths : [a.path]).filter(Boolean);

    /* (a) 생성기가 스스로 --check 를 제공하면 그것을 믿는다 — 가장 싸고 정확하다 */
    if (a.check) {
      const r = sh(a.check);
      if (r.code === 0) ok(label + ' — 생성기 자체 검사 통과');
      else {
        no(label + ' — 코드와 어긋납니다. 다시 뽑아 함께 커밋하세요: ' + (a.generate || a.check));
        if (r.out.trim()) console.log('      ' + r.out.trim().split('\n').slice(0, 6).join('\n      '));
        if (WRITE && a.generate) { const w = sh(a.generate); console.log('      → 다시 씀 (' + (w.code === 0 ? '성공' : '실패') + ')'); }
      }
      continue;
    }

    /* (b) 생성기만 있으면: 백업 → 생성 → 비교 → 되돌림 (검사가 작업본을 더럽히지 않는다) */
    if (a.generate) {
      const backup = paths.map((p) => [path.join(ROOT, p), readIf(path.join(ROOT, p))]);
      const r = sh(a.generate);
      if (r.code !== 0) {
        no(label + ' — 생성기가 실패했습니다: ' + a.generate);
        if (r.out.trim()) console.log('      ' + r.out.trim().split('\n').slice(0, 6).join('\n      '));
        for (const [p, b] of backup) if (b !== null) fs.writeFileSync(p, b);
        continue;
      }
      let same = true, missing = '';
      for (const [p, b] of backup) {
        const now = readIf(p);
        if (now === null) { same = false; missing = p; break; }
        if (b === null || !b.equals(now)) same = false;
      }
      if (same) ok(label + ' — 지금 코드로 다시 뽑아도 같습니다');
      else if (missing) no(label + ' — 생성기가 파일을 만들지 않았습니다: ' + path.relative(ROOT, missing));
      else if (WRITE) console.log('  ↻ ' + label + ' — 어긋나 있어 다시 썼습니다 (커밋에 포함하세요)');
      else {
        no(label + ' — 코드와 어긋납니다. 다시 뽑아 함께 커밋하세요: ' + a.generate);
        for (const [p, b] of backup) if (b !== null) fs.writeFileSync(p, b);   /* 되돌림 */
      }
      continue;
    }

    /* (c) 손으로 쓴 문서: 기준 코드가 문서보다 새로우면 «썩음» (git 이 있어야 한다) */
    if (a.watch && a.watch.length) {
      if (!hasGit()) { hm(label + ' — git 저장소가 아니라 썩음을 볼 수 없습니다'); continue; }
      const docSha = git('log -1 --format=%H -- ' + JSON.stringify(a.path));
      if (!docSha) { hm(label + ' — 아직 커밋된 적이 없습니다'); continue; }
      const docT = Number(git('show -s --format=%ct ' + docSha) || 0);
      const codeT = Number(git('log -1 --format=%ct -- ' + spec(a.watch)) || 0);
      const lag = Math.floor((codeT - docT) / 86400);
      const allow = Number(a.maxLagDays === undefined ? 0 : a.maxLagDays);
      if (changedSince(docSha, a.watch) && lag > allow)
        no(label + ' — 기준 코드가 문서보다 ' + lag + '일 새롭습니다 (' + a.watch.join(', ') + ') — 다시 읽고 고치세요');
      else ok(label + ' — 기준 코드보다 뒤지지 않습니다');
      continue;
    }

    hm(label + ' — generate·check·watch 가 하나도 없어 검사할 수 없습니다');
  }
}

/* ── 2. 검수 대장 ── */
/* 대장은 사람이 읽는 마크다운 표다. 줄 모양:
   | 구역 | 축 | 깊이 | 날짜 | 커밋 | 비고 | */
function parseLedger(txt) {
  const rows = [];
  for (const line of txt.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const c = t.split('|').slice(1, -1).map((x) => x.trim());
    if (c.length < 5) continue;
    if (/^-+$/.test(c[0].replace(/[: ]/g, '')) || /^구역$/.test(c[0])) continue;
    rows.push({ area: c[0], axis: c[1], depth: (c[2] || '').toUpperCase(), date: c[3], commit: c[4], note: c[5] || '', view: c[6] || '개발자', mode: c[7] || '정밀' });
  }
  return rows;
}
function checkLedger() {
  const lp = path.join(ROOT, LEDGER);
  console.log('\n[검수 대장] 어디까지 훑었나 — ' + LEDGER);
  if (!fs.existsSync(lp)) {
    hm('대장이 없습니다. 스킬의 templates/LEDGER.md 를 ' + LEDGER + ' 로 복사해 쓰세요');
    return;
  }
  const ledgerTxt = fs.readFileSync(lp, 'utf8');
  const rows = parseLedger(ledgerTxt);
  if (!rows.length) { hm('대장에 줄이 없습니다 (아직 아무 축도 훑지 않았습니다)'); return; }
  if (!AREAS.length) { hm('audit.json 에 areas 가 없어 구역별 썩음을 볼 수 없습니다'); }

  /* 카탈로그가 바뀌었나 — 새 축·새 구멍·새 시선이 생겼으면 옛 칸을 그대로 믿지 않는다 */
  const cat = (/\*\*카탈로그\*\*\s*:\s*`?([0-9a-f]{6,})`?/.exec(ledgerTxt) || [])[1];
  const nowCat = catalogPrint();
  const catChanged = !!cat && cat !== nowCat && !/^0+$/.test(cat);
  if (!cat || /^0+$/.test(cat)) hm('대장에 «카탈로그» 줄이 없습니다 — 이번 회차 스킬 지문(' + nowCat + ')을 적으세요');
  else if (catChanged) (STRICT ? no : hm)('스킬의 축·시선 카탈로그가 바뀌었습니다 (' + cat + ' → ' + nowCat + ') — 새 축·구멍이 생겼으니 모든 칸을 다시 볼 칸으로 봅니다');

  /* 덮인 칸: L2·L3·N/A 만 센다. L1 은 «일부만 봄» — 완료가 아니다 */
  const DONE = (d) => d === 'L2' || d === 'L3' || d === 'N/A' || d === 'NA';
  const latest = new Map(); /* 구역|축 → 가장 최근 줄 (덮인 것만) */
  for (const r of rows) if (DONE(r.depth)) {
    const k = r.area + '|' + r.axis; const prev = latest.get(k);
    if (!prev || (r.date || '') >= (prev.date || '')) latest.set(k, r);
  }
  const pathsOf = (id) => { const a = AREAS.find((x) => x.id === id || x.name === id); return a ? (a.paths || []) : []; };
  const ageDays = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? Math.floor((Date.parse(TODAY) - Date.parse(d)) / 86400000) : 0);

  let stale = 0;
  const shallow = rows.filter((r) => r.depth === 'L1').length;
  for (const r of latest.values()) {
    const why = [];
    if (catChanged) why.push('카탈로그 바뀜');
    if (FULL_DAYS > 0 && ageDays(r.date) > FULL_DAYS) why.push(ageDays(r.date) + '일 지남');
    const ps = [...pathsOf(r.area), ...SHARED];
    if (ps.length && hasGit() && r.commit && !/^-+$/.test(r.commit)) {
      if (!isCommit(r.commit)) hm(r.area + ' × 축' + r.axis + ' — 대장의 커밋(' + r.commit + ')을 찾을 수 없습니다');
      else {
        if (pathsOf(r.area).length && changedSince(r.commit, pathsOf(r.area))) why.push('구역 코드 바뀜');
        if (SHARED.length && changedSince(r.commit, SHARED)) why.push('공용 파일 바뀜');
      }
    }
    if (why.length) { stale++; if (!catChanged) console.log('  ↻ ' + r.area + ' × 축' + r.axis + ' — ' + why.join(' · ') + ' (다시 볼 칸)'); }
  }

  /* 안 훑은 칸 — «한 번에 최대한 많이» 를 지키는 장치 */
  if (!AXES.length) { no('축 카탈로그(references/axes.md)를 읽지 못해 안 훑은 칸을 셀 수 없습니다 — audit.json 에 axes 를 적으세요'); return; }
  const missing = [];
  for (const a of AREAS) for (const ax of AXES) if (!latest.has(a.id + '|' + String(ax))) missing.push(a.id + '×' + ax);
  const total = AREAS.length * AXES.length;
  const doneN = total - missing.length;

  console.log('  덮인 칸(L2·L3·해당 없음) ' + doneN + '/' + total + ' · 다시 볼 칸 ' + stale + ' · L1(일부만) ' + shallow + '줄');
  if (missing.length) {
    const head = missing.slice(0, 18).join(' ');
    (STRICT ? no : hm)('아직 안 훑은(또는 L1 만 본) 칸 ' + missing.length + '개: ' + head + (missing.length > 18 ? ' …' : ''));
  } else ok('모든 구역 × 축이 L2 이상으로 한 번씩은 덮였습니다');
  if (stale && STRICT) no('다시 볼 칸이 ' + stale + '개 있습니다');

  /* 시선 — 한 번도 안 쓴 시선이 있으면 그 사람의 눈으로는 아무것도 안 본 것이다 */
  const usedViews = new Set(rows.filter((r) => DONE(r.depth)).map((r) => r.view));
  const unusedViews = PERSPECTIVES.filter((v) => !usedViews.has(v));
  if (unusedViews.length) (STRICT ? no : hm)('한 번도 L2 이상으로 쓰지 않은 시선: ' + unusedViews.join(' · '));
  else ok('시선 ' + PERSPECTIVES.length + '개가 모두 한 번 이상 쓰였습니다');
}

/* ── 3. 발견 대장 ── */
/* 줄 모양: | 번호 | 등급 | 증거 | 상태 | 만료 | 시선 | 축 | 구역 | 제목 | 지문 | */
function checkFindings() {
  const fp = path.join(ROOT, FINDINGS);
  console.log('\n[발견 대장] 결정·만료 — ' + FINDINGS);
  if (!fs.existsSync(fp)) { hm('발견 대장이 없습니다. 스킬의 templates/FINDINGS.md 를 ' + FINDINGS + ' 로 복사해 쓰세요'); return; }
  const rows = parseFindings(fs.readFileSync(fp, 'utf8'));
  if (!rows.length) { hm('발견 대장에 줄이 없습니다'); return; }
  const ids = rows.map((r) => r.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  dup.length ? no('발견 번호가 겹칩니다: ' + [...new Set(dup)].join(', ')) : ok('발견 번호 ' + rows.length + '개가 겹치지 않는다');
  for (const r of rows) {
    if (!/^E[123]$/.test(r.ev)) hm(r.id + ' — 증거 칸(E1·E2·E3)이 비었거나 형식이 다릅니다');
    if (r.state === '정책' && r.sev === 'C') no(r.id + ' — 치명인데 «정책» 입니다 (치명은 정책으로 둘 수 없습니다)');
    if ((r.state === '정책' || r.state === '보류') && !/^\d{4}-\d{2}-\d{2}$/.test(r.exp)) hm(r.id + ' — «' + r.state + '» 인데 만료일이 없습니다');
    if ((r.state === '정책' || r.state === '보류') && /^\d{4}-\d{2}-\d{2}$/.test(r.exp) && r.exp < TODAY) (STRICT ? no : hm)(r.id + ' — «' + r.state + '» 만료(' + r.exp + ') — 다시 볼 차례입니다');
  }
  /* 기각된 지문과 같은 지문이 다시 열려 있으면 — 틀린 발견이 또 올라온 것 */
  const rejected = new Set(rows.filter((r) => r.state === '기각' && r.print).map((r) => normPrint(r.print)));
  for (const r of rows) if (r.state !== '기각' && r.print && rejected.has(normPrint(r.print))) hm(r.id + ' — 기각된 발견과 지문이 같습니다 (새로 올리지 말고 기각에 붙이세요)');
  checkCitations(rows);
  const open = rows.filter((r) => r.state === '열림' || r.state === '다시 열림');
  const e1 = rows.filter((r) => r.ev === 'E1' && r.state !== '고침');
  console.log('  열림 ' + open.length + ' · 확인할 것(E1) ' + e1.length + ' · 기각 ' + rows.filter((r) => r.state === '기각').length);
}

function parseFindings(txt) {
  const rows = [];
  for (const line of txt.split('\n')) {
    const c = line.trim().startsWith('|') ? line.trim().split('|').slice(1, -1).map((x) => x.trim()) : [];
    if (c.length < 5 || !/^F-\d+/.test(c[0])) continue;
    rows.push({ id: c[0], sev: c[1].toUpperCase(), ev: c[2].toUpperCase(), state: c[3], exp: c[4], view: c[5] || '개발자', axis: c[6] || '', area: c[7] || '', title: c[8] || '', print: c[9] || '' });
  }
  return rows;
}
const normPrint = (p) => p.replace(/\s+/g, ' ').trim().toLowerCase();

/* 인용 실재 확인 — AI 는 없는 파일·함수 이름을 지어낸다. 발견 대장의 지문(축 · 구역 · 파일 · 함수 · 요약)과
   검수 기록(docs/audit/AUDIT-*.md)의 «파일:줄» 이 실제로 있는지 본다. 없으면 증거를 E1 로 내리라고 알린다 */
function checkCitations(rows) {
  let checked = 0, badN = 0;
  const lineCount = (f) => fs.readFileSync(f, 'utf8').split('\n').length;
  for (const r of rows) {
    if (r.state === '기각' || r.state === '고침' || !r.print) continue;
    const parts = r.print.split('·').map((x) => x.trim());
    const file = parts.find((x) => /[\w-]\.[a-z0-9]{1,6}$/i.test(x) && /[/\\]/.test(x));
    if (!file) continue;
    checked++;
    const fpath = path.join(ROOT, file);
    if (!fs.existsSync(fpath)) { badN++; hm(r.id + ' — 지문의 파일이 없습니다: ' + file + ' (증거를 E1 로)'); continue; }
    const fn = parts[parts.indexOf(file) + 1];
    if (fn && /^[A-Za-z_$][\w$]*$/.test(fn) && !fs.readFileSync(fpath, 'utf8').includes(fn)) { badN++; hm(r.id + ' — 지문의 함수 «' + fn + '» 가 ' + file + ' 에 없습니다 (증거를 E1 로)'); }
  }
  const adir = path.join(ROOT, path.dirname(FINDINGS));
  const audits = fs.existsSync(adir) ? fs.readdirSync(adir).filter((f) => /^AUDIT-.*\.md$/.test(f)) : [];
  for (const a of audits) {
    const txt = fs.readFileSync(path.join(adir, a), 'utf8');
    for (const m of txt.matchAll(/(?<![\w:/.])((?:[\w.-]+\/)*[\w.-]+\.[a-z0-9]{1,6}):(\d+)(?:-(\d+))?/gi)) {
      const f = path.join(ROOT, m[1]); checked++;
      if (!fs.existsSync(f)) { badN++; hm(a + ' — 인용한 파일이 없습니다: ' + m[0]); continue; }
      const n = lineCount(f); const hi = Number(m[3] || m[2]);
      if (hi > n) { badN++; hm(a + ' — 인용한 줄이 파일보다 깁니다: ' + m[0] + ' (파일 ' + n + '줄)'); }
    }
  }
  if (checked) badN ? null : ok('인용 ' + checked + '곳이 실제 파일·줄·함수로 있습니다');
}

/* ── 4. 적중률 — 시선 × 축마다 받아들여진 발견 / 전체, 기각 비율 ── */
function yieldReport() {
  const fp = path.join(ROOT, FINDINGS);
  const lp = path.join(ROOT, LEDGER);
  const fr = fs.existsSync(fp) ? parseFindings(fs.readFileSync(fp, 'utf8')) : [];
  const lr = fs.existsSync(lp) ? parseLedger(fs.readFileSync(lp, 'utf8')) : [];
  console.log('[적중률] 시선 × 축 — 받아들여짐 = 고침·정책·보류·사람이 실행');
  const key = (v, a) => v + ' × 축' + a;
  const st = new Map();
  const get = (k) => st.get(k) || (st.set(k, { n: 0, acc: 0, rej: 0, looks: 0 }), st.get(k));
  for (const r of fr) { const x = get(key(r.view, r.axis)); x.n++; if (['고침', '정책', '보류', '사람이 실행'].includes(r.state)) x.acc++; if (r.state === '기각') x.rej++; }
  for (const r of lr) if (['L2', 'L3'].includes(r.depth)) get(key(r.view, r.axis)).looks++;
  const list = [...st.entries()].sort((a, b) => b[1].acc - a[1].acc || b[1].n - a[1].n);
  if (!list.length) { hm('발견·대장이 비어 적중률을 셀 수 없습니다'); return; }
  for (const [k, x] of list) {
    const rate = x.n ? Math.round((x.acc / x.n) * 100) + '%' : '-';
    let flag = '';
    if (x.n >= 3 && x.rej / x.n >= 0.5) flag = '  ← 기각이 많음: 이 칸의 질문을 고칠 것';
    else if (x.looks >= 3 && x.n === 0) flag = '  ← ' + x.looks + '번 봤는데 0건: 너무 얕게 본 건 아닌지';
    console.log('  ' + k.padEnd(14) + ' 발견 ' + String(x.n).padStart(3) + ' · 받아들여짐 ' + rate.padStart(4) + ' · 기각 ' + x.rej + ' · 본 횟수 ' + x.looks + flag);
  }
}

/* ── 5. 방식 추천 — 간편 / 정밀 (references/modes.md) ── */
function modeAdvice() {
  const lp = path.join(ROOT, LEDGER);
  const why = [];
  const rows = fs.existsSync(lp) ? parseLedger(fs.readFileSync(lp, 'utf8')) : [];
  if (!rows.length) why.push('첫 검수입니다 (대장이 비었다)');
  else {
    const txt = fs.readFileSync(lp, 'utf8');
    const cat = (/\*\*카탈로그\*\*\s*:\s*`?([0-9a-f]{6,})`?/.exec(txt) || [])[1];
    if (cat && !/^0+$/.test(cat) && cat !== catalogPrint()) why.push('스킬 카탈로그가 바뀌었습니다');
    const full = rows.filter((r) => r.mode !== '간편' && ['L2', 'L3', 'N/A', 'NA'].includes(r.depth)).map((r) => r.date).sort().pop();
    const days = full ? Math.floor((Date.parse(TODAY) - Date.parse(full)) / 86400000) : Infinity;
    if (days > FULL_DAYS) why.push(full ? '마지막 정밀 검수 뒤 ' + days + '일 지났습니다 (기준 ' + FULL_DAYS + '일)' : '정밀 검수 기록이 없습니다');
    const last = rows.map((r) => r.commit).filter((c) => c && isCommit(c)).pop();
    if (last && hasGit()) {
      const auditDir = path.dirname(LEDGER) + '/';  /* 검수 기록 자체의 변경은 세지 않는다 */
      const changed = git('diff --name-only ' + JSON.stringify(last) + '..HEAD').split('\n').filter((f) => f && !f.startsWith(auditDir) && f !== path.relative(ROOT, CFG_PATH));
      const all = git('ls-files').split('\n').filter(Boolean).length || 1;
      if (changed.length / all >= 0.3) why.push('지난 검수 뒤 파일의 ' + Math.round((changed.length / all) * 100) + '%가 바뀌었습니다');
      if (SHARED.length && changedSince(last, SHARED)) why.push('공용 파일(DB 정의·권한 등)이 바뀌었습니다');
    }
  }
  console.log('[방식 추천] ' + (why.length ? '정밀' : '간편'));
  (why.length ? why : ['정밀이 필요한 조건이 없습니다 — 바뀐 곳·핵심 축만 보면 됩니다']).forEach((w) => console.log('  - ' + w));
}

/* ── 실행 ── */
if (ONLY_YIELD) { yieldReport(); process.exit(0); }
if (ONLY_MODE) { modeAdvice(); process.exit(0); }
console.log('축 검수 검사기 — ' + path.relative(process.cwd(), CFG_PATH) + '\n');
if (!ONLY_LEDGER) checkArtifacts();
if (!ONLY_ART) { checkLedger(); if (!ONLY_LEDGER) checkFindings(); }
console.log('');
if (bad) { console.log('✗ 어긋남 ' + bad + '건' + (warn ? ' · 알림 ' + warn + '건' : '')); process.exit(2); }
console.log('✓ 통과' + (warn ? ' (알림 ' + warn + '건)' : ''));
