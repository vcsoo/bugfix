#!/usr/bin/env node
/* 산출물 신선도 · 검수 대장 검사기 — 축 검수(axis-audit) 스킬의 유일한 실행 도구.
   어느 언어로 만든 프로젝트에서도 돈다. 필요한 것은 node 와 (대장을 쓸 때만) git 뿐이다.

   쓰는 법
     node audit-check.mjs                프로젝트의 audit.json 을 찾아 산출물·대장을 검사
     node audit-check.mjs --write        어긋난 산출물을 다시 씀 (생성기를 실제로 돌린다)
     node audit-check.mjs --ledger       대장만
     node audit-check.mjs --artifacts    산출물만
     node audit-check.mjs --strict       대장의 «썩음·안 훑음» 도 실패로 친다
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

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const ROOT = path.resolve(opt('--root', process.cwd()));
const WRITE = has('--write');
const STRICT = has('--strict');
const ONLY_LEDGER = has('--ledger');
const ONLY_ART = has('--artifacts');

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
    rows.push({ area: c[0], axis: c[1], depth: (c[2] || '').toUpperCase(), date: c[3], commit: c[4], note: c[5] || '' });
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
  const rows = parseLedger(fs.readFileSync(lp, 'utf8'));
  if (!rows.length) { hm('대장에 줄이 없습니다 (아직 아무 축도 훑지 않았습니다)'); return; }
  if (!AREAS.length) { hm('audit.json 에 areas 가 없어 구역별 썩음을 볼 수 없습니다'); }

  const seen = new Set(rows.map((r) => r.area + '|' + r.axis));
  const pathsOf = (id) => { const a = AREAS.find((x) => x.id === id || x.name === id); return a ? (a.paths || []) : []; };

  let stale = 0, shallow = 0;
  for (const r of rows) {
    const ps = pathsOf(r.area);
    if (r.depth && r.depth !== 'L3') shallow++;
    if (!ps.length || !hasGit() || !r.commit || /^-+$/.test(r.commit)) continue;
    if (!isCommit(r.commit)) { hm(r.area + ' × 축' + r.axis + ' — 대장의 커밋(' + r.commit + ')을 찾을 수 없습니다'); continue; }
    if (changedSince(r.commit, ps)) { stale++; console.log('  ↻ ' + r.area + ' × 축' + r.axis + ' — 훑은 뒤 코드가 바뀌었습니다 (다시 볼 칸)'); }
  }

  /* 안 훑은 칸 — «한 번에 최대한 많이» 를 지키는 장치 */
  if (!AXES.length) { no('축 카탈로그(references/axes.md)를 읽지 못해 안 훑은 칸을 셀 수 없습니다 — audit.json 에 axes 를 적으세요'); return; }
  const missing = [];
  for (const a of AREAS) for (const ax of AXES) if (!seen.has(a.id + '|' + String(ax))) missing.push(a.id + '×' + ax);
  const total = AREAS.length * AXES.length;
  const doneN = total - missing.length;

  console.log('  덮인 칸 ' + doneN + '/' + total + ' · 다시 볼 칸 ' + stale + ' · 깊이 L3 미만 ' + shallow);
  if (missing.length) {
    const head = missing.slice(0, 18).join(' ');
    (STRICT ? no : hm)('아직 안 훑은 칸 ' + missing.length + '개: ' + head + (missing.length > 18 ? ' …' : ''));
  } else ok('모든 구역 × 축이 한 번씩은 덮였습니다');
  if (stale && STRICT) no('다시 볼 칸이 ' + stale + '개 있습니다');
}

/* ── 실행 ── */
console.log('축 검수 검사기 — ' + path.relative(process.cwd(), CFG_PATH) + '\n');
if (!ONLY_LEDGER) checkArtifacts();
if (!ONLY_ART) checkLedger();
console.log('');
if (bad) { console.log('✗ 어긋남 ' + bad + '건' + (warn ? ' · 알림 ' + warn + '건' : '')); process.exit(2); }
console.log('✓ 통과' + (warn ? ' (알림 ' + warn + '건)' : ''));
