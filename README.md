# 축 검수기 (axis-audit)

**특정 프로젝트에 얽매이지 않는 공용 검수 스킬.** 코드베이스를 20개 «축» 으로 전수 훑어
단위시험이 놓친 구멍을 한 번에 최대한 많이 찾아낸다.

- 언어·프레임워크 무관 (검사기는 node 만 있으면 돈다)
- AI 도구 무관 — Claude Code · Codex · Grok Build 가 같은 저장소를 받아 같은 절차로 검수한다
- 훑은 자리를 **검수 대장**에 남겨, 다음 검수는 «썩은 칸» 만 다시 본다
- 여러 프로젝트·여러 도구에서 배운 축·사례를 **여기로 되돌려** 모두가 쓴다 → `CONTRIBUTING.md`

## AI 에게 — «vcsoo/bugfix 로 검수해» 를 받았다면

어느 도구든 이 순서대로 한다.

1. **git 으로 받는다. 웹페이지로 읽지 않는다** — 웹 읽기 도구는 긴 문서를 요약해 넘겨서 축이 빠진다.

   ```sh
   git clone https://github.com/vcsoo/bugfix .axis-audit     # 이미 있으면: git -C .axis-audit pull
   ```

   검수 대상 저장소에 섞이지 않게, `.git/info/exclude` 에 `.axis-audit/` 가 없으면 한 줄 더한다.
2. **`.axis-audit/SKILL.md` 절차대로 전 축을 돈다.** 검수 기록·대장은 대상 프로젝트의 `docs/audit/` 에 둔다.
3. **끝나면 배운 것을 되돌린다** — `.axis-audit/CONTRIBUTING.md` 를 읽고 사례·축을 제안해, 승인되면 그 문서대로 올린다.
   이 저장소에 올릴 수 없는 환경이면 올릴 파일 내용을 사람에게 건넨다.

## 늘 켜 두기 — 저장소 이름을 말하지 않아도 되게

도구의 전역 지시 파일에 아래 문단을 넣어 두면 «검수해 줘» 만으로 위 절차를 탄다.
스킬을 복사해 두는 것이 아니라 «그때그때 받아 와라» 는 지시라서 낡지 않는다.

| 도구 | 전역 지시 파일 |
|---|---|
| Claude Code | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/AGENTS.md` |
| Grok Build | `~/.grok/AGENTS.md` |

```markdown
## 코드 검수
코드 검수·감사·구조 점검, «버그나 헛점 없는지 훑어 줘» 요청을 받으면 https://github.com/vcsoo/bugfix 로 한다.
웹페이지로 읽지 말고 `git clone https://github.com/vcsoo/bugfix .axis-audit`
(이미 있으면 `git -C .axis-audit pull`) 로 받은 뒤, `.axis-audit/README.md` 의 «AI 에게» 절차를 따른다.
```

## 프로젝트 쪽에 두는 것

스킬은 프로젝트에 복사해 두지 않는다 — 복사본은 그날부터 낡는다. 프로젝트에 남는 것은 설정과 기록뿐이다.

```sh
cp .axis-audit/templates/audit.json ./audit.json
mkdir -p docs/audit && cp .axis-audit/templates/LEDGER.md docs/audit/LEDGER.md
```

## 검사기

```sh
node .axis-audit/scripts/audit-check.mjs          # 산출물·대장 검사 (어긋나면 2)
node .axis-audit/scripts/audit-check.mjs --write  # 어긋난 산출물 다시 쓰기
node .axis-audit/scripts/skill-lint.mjs           # 이 스킬 자체가 망가졌는지 (기여 전 필수)
```

사람이 직접 검수할 때는 `SKILL.md` → `references/axes.md` 순서대로 읽고 표를 채운다.

## 구조

| 경로 | 무엇 |
|---|---|
| `SKILL.md` | 검수 절차 (AI 가 읽는 본문) |
| `references/axes.md` | **축 카탈로그 20개** — 축마다 «무엇을 세나 · 뽑는 법 · 전형적 구멍 · 못질» |
| `references/severity.md` | 치명도 기준 · 보고 서식 |
| `references/generators.md` | 산출물 생성기 만드는 법 |
| `templates/` | 검수 기록·대장·설정·새 축·사례 서식 |
| `scripts/audit-check.mjs` | 산출물 신선도 + 대장 썩음 검사기 |
| `scripts/skill-lint.mjs` | 카탈로그·사례가 서식을 지키는지 검사 |
| `scripts/bundle.mjs` | 스킬 전체를 md 한 장(`axis-audit-bundle.md`)으로 싸고 되푸는 도구 |
| `cases/` | **실제로 잡은 사례** — 어느 프로젝트에서 어느 축으로 무엇을 잡았나 |
| `CONTRIBUTING.md` | **다른 프로젝트에서 배운 것을 여기에 올리는 법** |

## 왜 이렇게 만들었나

시험은 기능 단위로 촘촘해질 뿐, **시험이 지나가지 않는 방향**에는 닿지 않는다.
«검수 끝냈는데 새 축으로 보면 또 나온다» 는 덜 훑었거나, «검수 완료» 의 뜻이 없었기 때문이다.
그래서 이 스킬은 (1) 축을 명시적으로 세어 두고 (2) 전 축을 도는 것을 기본으로 하며
(3) 훑은 자리를 대장에 남기고 (4) 새로 배운 축을 다시 카탈로그로 되돌린다.
