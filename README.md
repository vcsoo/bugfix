# 축 검수기 (axis-audit)

**특정 프로젝트에 얽매이지 않는 공용 검수 스킬.** 코드베이스를 20개 «축» 으로 전수 훑어
단위시험이 놓친 구멍을 한 번에 최대한 많이 찾아낸다.

- 언어·프레임워크 무관 (검사기는 node 만 있으면 돈다)
- 훑은 자리를 **검수 대장**에 남겨, 다음 검수는 «썩은 칸» 만 다시 본다
- 다른 프로젝트에서 배운 축·사례를 **여기로 되돌려** 모두가 쓴다 → `CONTRIBUTING.md`

## 설치 (프로젝트에 붙이기)

```sh
# 방법 1) 스킬 폴더로 그대로 복제 — 가장 간단하다
git clone https://github.com/vcsoo/bugfix .claude/skills/axis-audit

# 방법 2) 하위모듈로 — 본체를 갱신해 쓰고 싶을 때
git submodule add https://github.com/vcsoo/bugfix .claude/skills/axis-audit

# 방법 3) 개인 스킬로 (모든 프로젝트에서)
git clone https://github.com/vcsoo/bugfix ~/.claude/skills/axis-audit
```

그다음 프로젝트 뿌리에 설정 파일을 둔다.

```sh
cp .claude/skills/axis-audit/templates/audit.json ./audit.json
mkdir -p docs/audit && cp .claude/skills/axis-audit/templates/LEDGER.md docs/audit/LEDGER.md
```

## 쓰는 법

- AI 에게: **«축 검수 해 줘»** / «헛점 없는지 훑어 줘» — 스킬이 걸리면 `SKILL.md` 절차대로 전 축을 돈다
- 사람이 직접: `SKILL.md` → `references/axes.md` 순서대로 읽고 표를 채운다
- 검사기:

```sh
node .claude/skills/axis-audit/scripts/audit-check.mjs          # 산출물·대장 검사 (어긋나면 2)
node .claude/skills/axis-audit/scripts/audit-check.mjs --write  # 어긋난 산출물 다시 쓰기
node .claude/skills/axis-audit/scripts/skill-lint.mjs           # 이 스킬 자체가 망가졌는지 (기여 전 필수)
```

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
| `cases/` | **실제로 잡은 사례** — 어느 프로젝트에서 어느 축으로 무엇을 잡았나 |
| `CONTRIBUTING.md` | **다른 프로젝트에서 배운 것을 여기에 올리는 법** |

## 왜 이렇게 만들었나

시험은 기능 단위로 촘촘해질 뿐, **시험이 지나가지 않는 방향**에는 닿지 않는다.
«검수 끝냈는데 새 축으로 보면 또 나온다» 는 덜 훑었거나, «검수 완료» 의 뜻이 없었기 때문이다.
그래서 이 스킬은 (1) 축을 명시적으로 세어 두고 (2) 전 축을 도는 것을 기본으로 하며
(3) 훑은 자리를 대장에 남기고 (4) 새로 배운 축을 다시 카탈로그로 되돌린다.
