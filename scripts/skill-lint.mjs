#!/usr/bin/env node
/* 이 스킬 자체가 망가졌는지 보는 검사 — «기여하기 전에 한 번» 돌린다.
   축 카탈로그는 사람이 손으로 늘리는 문서다. 손으로 늘리는 것은 반드시 어긋난다
   (표에는 더했는데 본문은 빠뜨리고, 네 칸 중 하나를 안 채우고, 번호를 다시 쓴다).
   그 어긋남을 기계가 먼저 잡는다.

   쓰는 법:  node scripts/skill-lint.mjs        (스킬 폴더 어디서든)
   종료코드: 0 통과 · 1 어긋남 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const ex = (p) => fs.existsSync(path.join(ROOT, p));

let bad = 0;
const ok = (m) => console.log('  ✓ ' + m);
const no = (m) => { bad++; console.log('  ✗ ' + m); };

console.log('[1] 있어야 할 파일');
const MUST = ['SKILL.md', 'README.md', 'CONTRIBUTING.md',
  'references/axes.md', 'references/severity.md', 'references/generators.md',
  'templates/AUDIT.md', 'templates/LEDGER.md', 'templates/audit.json',
  'templates/axis-template.md', 'templates/case-template.md',
  'scripts/audit-check.mjs', 'cases/README.md'];
for (const f of MUST) ex(f) ? ok(f) : no(f + ' 가 없습니다');

console.log('\n[2] 스킬 머리글 (이것이 없으면 AI 가 스킬을 못 찾는다)');
const skill = ex('SKILL.md') ? rd('SKILL.md') : '';
const fm = /^---\n([\s\S]*?)\n---/.exec(skill);
if (!fm) no('SKILL.md 머리글(--- 블록)이 없습니다');
else {
  /^name:\s*\S+/m.test(fm[1]) ? ok('name 있음') : no('머리글에 name 이 없습니다');
  const d = /^description:\s*(.+)$/m.exec(fm[1]);
  if (!d) no('머리글에 description 이 없습니다');
  else if (d[1].trim().length < 40) no('description 이 너무 짧습니다 (언제 쓰는지 적어야 스킬이 걸린다)');
  else ok('description 있음 (' + d[1].trim().length + '자)');
}

console.log('\n[3] 축 카탈로그 — 표와 본문이 맞는가');
const axes = ex('references/axes.md') ? rd('references/axes.md') : '';
/* 표 줄: | 13 | 기록·추적 | … */
const tbl = [...axes.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|/gm)].map((m) => ({ n: Number(m[1]), name: m[2].trim() }));
/* 본문 절: ## 13. 기록·추적 축 — … */
const body = [...axes.matchAll(/^## (\d+)\.\s*(.+)$/gm)].map((m) => ({ n: Number(m[1]), title: m[2].trim() }));
const tn = tbl.map((x) => x.n), bn = body.map((x) => x.n);
const uniq = (a) => [...new Set(a)];

if (!tbl.length || !body.length) no('축 표나 본문을 찾지 못했습니다');
else {
  uniq(bn).length === bn.length ? ok('축 번호가 겹치지 않는다 (' + bn.length + '개)')
    : no('축 번호가 겹칩니다: ' + bn.filter((x, i) => bn.indexOf(x) !== i).join(', '));
  const missBody = uniq(tn).filter((n) => !bn.includes(n));
  const missTbl = uniq(bn).filter((n) => !tn.includes(n));
  missBody.length ? no('표에는 있는데 본문이 없는 축: ' + missBody.join(', ')) : ok('표의 축이 모두 본문에 있다');
  missTbl.length ? no('본문에는 있는데 표에 없는 축: ' + missTbl.join(', ')) : ok('본문의 축이 모두 표에 있다');
  const sorted = uniq(bn).sort((a, b) => a - b);
  const gaps = sorted.filter((n, i) => i && n !== sorted[i - 1] + 1);
  gaps.length ? console.log('  ! 번호가 이어지지 않습니다(지운 축이 있다면 정상): ' + sorted.join(', ')) : ok('번호가 1부터 이어진다');
}

console.log('\n[4] 축마다 네 칸 (무엇을 세나 / 뽑는 법 / 전형적 구멍 / 못질)');
const secs = axes.split(/^## (?=\d+\.)/m).slice(1);
let cellBad = 0;
for (const sec of secs) {
  const n = (/^(\d+)\./.exec(sec) || [, '?'])[1];
  const need = [['전수 목록', /\*\*전수 목록\*\*/], ['전형적 구멍', /\*\*전형적 구멍\*\*/], ['못질', /\*\*못질\*\*/]];
  const miss = need.filter(([, re]) => !re.test(sec)).map(([k]) => k);
  /* 「뽑는 법」은 전형적 구멍 안에 녹여 쓴 축이 있어 권고로 둔다 */
  if (miss.length) { cellBad++; no('축 ' + n + ' — 빠진 칸: ' + miss.join(', ')); }
  else if (!/\*\*뽑는 법\*\*/.test(sec)) console.log('  ! 축 ' + n + ' — «뽑는 법» 칸이 없습니다 (권고)');
}
if (!cellBad) ok('모든 축에 필수 칸이 있다 (' + secs.length + '개)');

console.log('\n[5] 사례 — 서식을 지키는가');
const cdir = path.join(ROOT, 'cases');
const cases = fs.existsSync(cdir) ? fs.readdirSync(cdir).filter((f) => f.endsWith('.md') && f !== 'README.md') : [];
if (!cases.length) console.log('  ! 사례가 아직 없습니다 (축을 더할 때는 사례 1개가 필요합니다)');
for (const f of cases) {
  const t = fs.readFileSync(path.join(cdir, f), 'utf8');
  const miss = [];
  if (!/^# .+/m.test(t)) miss.push('제목');
  if (!/\*\*축\*\*/.test(t)) miss.push('축');
  if (!/왜 시험이 못 잡았나/.test(t)) miss.push('왜 시험이 못 잡았나');
  if (!/다른 프로젝트에 옮길 수 있는 교훈/.test(t)) miss.push('교훈');
  if (!/^\d{4}-\d{2}-\d{2}-/.test(f)) miss.push('파일 이름(YYYY-MM-DD-…)');
  miss.length ? no('cases/' + f + ' — 빠진 것: ' + miss.join(', ')) : ok('cases/' + f);
}

console.log('\n[6] 문서에 적힌 축 개수 — 카탈로그와 맞는가');
/* 축은 늘어난다. 카탈로그만 늘리고 SKILL.md·README 의 «N개 축» 을 그대로 두면 절차를 읽는 AI 가 옛 개수에서 멈춘다
   (카탈로그가 20개로 늘었는데 SKILL.md 는 «12축 모두» 에 머물러 있었다). */
const axisCount = uniq(bn).length;
const COUNT_RE = [/(\d+)\s*개\s*«?\s*축/g, /축\s*카탈로그\s*(\d+)\s*개/g, /(\d+)\s*축\s*모두/g, /축이\s*(\d+)\s*개/g, /지금\s*(\d+)\s*개다/g];
let countBad = 0;
if (axisCount) {
  for (const f of ['SKILL.md', 'README.md', 'references/axes.md']) {
    if (!ex(f)) continue;
    const t = rd(f);
    for (const re of COUNT_RE) for (const m of t.matchAll(re)) {
      if (Number(m[1]) !== axisCount) { countBad++; no(f + ' — «' + m[0] + '» 인데 카탈로그는 ' + axisCount + '개'); }
    }
  }
  if (!countBad) ok('SKILL.md·README·카탈로그에 적힌 축 개수가 ' + axisCount + '개로 맞는다');
}

console.log('');
if (bad) { console.log('✗ 어긋남 ' + bad + '건 — 고친 뒤 올리세요 (CONTRIBUTING.md)'); process.exit(1); }
console.log('✓ 통과 — 올려도 됩니다');
