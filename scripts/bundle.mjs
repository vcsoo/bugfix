#!/usr/bin/env node
/* 이 스킬을 «md 한 장» 으로 싸고 다시 푸는 도구.
   저장소를 붙일 수 없는 환경(다른 계정·다른 회사)에서도 파일 하나만 건네면 그대로 복원된다.

   쓰는 법
     node scripts/bundle.mjs                         → axis-audit-bundle.md 를 만든다
     node scripts/bundle.mjs --out <경로>
     node scripts/bundle.mjs --unpack <합본.md> --into <폴더>   → 폴더로 되푼다

   싸는 규칙: 파일마다  <!-- file: 상대경로 -->  한 줄 + 여덟 겹 울타리로 감싼 내용.
   (문서 안에 세 겹 코드블록이 들어 있으므로 울타리를 여덟 겹으로 둔다) */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FENCE = '````````';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const SKIP = new Set(['.git', 'node_modules', '.DS_Store']);
const LANG = { '.md': 'markdown', '.mjs': 'javascript', '.js': 'javascript', '.json': 'json', '.sh': 'sh' };

function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (SKIP.has(e.name)) continue;
    const rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

if (argv.includes('--unpack')) {
  const src = opt('--unpack', ''), into = path.resolve(opt('--into', 'axis-audit'));
  if (!src || !fs.existsSync(src)) { console.error('합본 파일을 찾지 못했습니다: ' + src); process.exit(1); }
  const txt = fs.readFileSync(src, 'utf8');
  const re = new RegExp('<!-- file: (.+?) -->\\n' + FENCE + '[a-z]*\\n([\\s\\S]*?)\\n' + FENCE, 'g');
  let m, n = 0;
  while ((m = re.exec(txt))) {
    const rel = m[1].trim();
    if (rel.includes('..') || path.isAbsolute(rel)) { console.error('수상한 경로는 건너뜁니다: ' + rel); continue; }
    const dst = path.join(into, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, m[2] + '\n');
    n++; console.log('  + ' + rel);
  }
  if (!n) { console.error('합본에서 파일을 찾지 못했습니다 (서식이 다릅니다)'); process.exit(1); }
  console.log('\n' + n + '개 파일을 ' + into + ' 로 풀었습니다.');
  process.exit(0);
}

const files = walk(ROOT).filter((f) => !f.endsWith('-bundle.md'));
let out = '# 축 검수기 (axis-audit) — 합본 한 장\n\n' +
  '이 파일 하나에 스킬 전체가 들어 있다. 그대로 읽어도 되고, 폴더로 되풀어도 된다.\n\n' +
  '**되푸는 법** — 이 파일을 `axis-audit-bundle.md` 로 저장한 뒤:\n\n' +
  '```sh\n# 아래 «scripts/bundle.mjs» 내용을 bundle.mjs 로 저장하고\n' +
  'node bundle.mjs --unpack axis-audit-bundle.md --into axis-audit\n```\n\n' +
  '또는 AI 에게: «이 합본을 파일 경로대로 풀어서 저장소에 올려 줘» (각 파일 앞의 `<!-- file: … -->` 가 경로다)\n\n' +
  '| 파일 | |\n|---|---|\n' + files.map((f) => '| `' + f + '` | |').join('\n') + '\n\n---\n\n';
for (const f of files) {
  const lang = LANG[path.extname(f)] || '';
  out += '<!-- file: ' + f + ' -->\n' + FENCE + lang + '\n' +
    fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\n$/, '') + '\n' + FENCE + '\n\n';
}
const dst = path.resolve(opt('--out', path.join(ROOT, 'axis-audit-bundle.md')));
fs.writeFileSync(dst, out);
console.log('합본을 만들었습니다: ' + dst + ' (' + files.length + '개 파일 · ' + Math.round(out.length / 1024) + 'KB)');
