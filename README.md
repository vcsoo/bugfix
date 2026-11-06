# 축 검수기 (axis-audit)

**특정 프로젝트에 얽매이지 않는 공용 검수 스킬.** 코드베이스를 **시선 6개 × 축 24개** 로 전수 훑어
단위시험이 놓친 구멍을 한 번에 최대한 많이 찾아낸다.

- **시선** — 누구의 눈으로 보나: 기획자 · 개발자 · 퍼블리셔 · 고객 · 운영자 · 공격자
- **축** — 무엇을 보나: 데이터·입구·상태·권한·불변식·시간 … 인증·세션·비용·한도·관측·복구·클라이언트·화면 (24개)
- 찾은 것은 **찾은 사람이 아닌 검증자가 실제로 돌려** 증거 수준(E1 미검증 · E2 코드로 확인 · E3 재현됨)을 매긴다

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
2. **방식을 고른다 — 간편 / 정밀** (`.axis-audit/references/modes.md`). 사람이 말하지 않았으면 두 방식을 보여 주고 한 번 묻는다
   (`node .axis-audit/scripts/audit-check.mjs --mode` 가 추천과 이유를 낸다). 평소엔 간편(바뀐 곳·핵심 축·시선 2, 비용 약 1/5~1/10),
   첫 검수·카탈로그 변경·30일 경과·큰 변경·출시 직전엔 정밀(시선 6 × 축 24 전부).
3. **`.axis-audit/SKILL.md` 절차대로 돈다.** 검수 기록·대장·발견 대장은 대상 프로젝트의 `docs/audit/` 에 둔다.
4. **끝나면 배운 것을 되돌린다** — `.axis-audit/CONTRIBUTING.md` 를 읽고 사례·축을 제안해, 승인되면 그 문서대로 올린다.
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
mkdir -p docs/audit && cp .axis-audit/templates/LEDGER.md docs/audit/LEDGER.md && cp .axis-audit/templates/FINDINGS.md docs/audit/FINDINGS.md
```

## 검사기

```sh
node .axis-audit/scripts/audit-check.mjs          # 산출물·대장·발견 대장 검사 (어긋나면 2)
node .axis-audit/scripts/audit-check.mjs --catalog  # 이 스킬 카탈로그 지문 (대장의 «카탈로그» 줄에 적는다)
node .axis-audit/scripts/audit-check.mjs --mode     # 간편 / 정밀 추천과 이유
node .axis-audit/scripts/audit-check.mjs --yield    # 시선 × 축 적중률·기각 비율
node .axis-audit/scripts/audit-check.mjs --write  # 어긋난 산출물 다시 쓰기
node .axis-audit/scripts/skill-lint.mjs           # 이 스킬 자체가 망가졌는지 (기여 전 필수)
```

사람이 직접 검수할 때는 `SKILL.md` → `references/perspectives.md` → `references/axes.md` 순서대로 읽고 표를 채운다.

## 구조

| 경로 | 무엇 |
|---|---|
| `SKILL.md` | 검수 절차 (AI 가 읽는 본문) |
| `references/modes.md` | **간편 / 정밀** — 무엇을 줄이나, 언제 정밀을 추천하나 |
| `references/perspectives.md` | **시선 6개** — 누구의 눈으로 보나, 시선마다 맡는 축·질문·확인 방법 |
| `references/axes.md` | **축 카탈로그 24개** + 유도어 표 — 축마다 «무엇을 세나 · 뽑는 법 · 전형적 구멍 · 못질» |
| `references/severity.md` | 등급 · 증거 수준 · 상태(정책 만료) · 발견 번호와 지문 · 보고 서식 |
| `references/generators.md` | 산출물 생성기 만드는 법 |
| `templates/` | 검수 기록·검수 대장·발견 대장·설정·새 축·사례 서식 |
| `scripts/audit-check.mjs` | 산출물 신선도 + 대장 썩음(구역·공용 파일·카탈로그·기간) + 발견 대장(정책 만료) 검사기 |
| `scripts/skill-lint.mjs` | 카탈로그·사례가 서식을 지키는지 검사 |
| `scripts/bundle.mjs` | 스킬 전체를 md 한 장(`axis-audit-bundle.md`)으로 싸고 되푸는 도구 |
| `cases/` | **실제로 잡은 사례** — 어느 프로젝트에서 어느 축으로 무엇을 잡았나 |
| `CONTRIBUTING.md` | **다른 프로젝트에서 배운 것을 여기에 올리는 법** |

## 왜 이렇게 만들었나

시험은 기능 단위로 촘촘해질 뿐, **시험이 지나가지 않는 방향**에는 닿지 않는다.
«검수 끝냈는데 새 축으로 보면 또 나온다» 는 덜 훑었거나, 한 사람의 눈으로만 봤거나, 찾은 것을 확인하지 않았거나,
«검수 완료» 의 뜻이 없었기 때문이다. 그래서 이 스킬은 (1) 축과 시선을 명시적으로 세어 두고 (2) 시선 × 축을 전부 도는 것을 기본으로 하며
(3) 찾은 것은 다른 검증자가 돌려서 증거를 매기고 (4) 훑은 자리와 발견을 대장에 남기고 (5) 새로 배운 축·구멍을 다시 카탈로그로 되돌린다.

### 이 구성이 어디서 왔나 (근거)

- **시선** — 역할을 나눠 읽게 하면 점검표 하나보다 결함을 더 찾는다: 관점 기반 읽기(Basili 외, 1996)
- **축** — 시험 설계의 제품 요소 점검틀(Bach, Heuristic Test Strategy Model)과 상태 전이·경계값 기법을 업무 시스템에 맞게 풀어 씀
- **유도어** — 공정 위험 분석 HAZOP(IEC 61882)의 «없음·더 많이·거꾸로·일찍/늦게…» 를 목록 항목마다 대입
- **«혼자만 다른 칸»** — 여러 곳 중 하나만 다르면 버그일 확률이 높다(Engler 외, *Bugs as Deviant Behavior*, SOSP 2001)
- **등급** — 도달 가능성 × 되돌릴 수 있나 × 알아챌 수 있나 = FMEA 의 발생도·심각도·검출도
- **다른 검증자가 돌려 보기** — 외부 근거 없는 LLM 자기 교정은 잘 듣지 않는다(Huang 외, 2023, arXiv:2310.01798)
- **기각 상태 · 적중률 · 인용 실재 확인 · 보고 상한 · 반박부터** — AI 검수 도구 사용자들의 가장 흔한 불만(사소한 지적 사이에 진짜가 묻힘, 지어낸 함수 이름,
  같은 지적 반복)과 호평(사람이 «틀렸다» 고 표시한 것에서 배우기, 경로별 지시)에서 가져옴. 검색 요약 기준이며 다수가 업체 글·개인 경험담이다
