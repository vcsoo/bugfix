# 축 검수기 (axis-audit) — 합본 한 장

이 파일 하나에 스킬 전체가 들어 있다. 그대로 읽어도 되고, 폴더로 되풀어도 된다.

**되푸는 법** — 이 파일을 `axis-audit-bundle.md` 로 저장한 뒤:

```sh
# 아래 «scripts/bundle.mjs» 내용을 bundle.mjs 로 저장하고
node bundle.mjs --unpack axis-audit-bundle.md --into axis-audit
```

또는 AI 에게: «이 합본을 파일 경로대로 풀어서 저장소에 올려 줘» (각 파일 앞의 `<!-- file: … -->` 가 경로다)

| 파일 | |
|---|---|
| `.gitattributes` | |
| `cases/2026-09-17-groupware-leave-double-count.md` | |
| `cases/README.md` | |
| `CONTRIBUTING.md` | |
| `README.md` | |
| `references/axes.md` | |
| `references/generators.md` | |
| `references/severity.md` | |
| `scripts/audit-check.mjs` | |
| `scripts/bundle.mjs` | |
| `scripts/skill-lint.mjs` | |
| `SKILL.md` | |
| `templates/audit.json` | |
| `templates/AUDIT.md` | |
| `templates/axis-template.md` | |
| `templates/case-template.md` | |
| `templates/LEDGER.md` | |

---

<!-- file: .gitattributes -->
````````
* text=auto eol=lf
````````

<!-- file: cases/2026-09-17-groupware-leave-double-count.md -->
````````markdown
# 겹친 휴가 신청으로 연차가 두 번 깎였다 — 2026-09-17

| | |
|---|---|
| **프로젝트 성격** | 사내 업무 시스템 (결재·휴가·인사) |
| **축** | 5 불변식 · 2 입구 |
| **등급** | 치명 |

## 무엇을 어떻게 찾았나
데이터 축으로 «휴가 표에 쓰는 코드 지점» 을 전수로 뽑았더니 **세 곳**이었다(새 신청·재상신·관리자 등록).
그런데 «같은 기간에 이미 낸 휴가가 있는지» 를 보는 검사는 **한 곳에만** 있었다.
나머지 두 입구로 같은 날짜를 두 번 신청하면 승인이 되고, 연차가 두 번 차감됐다.

## 왜 시험이 못 잡았나
시험이 **입구별로** 있었기 때문이다. 세 입구 각각의 «정상 신청» 은 모두 통과했다.
어떤 시험도 «세 입구가 같은 규칙을 지키는가» 를 묻지 않았다 — 그 질문은 입구 축으로 훑기 전에는 나오지 않는다.

## 어떻게 막았나
겹침 판정을 **함수 하나(관문)** 로 만들어 세 입구가 모두 부르게 했다.
그 함수는 질의문 조건만 믿지 않고 **가져온 기간을 코드에서 다시 비교**한다(경계 조건에서 질의문이 놓치는 경우가 있었다).
반차 오전/오후처럼 겹쳐도 되는 경우는 함수 안에서 예외로 두었다 — 예외가 밖에 흩어지면 다음 입구에서 또 빠진다.
재현 시험 3개(입구마다 하나)를 남겼다.

## 다른 프로젝트에 옮길 수 있는 교훈
- **같은 규칙을 지키는 입구가 몇 개인지부터 센다.** 하나라도 관문을 안 거치면 규칙은 없는 것이다.
- 「질의문에서 걸렀으니 안전」은 위험하다. **가져온 값으로 한 번 더** 판단하면 경계 사고를 막는다.
- 입구가 늘어날 때 자동으로 실패하도록, «관문을 부르는 곳의 수» 를 세는 시험을 둔다.
````````

<!-- file: cases/README.md -->
````````markdown
# 사례 — 실제로 잡은 것

축이 살아 있으려면 «이 방향으로 봤더니 진짜 나왔다» 가 쌓여야 한다.
파일 이름: `YYYY-MM-DD-<프로젝트성격>-<한단어>.md` · 서식: `../templates/case-template.md`

**회사·사람 이름, 실제 데이터, 내부 주소, 비밀값은 적지 않는다.** 구조와 교훈만 남긴다.
같은 «전형적 구멍» 에 사례가 3개 쌓이면 새 축으로 올릴지 검토한다(→ `../CONTRIBUTING.md`).
````````

<!-- file: CONTRIBUTING.md -->
````````markdown
# 이 검수기에 «배운 것» 을 올리는 법

다른 프로젝트에서 검수하다 보면 **여기 없는 축**이나 **여기 없는 구멍**을 만난다.
그것을 되돌려 놓지 않으면 다음 프로젝트에서 같은 것을 또 처음부터 찾는다.
이 문서 하나만 읽고 그대로 따라 하면 된다.

> **AI 에게**: 검수를 끝냈다면 이 문서를 읽고 **마지막 단계로 여기에 되돌리기** 를 제안하라.
> 저장소가 붙어 있지 않으면, 아래 서식대로 **붙일 수 있는 파일 내용**을 만들어 사람에게 건네라.

## 0. 먼저 고른다 — 셋 중 무엇인가

| 상황 | 할 일 | 걸리는 시간 |
|---|---|---|
| 기존 축으로 잡았다 | **사례만** 추가 (`cases/`) + 그 축의 «전형적 구멍» 에 한 줄 | 5분 |
| 기존 축에 안 들어간다 | **새 축** 추가 (`references/axes.md`) + 사례 1개 | 20분 |
| 절차 자체가 부족했다 | `SKILL.md` 고침 + **왜 그렇게 바꿨는지** 사례로 | 20분 |

애매하면 **사례만** 올린다. 사례가 셋 넘게 쌓이면 그때 축으로 올리면 된다.
축을 함부로 늘리면 «전 축 돌기» 가 무거워져 아무도 안 돈다.

## 1. 사례 추가 (거의 모든 경우 이것)

```sh
cp templates/case-template.md cases/$(date +%Y-%m-%d)-<프로젝트>-<한단어>.md
```

채울 것은 여섯 줄뿐이다: **어떤 프로젝트 · 어느 축 · 무엇을 어떻게 찾았나 · 왜 시험이 못 잡았나 ·
어떻게 막았나 · 다른 프로젝트에 옮길 수 있는 교훈**.
마지막 칸이 핵심이다 — **그 프로젝트에서만 통하는 이야기는 여기 올리지 않는다.**

그리고 그 축의 «전형적 구멍» 목록에 **한 줄**을 더한다(이미 비슷한 줄이 있으면 더하지 않는다).

## 2. 새 축 추가

1. `templates/axis-template.md` 를 열어 네 칸을 채운다
   — **무엇을 전수로 세나 / 뽑는 법 / 전형적 구멍 / 못질**. 네 칸이 다 차지 않으면 아직 축이 아니다.
2. `references/axes.md` 의 **표에 한 줄**, 본문 **맨 끝 «넓힘 축» 구역에 한 절**을 더한다.
   번호는 마지막 번호 + 1 (번호는 다시 쓰지 않는다 — 옛 대장이 그 번호를 가리키고 있다).
3. 그 축으로 실제로 잡은 **사례 1개**를 함께 올린다. 사례 없는 축은 받지 않는다.
4. «프로젝트 성격별 — 먼저 볼 축» 표에 들어갈 자리가 있으면 거기도 한 줄.

**축이 되는 조건** (셋 다 맞아야 한다)
- **전수로 셀 수 있다** — 목록을 코드에서 뽑을 수 있다
- **기존 축으로는 안 보인다** — 다른 축을 돌아도 이 구멍은 안 나온다
- **한 번 이상 실제로 잡았다** — 상상이 아니라 사례가 있다

## 3. 올리기 전 검사 (필수)

```sh
node scripts/skill-lint.mjs
```

표와 본문의 축 수가 맞는지, 축마다 네 칸이 있는지, 번호가 겹치지 않는지,
사례가 서식을 지키는지 본다. **통과해야 올린다.**

## 4. 커밋·올리기

여러 프로젝트·여러 AI 도구가 같은 저장소에 올린다. 그사이 누가 먼저 올렸을 수 있으므로 **받아서 합친 뒤에 올린다.**
명령은 이 저장소 폴더 안에서 돌린다(프로젝트에서 받았다면 `.axis-audit/` 안).

```sh
node scripts/bundle.mjs                # 합본(axis-audit-bundle.md)도 새로 만든다
git add -A
git commit -m "축 13 기록·추적 추가 — <프로젝트 성격>에서 삭제 이력 누락을 잡음"
git pull --rebase                      # 남이 올린 것 위에 내 커밋을 얹는다
node scripts/skill-lint.mjs            # 합친 뒤에도 맞는지 다시 본다
git push
```

커밋 한 줄 서식: **`<무엇을 바꿨나> — <어디서 배웠나>`**.
어디서 배웠는지가 없으면 나중에 그 줄을 믿을지 판단할 수 없다.

**부딪혔을 때**
- 합본이 충돌하면 손으로 고치지 않는다 — `node scripts/bundle.mjs` 로 다시 만들고 `git add axis-audit-bundle.md` → `git rebase --continue`.
- 합친 뒤 skill-lint 가 **축 번호 겹침**을 알리면, 늦게 올리는 쪽이 자기 축을 다음 번호로 민다.
- push 가 거절되면 `git pull --rebase` 부터 다시 한다. **`--force` 는 쓰지 않는다** — 남이 올린 배움이 지워진다.

## 5. 되돌아보기 (분기에 한 번)

- 사례가 3개 이상 쌓인 «전형적 구멍» 줄은 → **축으로 올릴지** 검토
- 1년 동안 한 번도 안 걸린 축은 → 지우지 말고 **«드묾» 표시** (지우면 그 방향이 다시 사각지대가 된다)
- `SKILL.md` 절차에서 자꾸 빠뜨리는 단계가 있으면 → 절차를 고친다, 사람을 탓하지 않는다

## 하지 말 것

- **프로젝트 이름·내부 사정·실데이터를 그대로 옮기지 않는다.** 사례는 «무엇이 어떻게» 만 적는다
  (회사·사람 이름, 실제 값, 내부 주소, 비밀값은 빼고 쓴다)
- 축을 늘리기 위해 축을 만들지 않는다 (위의 «축이 되는 조건» 셋)
- 남의 사례를 지우지 않는다 — 틀렸으면 **정정 줄**을 밑에 더한다
````````

<!-- file: README.md -->
````````markdown
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
````````

<!-- file: references/axes.md -->
````````markdown
# 축 카탈로그

축마다 네 칸이다: **무엇을 전수로 세나 / 뽑는 법 / 전형적 구멍 / 못질**.
**기본은 전 축을 도는 것**이고, 위에서부터 순서대로 돈다(앞쪽 축이 피해가 크고, 뒤 축의 판단 근거가 된다).

축을 건너뛰어야 한다면 **왜 건너뛰는지** 를 대장에 적는다 — 말없이 빠진 축이 다음 «또 나왔다» 의 씨앗이다.

축은 **늘어난다.** 다른 프로젝트에서 «이 방향으로 봤더니 나왔다» 가 생기면 축으로 올려 이 문서에 더한다
(→ `CONTRIBUTING.md`). 지금 20개다.

## 핵심 축 (1~12) — 어떤 프로젝트에서도 돈다

| # | 축 | 한 줄 | 없으면 생기는 일 |
|---|---|---|---|
| 1 | 데이터 | 저장소 × 그것을 쓰는 코드 | 조용히 틀어진 값 · 고아 데이터 |
| 2 | 입구 | 같은 일을 하는 모든 진입점 | 관문이 한 입구에만 걸려 우회 |
| 3 | 상태 | 상태 × 사건 격자 | 중간 상태에서의 사고 |
| 4 | 권한 | 주체 × 자원 × 동작 | 남의 데이터가 샌다 |
| 5 | 불변식 | 늘 참이어야 하는 수식 | 이중 차감 · 합계 안 맞음 |
| 6 | 시간 | 경계·시간대·스케줄 | 월말·자정·연말에만 나는 버그 |
| 7 | 바깥효과 | 나가면 못 되돌리는 것 | 이중 발송 · 롤백해도 나간 메일 |
| 8 | 실패 | 중간에 끊겼을 때 | 반쯤 처리된 채로 «성공» |
| 9 | 신뢰경계 | 바깥에서 들어오는 값 | 주입 · 스크립트 삽입 · 대용량 |
| 10 | 동시성 | 같은 자원 동시 접근 | 중복 생성 · 덮어쓰기 |
| 11 | 설정·환경 | 스위치·버전·환경 차이 | 껐는데 어딘가에서 보임 |
| 12 | 사람 | 실제 사용 흐름·되돌리기 | 막다른 길 · 입력 소실 |

## 넓힘 축 (13~20) — 프로젝트 성격에 따라 반드시 돈다

| # | 축 | 한 줄 | 없으면 생기는 일 |
|---|---|---|---|
| 13 | 기록·추적 | 무엇이 로그·이력에 남나 | 사고가 나도 누가 언제 했는지 모른다 |
| 14 | 규모·성능 | 줄 수가 10배가 되면 | 어느 날 갑자기 느려지고 멈춘다 |
| 15 | 보존·파기 | 언제까지 갖고 있나 | 지워야 할 개인정보가 영원히 남는다 |
| 16 | 계약 일치 | 문서·화면 문구 vs 실제 동작 | 「된다고 적힌 것」이 안 된다 |
| 17 | 배포·되돌리기 | 올릴 때와 되돌릴 때 | 배포 한 번에 서비스가 멈춘다 |
| 18 | 죽은 것 | 안 쓰이는 코드·화면·설정 | 고칠 때마다 헛다리 · 되살아나는 버그 |
| 19 | 공급망 | 바깥에서 가져다 쓰는 것 | 남의 코드가 우리 구멍이 된다 |
| 20 | 표현·현지화 | 숫자·날짜·글자·화폐 표기 | 금액이 1000배로 보인다 |

---

## 1. 데이터 축 — 저장소 × 그것을 쓰는 코드

**전수 목록**: 모든 테이블·컬렉션·파일 저장소, 그 칸 하나하나, 그리고 **그 각각에 쓰는 모든 코드 지점**.

**뽑는 법**: 스키마 정의(마이그레이션·DDL·모델 파일)에서 표를 뽑고, 저장소 이름으로 코드를 훑어
«읽는 곳 / 쓰는 곳 / 지우는 곳» 을 표로 만든다. 결과물은 ERD + **CRUD 표(저장소 × 코드 지점)**.

**전형적 구멍**
- 쓰는 곳이 N개인데 **검증은 1곳에만** ← 가장 많이 나온다. 축 2와 짝지어 본다
- 부모를 지웠는데 자식이 남는다(고아 행) / 참조 무결성이 코드에만 있고 DB 에는 없다
- 같은 뜻의 값이 두 곳에 산다(문서와 내역, 요약칸과 원본) — **어느 쪽이 진짜인가**
- 단위·형이 섞인다(원/천원, 문자열 날짜/날짜형, NULL 과 빈 문자열의 뜻 차이)
- 기본값이 코드마다 다르다 / 쓸 때만 넣고 마이그레이션은 빠뜨린 칸
- 지우는 규칙이 없는 표 — 영원히 자란다(첨부·로그·임시저장)

**못질**: 생성되는 ERD·데이터 사전 + 새 표가 분류에 없으면 멈추는 생성기.
실데이터를 **읽기만** 하는 정합성 점검 화면(고아 행·짝 안 맞는 행 세기).

---

## 2. 입구 축 — 같은 일을 하는 모든 진입점

**전수 목록**: 한 가지 «업무»(예: 휴가 신청)를 일으킬 수 있는 **모든 경로** —
화면 폼, API, 일괄 업로드(엑셀·CSV), 관리자 화면, 배치·스케줄러, 마이그레이션 스크립트,
콘솔·수동 SQL, 외부 연동(웹훅), 재시도·재상신 같은 «두 번째 경로».

**뽑는 법**: 업무마다 핵심 저장소에 쓰는 코드 지점을 모으고(축 1의 CRUD 표), 각 지점이
**어떤 검증을 통과했는지** 를 칸으로 적는다. 표가 채워지지 않는 칸이 구멍이다.

**전형적 구멍**
- 화면에서만 막고 서버·API 에서 안 막는다 (화면만 믿으면 막은 것이 아니다)
- 일괄 업로드·관리자 화면이 검증을 통째로 건너뛴다
- «재시도/재상신/복사해서 새로 만들기» 경로가 원래 경로의 규칙을 빠뜨린다
- 같은 계산이 세 곳에 복사돼 하나만 고쳐졌다

**못질**: 규칙을 **한 함수(관문)** 로 모으고, 모든 입구가 그것을 부르는지 시험으로 센다
(«이 규칙을 부르는 곳이 N개» 를 세는 시험은 경로가 늘 때 자동으로 실패한다).

---

## 3. 상태 축 — 상태 × 사건 격자

**전수 목록**: 상태를 가진 모든 것(문서·주문·계정·작업)의 **상태 값 전부 × 일어날 수 있는 사건 전부**.

**뽑는 법**: 상태 값은 코드의 상수·enum·DB 체크 제약에서, 사건은 그 상태를 바꾸는 코드 지점에서 뽑는다.
격자를 만들어 칸마다 «허용 / 막음 / 정의 없음» 을 적는다. **«정의 없음» 이 구멍이다.**

**전형적 구멍**
- 취소·반려 뒤에 다시 승인된다 / 이미 끝난 것이 또 처리된다
- 되돌리기가 없다(승인은 되는데 승인 취소는 없다) 또는 되돌려도 부수효과가 안 돌아온다
- 중간 상태에서 관련자가 사라진다(퇴사·삭제된 결재자·담당자)
- 상태는 바뀌었는데 짝인 다른 표는 안 바뀐다(문서는 취소인데 내역은 살아 있다)
- 마지막 단계에서만 검사하는 규칙 — 중간에 값이 바뀌면 통과

**못질**: 생성되는 상태 전이표 + 격자의 «허용» 칸마다 시험 1개.
전이를 한 함수로 모으고 그 밖에서 상태 칸을 직접 쓰지 못하게 한다.

---

## 4. 권한 축 — 주체 × 자원 × 동작

**전수 목록**: 역할·권한 종류 전부 × 자원(화면·자료) 전부 × 동작(보기·만들기·고치기·지우기·내려받기) 전부.
**본인/남** 구분이 있는 자원은 그것도 한 칸이다.

**뽑는 법**: 권한 판정 함수를 모두 찾아 «어디서 부르는가» 를 표로 만든다.
권한이 여러 층(역할 열 + 권한표 + 설정값 + 코드 고정)이면 **층마다 따로** 적고 우선순위를 밝힌다.

**전형적 구멍**
- 목록은 막았는데 **상세·인쇄·내려받기·통합검색·자동완성** 은 안 막았다
- 주소를 직접 치면 열린다(식별자만 바꾸면 남의 것)
- 숨긴 메뉴가 검색 결과·알림·통계 숫자로 새어 나온다
- «관리자만 쓰는 화면» 이라는 가정 — 실제로는 누구나 열 수 있다
- 개인 데이터인데 로그인 본인 기준이 아니라 «화면에서 고른 사람» 기준이다
- 권한이 꺼진 뒤에도 옛 알림·링크로 접근된다

**못질**: 생성되는 권한 매트릭스 + «모든 진입점이 판정 함수를 부르는가» 를 세는 시험.
새 화면이 생기면 표에 없다고 생성기가 멈추게 한다.

---

## 5. 불변식 축 — 늘 참이어야 하는 수식

**전수 목록**: 수·돈·잔량에 관한 문장 전부.
«잔여 = 부여 − 사용», «합계 = 부분합», «재고 ≥ 0», «한 사람 한 표», «기간이 겹치지 않는다».

**뽑는 법**: 화면에 숫자가 나오는 자리마다 «이 숫자는 무엇의 합인가» 를 묻고 수식으로 적는다.
그 수식을 **실데이터로 세어 보는 읽기 전용 점검**을 만든다.

**전형적 구멍**
- 두 경로에서 각각 차감 → **이중 차감**(겹친 신청·재시도·동시 제출)
- 반올림·절사 위치가 달라 합계가 1 틀린다 / 단위가 섞인다
- 취소했는데 되돌아오지 않는 수량
- 음수 방지가 화면에만 있다
- 요약 칸(집계 컬럼)과 원본을 각각 갱신하다 어긋난다

**못질**: 불변식마다 (1) 쓰기 경로에서 막는 관문 (2) 실데이터를 읽기만 하는 점검 (3) 재현 시험.

---

## 6. 시간 축 — 경계·시간대·스케줄

**전수 목록**: 날짜·시각을 다루는 모든 계산, 정기 작업 전부, 기간이 있는 자료 전부.

**뽑는 법**: 날짜 함수·now·오늘을 부르는 지점을 모두 모은다. 기간 자료는 «겹침 판정» 이 있는지 본다.

**전형적 구멍**
- **경계**: 시작일 == 종료일, 하루짜리, 자정, 월말·연말, 윤년, 주말·공휴일
- **시간대**: 서버·DB·브라우저가 서로 다른 시간대 / 날짜만 저장하는데 시각으로 비교
- **겹침**: 기간이 겹치는지 SQL 로만 판단하고 코드에서 재확인하지 않는다(혹은 반대)
- 스케줄이 두 번 돌거나(재시작) 한 번도 안 돈다(실패 후 조용히 종료)
- «오늘» 기준 계산이 과거 데이터를 다시 계산할 때 틀린다
- 마감·유효기간이 지난 뒤에도 남아 있는 링크·토큰

**못질**: 날짜 계산을 한 곳으로 모으고 **경계값 시험**(시작=종료, 월말, 연말, 윤년)을 고정으로 둔다.
스케줄 작업은 멱등(두 번 돌아도 같은 결과)으로 만들고 그것을 시험한다.

---

## 7. 바깥효과 축 — 나가면 못 되돌리는 것

**전수 목록**: 메일·알림·문자·푸시·결제·외부 API·파일 내보내기·웹훅 — **바깥으로 나가는 모든 것**
× 그것을 일으키는 사건 × 받는 사람.

**뽑는 법**: 발송 함수를 찾아 부르는 지점을 모두 모아 «사건 → 받는 사람 → 경로» 표를 만든다.

**전형적 구멍**
- 트랜잭션이 실패해 되돌아가도 **메일은 이미 나갔다**(부작용을 커밋 전에 일으킨다)
- 재시도 때 또 보낸다 / 반대로 실패하면 영영 안 보낸다(조용한 누락)
- 퇴사·삭제된 사람, 권한이 사라진 사람에게 계속 나간다
- 같은 사건에 두 경로가 각각 보낸다(중복)
- 받는 사람 목록이 화면 표시와 실제 발송이 다르다
- 알림 문구에 **권한 없는 내용이 들어 있다**(제목만으로 새는 정보)

**못질**: 발송을 한 곳으로 모으고, 부작용은 **성공 확정 뒤에** 일으킨다.
시험에서는 발송을 가짜(mock)로 가로채 «몇 건, 누구에게» 를 센다.

---

## 8. 실패 축 — 중간에 끊겼을 때

**전수 목록**: 여러 단계를 한 업무로 묶는 모든 지점(2회 이상 쓰기, 외부 호출 뒤 저장, 파일+DB).

**뽑는 법**: 각 업무를 «단계 1, 2, 3…» 으로 적고 **각 단계 뒤에서 끊겼다고 가정**한다.
남는 것이 무엇인지, 사용자가 무엇을 보는지 적는다.

**전형적 구멍**
- 반쯤 처리된 채로 «성공» 화면 / 반대로 성공했는데 오류로 보여 사용자가 또 누른다
- 파일은 저장됐는데 DB 행이 없다(또는 반대) — 축 1의 고아 데이터가 여기서 생긴다
- 재시도에 멱등키가 없어 두 번 만들어진다
- 오류를 삼킨다(빈 catch) — 실패가 조용히 성공으로 보인다
- 부분 실패를 사용자에게 안 알린다(10건 중 3건 실패했는데 «완료»)

**못질**: 다단계 쓰기는 트랜잭션으로 묶거나, 못 묶으면 **순서를 바꿔** 되돌릴 수 있는 것부터 한다.
일괄 처리는 «성공 n · 실패 m · 이유» 를 반드시 돌려주고, 그것을 시험이 확인한다.

---

## 9. 신뢰경계 축 — 바깥에서 들어오는 값

**전수 목록**: 사용자·외부에서 값이 들어오는 모든 지점(폼·쿼리스트링·헤더·쿠키·업로드·웹훅·붙여넣기).

**뽑는 법**: 입력을 읽는 함수를 찾아 부르는 지점을 모으고, 지점마다
«검증 / 이스케이프 / 크기 제한» 세 칸을 채운다.

**전형적 구멍**
- 질의문에 값을 이어 붙인다(주입) — 한 곳만 있어도 치명
- 출력에서 이스케이프를 빠뜨린다(스크립트 삽입). 특히 **사용자가 넣은 이름·제목**
- 식별자를 그대로 믿는다(남의 번호를 넣으면 열린다) → 축 4와 짝
- 업로드: 형식·용량·확장자·저장 경로(경로 탈출)·실행 가능 파일
- 길이 제한이 화면에만 있어 DB 에서 잘리거나 오류가 난다
- 인코딩·제어문자·줄바꿈이 구분자와 겹친다(CSV·탭 구분)

**못질**: 입력 읽기와 출력 이스케이프를 각각 한 함수로 강제하고,
«직접 이어 붙인 질의문이 없다» 같은 금지 패턴을 정적 검사로 못질한다.

---

## 10. 동시성 축 — 같은 자원 동시 접근

**전수 목록**: 두 사람(또는 같은 사람의 두 창)이 동시에 건드릴 수 있는 자원 전부.

**뽑는 법**: «읽고 → 판단하고 → 쓴다» 패턴을 찾는다. 그 사이에 남이 끼어들면 무슨 일이 나는지 적는다.

**전형적 구멍**
- 중복 제출(버튼 두 번·새로고침) — 같은 것이 둘 만들어진다
- 번호·차수 매기기: `MAX+1` 을 읽고 쓰는 사이에 겹친다
- 잔량 검사와 차감이 떨어져 있어 둘 다 통과한다(축 5의 이중 차감)
- 나중에 연 창이 먼저 연 창의 수정을 덮어쓴다(경고 없이)

**못질**: 유일성은 **DB 제약**으로 (코드 검사만으로는 못 막는다).
제출 잠금은 화면에서, 진짜 방어는 서버에서. 재현 시험은 «같은 요청 두 번» 으로 대신할 수 있다.

---

## 11. 설정·환경 축 — 스위치·버전·환경 차이

**전수 목록**: 기능 스위치·설정값 전부 × 그것을 보는 코드 지점 전부. 환경별 차이(개발·운영), 외부 의존 버전.

**뽑는 법**: 설정을 읽는 함수의 **인자(키 문자열)** 를 모두 모아 목록을 만들고, 키마다 «읽는 곳» 을 센다.
스위치는 «끈 상태로 화면을 한 바퀴 그려 보는» 것이 가장 확실하다.

**전형적 구멍**
- 스위치를 껐는데 **어떤 화면·검색·통계·내려받기에는 여전히 보인다**
- 설정값에 기본값이 없어 새 환경에서만 터진다 / 기본값이 코드마다 다르다
- 운영에만 있는 데이터·권한을 전제한 코드
- 비밀값이 저장소에 들어 있다 / 로그에 찍힌다
- 스키마 마이그레이션이 한 방향뿐이라 되돌릴 수 없다

**못질**: 스위치마다 «이 스위치를 보는 곳» 목록을 생성하고, 새 화면이 그 목록에 없으면 실패하게 한다.

---

## 12. 사람 축 — 실제 사용 흐름 (유스케이스)

**전수 목록**: 사람이 실제로 하려는 일 × **예외 흐름**. 정상 흐름만 적으면 수확이 거의 없다.

**뽑는 법**: 역할별로 «무엇을 하러 오는가» 를 5~10개 적고, 각각에 대해
«중간에 멈추면 / 값이 틀리면 / 권한이 없으면 / 자료가 없으면 / 두 번 하면» 을 묻는다.

**전형적 구멍**
- 되돌릴 방법이 없다(잘못 눌렀을 때 사람이 손쓸 수가 없어 관리자를 부른다)
- 막다른 길(오류 화면에서 돌아갈 곳이 없다) / 빈 목록에 다음 할 일이 없다
- 새로고침·뒤로가기로 입력이 날아간다
- 오래 걸리는 동작에 진행 표시가 없어 멈춘 줄 알고 또 누른다 → 축 10과 짝
- 실수하기 쉬운 기본값(가장 흔한 사람이 미리 골라져 있다)
- 화면에는 있는데 실제로는 아무도 안 쓰는 기능(정리 대상)

**못질**: 예외 흐름만 짧게 적은 유스케이스 문서 + 화면 시험.
프로젝트에 «사용성 규칙» 문서가 있으면 그 규칙 목록을 그대로 점검 항목으로 쓴다.

---

## 13. 기록·추적 축 — 무엇이 로그·이력에 남나

**전수 목록**: 중요한 동작 전부(승인·삭제·금액 변경·권한 변경·로그인·내보내기) × 그것이 남기는 기록.

**뽑는 법**: 기록 함수를 찾아 부르는 지점을 모으고, 반대로 **중요한 동작 목록**(축 3·4에서 이미 뽑았다)과
맞대 본다. 기록이 없는 동작이 구멍이다.

**전형적 구멍**
- 지우는 동작에 기록이 없다 — 사고가 나도 누가 언제 지웠는지 모른다
- 기록은 남는데 **무엇이 어떻게 바뀌었는지**(전/후)가 없어 쓸모가 없다
- 실패한 시도가 안 남는다(권한 거부·로그인 실패) — 공격도 실수도 안 보인다
- 반대로 **로그에 민감정보**가 찍힌다(비밀번호·주민번호·토큰) → 축 15와 짝
- 기록이 지워질 수 있다(같은 화면에서 이력까지 삭제)
- 시각이 서버 기준인지 사용자 기준인지 섞여 있다 → 축 6

**못질**: 중요한 동작 목록을 생성하고, «기록을 부르지 않는 동작» 이 생기면 실패하는 시험.

---

## 14. 규모·성능 축 — 줄 수가 10배가 되면

**전수 목록**: 목록 화면·조회·집계·반복문 전부. 특히 **자라기만 하는 표**(로그·첨부·알림·이력).

**뽑는 법**: 화면마다 «최악의 경우 몇 줄인가» 를 적는다. 반복문 안에서 조회하는 곳(N+1)을 찾는다.
지금 실데이터의 줄 수를 세어 본다(읽기만).

**전형적 구멍**
- 반복문 안 조회(N+1) — 10줄일 때는 안 보이고 1000줄에서 멈춘다
- 페이지 나눔 없이 전부 그린다 / «전체 보기» 가 그대로 살아 있다
- 자주 거르는 칸에 인덱스가 없다 · 인덱스는 있는데 함수로 감싸 못 쓴다
- 집계를 화면 열 때마다 한다(캐시·요약칸 없음)
- 지우는 규칙이 없는 표가 성능 문제로 돌아온다 → 축 1
- 시간 제한(타임아웃)·파일 크기 제한이 없어 한 요청이 전체를 막는다

**못질**: 최악 줄 수를 정해 두고 그 수만큼 넣은 시험 데이터로 화면을 그려 보는 시험.
느린 조회 목록을 산출물로 남긴다.

---

## 15. 보존·파기 축 — 언제까지 갖고 있나

**전수 목록**: 개인정보·민감정보가 든 저장소·파일·로그 전부 × 보존기간 × 파기 방법.

**뽑는 법**: 축 1의 표 목록에 «개인정보 포함? 보존기간? 누가 지우나?» 세 칸을 더한다.

**전형적 구멍**
- 퇴사자·탈퇴자 정보가 영원히 남는다 / 반대로 지웠더니 회계 이력이 깨진다
- 백업·내보낸 엑셀·임시 파일에 사본이 남는다(«지웠다» 가 사실이 아니다)
- 로그에 민감정보가 찍혀 보존기간을 초과한다
- 파기 요청을 받을 창구·절차가 없다
- 암호화해야 할 값이 평문이다(주민번호·계좌·토큰)

**못질**: 표별 보존 정책을 산출물로 만들고, 새 표가 생기면 정책 칸이 비었다고 생성기가 멈춘다.
**파기는 자동으로 돌리지 말고** 사람이 누르는 화면으로 만든다.

---

## 16. 계약 일치 축 — 적힌 것과 실제 동작

**전수 목록**: 바깥에 «이렇게 된다» 고 말한 것 전부 — API 문서, 사용 안내, 화면 문구·도움말,
오류 메시지, 이 프로젝트의 규칙 문서, 엑셀 양식·서식 파일.

**뽑는 법**: 문구를 모아 놓고 **실제 코드가 하는 일**과 한 줄씩 맞댄다.
문구가 곧 약속이므로, 다른 곳은 둘 중 하나가 버그다.

**전형적 구멍**
- 화면 안내는 «선택» 인데 서버는 필수(또는 반대)
- 업로드 양식의 열 차례가 실제 파서와 다르다 — 조용히 한 칸씩 밀려 들어간다
- 오류 메시지가 실제 원인과 다르다(사람이 엉뚱한 곳을 고친다)
- API 문서의 필드·형·필수 여부가 구현과 다르다
- 규칙 문서에 «이렇게 한다» 고 적힌 것이 코드에는 없다

**못질**: 문구와 동작을 같은 시험 안에서 함께 확인한다
(예: 양식의 머리글 목록과 파서의 열 차례를 한 시험이 같이 본다).

---

## 17. 배포·되돌리기 축 — 올릴 때와 되돌릴 때

**전수 목록**: 배포 절차의 모든 단계, 스키마 변경 전부, 되돌리기 경로.

**뽑는 법**: «지금 이 커밋을 되돌리면 무슨 일이 나는가» 를 변경마다 묻는다.

**전형적 구멍**
- 스키마 변경이 한 방향뿐이라 되돌릴 수 없다 / 칸을 지워 옛 코드가 깨진다
- 배포 순서 의존(코드 먼저면 터지고 스키마 먼저면 괜찮은데 순서가 안 정해져 있다)
- 배포 중 잠깐 두 버전이 동시에 도는 것을 고려하지 않았다
- 마이그레이션이 여러 번 돌면 망가진다(멱등하지 않다) → 축 8
- 되돌린 뒤 데이터가 새 형식으로 남아 있다
- 배포가 실패했는데 실패인 줄 모른다(알림 없음)

**못질**: 스키마 변경은 «더하기 → 옮기기 → 지우기» 를 다른 배포로 나눈다.
마이그레이션을 두 번 돌리는 시험.

---

## 18. 죽은 것 축 — 안 쓰이는 코드·화면·설정

**전수 목록**: 화면·함수·설정 키·표·파일 전부 × «부르는 곳이 있나».

**뽑는 법**: 이름으로 역참조를 세어 0인 것을 모은다. 실서버 접근 로그가 있으면 «안 열린 화면» 도 본다.

**전형적 구멍**
- 옛 화면이 살아 있어 **옛 규칙으로 데이터를 만든다** ← 가장 위험하다. 축 2와 짝
- 꺼 둔 기능의 잔재가 검색·통계에 남는다 → 축 11
- 같은 일을 하는 함수가 둘 — 하나만 고쳐진다
- 아무도 안 읽는 설정 키(오타로 영영 기본값)
- 주석 처리된 코드 뭉치가 «진짜 규칙» 인 양 읽힌다

**못질**: 역참조 0인 목록을 산출물로 남기고, 지울 수 없으면 «남겨 두는 이유» 를 적는다.
지운 화면은 라우팅에서도 지운다(주소로 열리면 죽은 게 아니다).

---

## 19. 공급망 축 — 바깥에서 가져다 쓰는 것

**전수 목록**: 외부 라이브러리·CDN 스크립트·폰트·API·플러그인 전부 × 버전 × 어디에 쓰이나.

**뽑는 법**: 의존 선언 파일(lock 포함)에서 목록을 뽑고, 코드에서 **바깥 주소(http)** 를 훑어
선언에 없는 것(CDN 직접 호출)을 찾는다.

**전형적 구멍**
- 버전이 고정되어 있지 않다(어느 날 바깥이 바뀌어 우리 화면이 깨진다)
- 알려진 취약점이 있는 버전 / 오래 방치된 의존성
- CDN 에서 바로 불러 쓴다(그 서버가 죽으면 우리가 죽고, 바뀌면 우리가 바뀐다)
- 라이선스가 맞지 않는 것을 쓰고 있다
- 외부 API 가 느려지거나 죽었을 때의 대비가 없다 → 축 8

**못질**: 의존 목록을 산출물로 뽑고, 버전 고정·취약점 점검을 정기로 돌린다.
외부 스크립트는 우리 쪽에 내려받아 함께 배포한다.

---

## 20. 표현·현지화 축 — 숫자·날짜·글자·화폐

**전수 목록**: 화면에 값이 나오는 자리 전부 × 서식(숫자·날짜·통화·단위).

**뽑는 법**: 서식 함수(숫자·날짜 변환)를 부르는 지점을 모으고, **부르지 않고 그냥 찍는 자리**를 찾는다
— 서식을 안 거친 값이 표기 사고의 대부분이다.

**전형적 구멍**
- 단위가 섞인다(원/천원/만원) — 금액이 1000배로 보인다 → 축 5
- 소수점·자릿수 구분이 입력과 출력에서 다르다 / 반올림 위치가 다르다
- 날짜 표기가 화면마다 다르다(연-월-일, 월/일/연) → 축 6
- 글자 인코딩·정렬(한글 이름 정렬·검색, 대소문자·공백)
- 줄바꿈·탭이 구분자와 겹쳐 내보내기 파일이 깨진다 → 축 9
- 빈 값 표시가 제각각(«-», «없음», 공백, 0)

**못질**: 서식 함수를 한 곳으로 모으고, 경계값(0, 음수, 큰 수, 빈 값) 시험을 고정으로 둔다.

---

## 프로젝트 성격별 — 먼저 볼 축

전 축을 도는 것이 기본이지만, 시간이 없으면 이 순서로 자른다.

| 성격 | 먼저 | 이유 |
|---|---|---|
| 사내 업무 시스템(결재·인사·회계) | 4 → 2 → 5 → 3 → 13 | 남의 데이터·이중 차감·추적 불가가 가장 아프다 |
| 공개 서비스·회원제 | 9 → 4 → 10 → 15 → 19 | 바깥에서 들어오는 값·권한·개인정보 |
| 결제·정산 | 5 → 8 → 7 → 10 → 20 | 돈은 되돌리기가 비싸고 표기가 곧 사고다 |
| 데이터 파이프라인·배치 | 8 → 6 → 1 → 14 → 17 | 중간 실패·시간 경계·규모 |
| 오래된 코드 인수인계 | 1 → 2 → 18 → 11 → 16 | 지도부터 그리고 죽은 것을 걷어낸다 |
| 사내 도구·관리자 화면 | 4 → 13 → 2 → 12 | 권한과 기록이 비어 있기 쉽다 |
````````

<!-- file: references/generators.md -->
````````markdown
# 산출물 생성기 만드는 법

손으로 그린 지도는 **두 번째 배포부터 거짓말을 한다.** 거짓말하는 산출물은 없는 것보다 나쁘다 —
그림을 믿고 코드를 짜면 조용히 틀린다. 그래서 **코드에서 뽑고, 시험이 일치를 지킨다.**

## 세 가지 원칙

1. **기계가 아는 것은 기계가 뽑는다** — 표·칸·상태 값·진입점·설정 키…
2. **사람만 아는 것만 손으로** — 분류, 의도, 정책, 「이건 일부러 이렇게 둠」.
   생성기 **위쪽의 표**에 모아 둔다.
3. **모르는 것이 생기면 멈춘다** — 코드에서 새 항목이 나왔는데 손으로 적는 표에 없으면
   생성기는 **오류로 끝난다**(exit 2). 그래야 «새로 만든 것을 산출물에 안 적는» 일이 구조적으로 막힌다.

## 뼈대

```js
/* 1. 사람이 아는 것 — 새 항목은 반드시 여기에 한 줄 */
const DOMAINS = [ /* 분류 · 설명 */ ];
const GUARD   = [ /* 읽기·쓰기 권한 같은 «의도» */ ];

/* 2. 코드에서 읽는다 — 스키마 정의 · 라우팅 · 상수 · 진입점 */
const found = parseFromSource(read('src/...'));

/* 3. 손표에 없는 항목이 나오면 멈춘다 */
const missing = found.filter(x => !DOMAINS.some(d => d.has(x)));
if (missing.length) { console.error('분류 표에 없는 새 항목: ' + missing.join(', ')); process.exit(2); }

/* 4. 파일로 쓴다. --check 면 «다르면 1» 로 끝낸다(파일은 건드리지 않는다) */
const out = render(DOMAINS, found);
if (process.argv.includes('--check')) process.exit(read(OUT) === out ? 0 : 1);
write(OUT, out);
```

## 파싱은 «정확히» 말고 «정직하게»

완벽한 파서를 만들려 하지 말 것. 정규식으로 충분하되, **못 읽은 것은 조용히 빠뜨리지 말고 오류로 낸다.**
조용히 빠뜨리는 파서가 가장 나쁘다 — 산출물이 «없다» 고 말해 버린다.

## 못질 (시험)

산출물마다 시험 하나를 둔다.

```js
// 1) 코드와 산출물이 일치하는가  → 생성기의 --check 를 부른다
// 2) 산출물에 있어야 할 것이 있는가 → 표·항목·그림이 비지 않았는지
// 3) 강제 장치가 살아 있는가       → «표에 없으면 멈춘다» 코드가 아직 있는지
```

세 번째를 빼먹으면, 누가 강제 장치를 지워도 아무도 모른다.

## 언어별 «어디서 뽑나»

| 무엇 | 흔한 출처 |
|---|---|
| 스키마·표 | 마이그레이션 파일, ORM 모델, DDL, `CREATE TABLE` 문자열, 스키마 자동생성 코드 |
| 진입점 | 라우팅 표, 컨트롤러 데코레이터, 파일 기반 라우트, 폼 `action`, 배치 등록부 |
| 상태 값 | enum·상수 객체, DB 체크 제약, 상태를 쓰는 대입문 |
| 권한 | 판정 함수 이름으로 역참조, 미들웨어 목록, 권한표 시드 데이터 |
| 발송 | 메일·알림 함수 이름으로 역참조 |
| 설정 | 설정 읽기 함수의 인자(키 문자열) 모으기 |

## 손으로 쓸 수밖에 없는 문서

유스케이스·정책 같은 것은 코드에서 못 뽑는다. 그러면 **짧게 쓰고 `watch` 로 감시한다** —
`audit.json` 에 그 문서가 «어느 코드를 비추는지» 적어 두면, 그 코드가 문서보다 새로울 때
검사기가 «썩음» 으로 알려 준다. 문서를 길게 쓰는 것보다 이 한 줄이 훨씬 오래 산다.
````````

<!-- file: references/severity.md -->
````````markdown
# 치명도 기준 · 보고 서식

## 등급

등급은 **«도달 가능성 × 되돌릴 수 있나 × 알아챌 수 있나»** 세 가지로 정한다.
«어렵고 복잡해 보인다» 는 등급의 근거가 아니다.

| 등급 | 뜻 | 보기 |
|---|---|---|
| **치명 C** | 평범한 사용으로 도달하고, 데이터가 조용히 틀어지거나 남의 자료가 새고, **되돌리기 어렵다** | 이중 차감, 남의 개인정보 노출, 결제 중복, 지워지면 끝인 데이터 삭제 |
| **높음 H** | 도달 가능하고 피해가 실질적이지만, 알아챌 수 있거나 손으로 복구 가능 | 특정 경로에서 검증 누락, 스위치 껐는데 검색에 노출, 알림 이중 발송 |
| **중간 M** | 도달 경로가 특수하거나(관리자만·희귀 조건), 곧 눈에 띈다 | 경계값 계산 오차, 고아 행 누적, 오류 메시지 부정확 |
| **낮음 L** | 불편·일관성·정리 | 문구 불일치, 죽은 코드, 중복된 유틸 |
| **잠재** | 코드상 위험해 보이나 **도달 경로를 확인하지 못함** | 재현 실패한 것은 전부 여기 |

**등급을 올리지 말 것.** 재현하지 못한 것은 «잠재» 다. 올렸다가 내리면 검수 전체의 신뢰가 깎인다
(한 번 «높음» 으로 올렸다가 «중간(잠재)» 로 내린 항목이 있으면, 사람은 나머지 등급도 의심한다).

## 상태 (사람이 정한다)

| 상태 | 뜻 |
|---|---|
| **고침** | 이번에 고쳤다 — 재현 시험 번호를 함께 적는다 |
| **정책** | 의도적으로 그렇게 둔 것 — **버그가 아니다.** 이유를 적어 두면 다음 검수에서 다시 안 올라온다 |
| **보류** | 인정하지만 지금은 안 고친다 — 왜, 그리고 무엇이 트리거가 되면 고칠지 |
| **사람이 실행** | 데이터 정리 등 자동으로 하면 안 되는 것 — 관리자 화면·스크립트를 만들어 넘겼다 |

## 항목 서식

항목마다 이 다섯을 반드시 적는다. 하나라도 비면 그 항목은 아직 **검수가 끝난 것이 아니다**.

```
### [C1] 한 줄 제목 — 축: 5 불변식 / 구역: 휴가
- **도달 경로**: 어떤 사람이 어떤 화면·API 에서 무엇을 하면 닿는가 (구체적으로)
- **재현**: 시험 파일·번호, 또는 «재현 실패 → 잠재»
- **피해**: 무엇이 틀어지나 · 되돌릴 수 있나 · 알아챌 수 있나
- **제안**: 어디를 어떻게 (한 곳에서 막는 방법 우선)
- **상태**: 고침 / 정책 / 보류 / 사람이 실행
```

## 보고할 때

- **치명도 순으로, 개수를 먼저.** «치명 1 · 높음 4 · 중간 7 · 낮음 3 · 잠재 2»
- 치명·높음은 **무엇을 하면 되는지**까지 한 줄로. 중간 이하는 목록으로 충분하다
- **고칠지 말지는 사람이 정한다.** 검수자는 «고쳤습니다» 가 아니라 «이런 것이 있습니다» 를 먼저 낸다
  (다만 명백한 치명 + 고치는 범위가 분명하면 고쳐서 함께 보고해도 된다)
- 정정이 생기면 **정정 항목을 따로 밝힌다** — 조용히 고쳐 쓰지 않는다

## 흔한 함정

- **개수 부풀리기**: 같은 원인 하나를 화면 수만큼 나눠 적지 않는다. 원인 1개 = 항목 1개, 영향 범위를 안에 적는다
- **«리팩터링하면 좋겠다» 를 버그로 올리기**: 그건 낮음이거나 검수 밖이다
- **도달 경로 없이 «위험해 보임»**: 잠재로 내리거나 확인할 때까지 보류
- **고치면서 훑기**: 훑기가 끊기고 목록이 비뚤어진다. 찾는 일과 고치는 일을 나눈다
````````

<!-- file: scripts/audit-check.mjs -->
````````javascript
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
const AXES = CFG.axes || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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
````````

<!-- file: scripts/bundle.mjs -->
````````javascript
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
````````

<!-- file: scripts/skill-lint.mjs -->
````````javascript
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

console.log('');
if (bad) { console.log('✗ 어긋남 ' + bad + '건 — 고친 뒤 올리세요 (CONTRIBUTING.md)'); process.exit(1); }
console.log('✓ 통과 — 올려도 됩니다');
````````

<!-- file: SKILL.md -->
````````markdown
---
name: axis-audit
description: 코드베이스를 12개 «축» 으로 한 번에 전수 훑어 단위시험이 놓친 구멍을 찾는 범용 검수 절차. 축 카탈로그·치명도 기준·검수 대장(어디까지 훑었나)·산출물 신선도 검사기를 함께 쓴다. 검수·감사·구조 점검, ERD·상태전이표·권한표·유스케이스 같은 산출물 만들기, «버그나 헛점 없는지 훑어 줘» 류 요청에 쓴다. audit, review, code audit, invariant, coverage gap, ERD, use case.
---

# 축 검수 (axis audit)

## 왜 «또» 나오는가

단위시험은 **기능 단위·경로 단위**다. 보통 그 기능을 만든 사람이 같은 머리로 쓴다.
그래서 시험은 «내가 생각한 경우» 로만 촘촘해진다 — 아무리 늘려도 그 방향뿐이다.
구멍은 **시험이 지나가지 않는 방향(축)** 에 있다.

«검수 끝냈는데 새 축으로 훑으면 또 나온다» 의 원인은 둘뿐이다.

1. **덜 훑었다** — 그때 훑은 축이 한둘이었다. 축이 12개면 열 방향이 그대로 남아 있다.
2. **«검수 완료» 의 뜻이 없었다** — 어느 구역을 · 어느 축으로 · 어느 깊이까지 훑었는지 기록이 없으니,
   그 뒤 코드가 바뀌어 다시 썩었는지도 알 수 없다.

그래서 이 스킬은 **한 번에 전 축을 훑는 것**을 기본으로 하고, 훑은 자리를
**검수 대장(`LEDGER.md`)** 에 «구역 × 축 × 깊이 × 그때 커밋» 으로 남긴다.
다음 검수는 처음부터가 아니라 **대장에서 썩은 칸만** 다시 훑는다.

## 언제

- «검수하자 / 헛점 없나 / 구조 점검해 줘 / 버그 훑어 줘» 같은 요청 — 기본은 **전수 검수**
- ERD·상태전이표·권한표·유스케이스 등 **산출물**을 만들거나 갱신할 때
- 큰 기능을 올린 직후, 오래된 코드를 넘겨받았을 때, 정기 점검

## 절차

### 0. 최신으로 받고, 규칙부터 확인 (건드리면 안 되는 것)
이 스킬 폴더가 git 으로 받은 것이면 **먼저 `git pull`** — 다른 프로젝트·다른 AI 도구가 더한 축·사례가 들어온다.
그다음 검수 대상 프로젝트의 규칙 문서(`CLAUDE.md`·`AGENTS.md`·`WORK-RULES.md`·`CONTRIBUTING.md` 등)를 읽는다.
**검수는 읽기만 한다** — 실서버·실데이터에 쓰지 않는다. 지우거나 고치는 점검이 필요하면
직접 실행하지 말고 «관리자가 직접 누르는 화면·스크립트» 로 만들어 넘긴다.
프로젝트 규칙이 더 엄하면 그 규칙이 이긴다.

### 1. 구역을 나눈다 (검수의 «가로줄»)
코드를 사람이 말하는 단위로 5~15구역으로 나눈다(예: 인증·결재·휴가·급여·파일·알림·관리자).
구역마다 **대표 경로(파일 글롭)** 를 적어 둔다 — 대장의 썩음 판정이 이 글롭을 쓴다.

### 2. 전 축을 훑는다 (기본값: 12축 모두)
`references/axes.md` 의 축 카탈로그를 **위에서부터 끝까지** 돈다. 축마다 아래 네 걸음이 같다.

1. **전수 목록을 코드에서 뽑는다** — 손으로 세지 않는다(표·상태·입구·권한·발송…).
   손으로 적은 목록은 두 번째 배포부터 거짓말을 한다 → `references/generators.md`
2. **빈칸과 «혼자만 다른 칸» 을 찾는다** — 검증이 없는 경로, 아무도 안 지우는 행,
   정의되지 않은 상태 전이, 권한이 안 걸린 입구, 세 곳 중 한 곳만 다른 계산
3. **도달 가능한지 확인한다** — 실제 경로를 찾고, 가능하면 시험으로 재현한다.
   재현 못 하면 «잠재» 로 등급을 낮춘다. **추측을 사실처럼 보고하지 않는다**
4. **대장에 한 줄** — 구역 × 축 × 깊이(L1/L2/L3) × 오늘 커밋

> **넓게 벌릴 것.** 축은 서로 독립이므로 **축마다 따로 훑어도 결과가 섞이지 않는다**.
> 병렬 실행이 가능한 환경이면 축(또는 구역×축)마다 조사원을 하나씩 띄워 동시에 훑고,
> 결과를 한 표로 모은다. 한 번에 최대한 많이 잡는 가장 확실한 방법이다.
> 조사원에게는 **«고치지 말고 찾아서 보고만»** 하도록 지시한다(고치는 것은 마지막에 한 곳에서).

**깊이(depth) 의 뜻** — 대장에 이 값을 적는다. 이것이 «검수 완료» 의 정의다.
- **L1 훑음**: 전수 목록을 뽑아 눈으로 봤다 (빈칸만 표시)
- **L2 대조**: 빈칸마다 코드를 읽고 도달 가능성을 판단했다
- **L3 못질**: 찾은 것을 고치고 **재현 시험**을 남겼다 / 정책으로 판정해 기록했다

### 3. 치명도별로 정리해 보고한다
`references/severity.md` 의 기준과 서식. 항목마다 **도달 경로 · 재현 · 피해 · 제안 · 상태**.
결정은 사람이 한다 — «의도적으로 열어 둔 것» 이라는 답이 자주 나오며, 그건 버그가 아니라 **정책**이다.
정책으로 판명된 것은 지우지 말고 «정책» 으로 남긴다(다음 검수에서 또 올라오지 않게).

### 4. 못질 — 검수는 1회성, 장치는 영구
검수의 결과물은 문서가 아니라 **다시 안 생기게 하는 장치**다.
- 고친 구멍마다 **재현 시험 1개** (없으면 다음 배포에 되살아난다)
- 같은 규칙을 여러 경로가 검사하고 있었다면 **한 곳(관문)으로 모은다**
- 산출물마다 **생성기 + `--check`**, 그리고 그것을 부르는 시험
- 되풀이되는 판단은 프로젝트 규칙 문서에 한 줄
- 마지막에 `audit-check` 를 돌려 **대장과 산출물이 코드와 맞는지** 확인

### 5. 다음 검수는 «썩은 칸만»
`node <skill>/scripts/audit-check.mjs` 가 대장을 읽어, 그 칸을 훑은 뒤 **대표 경로가 바뀐 구역**을
`썩음` 으로 표시한다. 다음 검수는 그 칸만 다시 돌면 된다 — 전체를 다시 훑지 않는다.

### 6. 되돌리기 — 배운 것을 이 스킬에 올린다
이 스킬은 여러 프로젝트·여러 AI 도구의 검수에서 배운 것을 모아 자란다. 보고를 마쳤으면 이 폴더의 `CONTRIBUTING.md` 를 읽고
**되돌릴 것을 사람에게 제안**한다 — 기존 축으로 잡은 구멍은 사례, 어느 축에도 안 들어가는 구멍은 새 축,
절차에서 헛돈 곳은 이 문서 고침. 승인되면 그 문서대로 올린다(올릴 수 없는 환경이면 올릴 파일 내용을 건넨다).
되돌릴 것이 없으면 검수 기록에 «없음 — 이유» 를 적는다. 말없이 건너뛴 되돌리기와 구분하기 위해서다.

## 절대 규칙

1. **실서버는 읽기만.** 쓰기·삭제·발송이 필요한 점검은 만들지 말고 사람에게 넘긴다.
2. **생성할 수 없는 산출물은 썩는다.** 코드에서 못 뽑는 문서는 짧게 쓰고 `watch` 로 감시한다.
3. **재현 못 한 것은 «잠재».** 등급을 함부로 올리지 않는다. 올렸다가 내리면 검수 전체의 신뢰가 깎인다.
4. **한 곳에서 막는다.** 경로마다 검사를 복사하면 다음 경로에서 또 빠진다.
5. **찾는 일과 고치는 일을 섞지 않는다.** 훑는 중에 고치면 훑기가 중간에 끊기고 목록이 비뚤어진다.
6. **옛 검수 기록을 지우지 않는다.** «무엇을 알고도 안 고쳤는지» 가 함께 남아야 판단을 되짚을 수 있다.

## 함께 있는 것

| 파일 | 무엇 |
|---|---|
| `references/axes.md` | **축 카탈로그 12개** — 축마다 «무엇을 전수로 세나 · 뽑는 법 · 전형적 구멍 · 못질» |
| `references/severity.md` | 치명도 기준 · 보고 서식 · 고칠 것/정책/보류 나누는 법 |
| `references/generators.md` | 산출물 생성기 만드는 법 (코드에서 뽑기 · `--check` · 시험으로 못질) |
| `templates/AUDIT.md` | 검수 기록 서식 → `docs/audit/AUDIT-<날짜>.md` |
| `templates/LEDGER.md` | **검수 대장** 서식 → `docs/audit/LEDGER.md` |
| `templates/audit.json` | 산출물·구역 설정 예시 → 저장소 뿌리의 `audit.json` |
| `scripts/audit-check.mjs` | **산출물 신선도 + 대장 썩음 검사기** (아래) |
| `cases/` | 실제로 잡은 사례 — 비슷한 구멍을 찾을 때 참고 |
| `CONTRIBUTING.md` | **배운 것을 이 스킬에 되돌리는 법** (6단계) |

## 검사기

```sh
node .claude/skills/axis-audit/scripts/audit-check.mjs            # 산출물·대장 검사 (어긋나면 2)
node .claude/skills/axis-audit/scripts/audit-check.mjs --write    # 어긋난 산출물을 다시 씀
node .claude/skills/axis-audit/scripts/audit-check.mjs --ledger   # 대장만
```

- `check` 명령이 있으면 그 종료코드로 판단한다.
- 없으면 **파일 백업 → `generate` 실행 → 내용 비교 → 원래대로 되돌림**
  (검사가 작업본을 더럽히지 않는다. `--write` 일 때만 새 내용을 남긴다).
- `watch` 만 있는 손글씨 문서는 **git 기록**으로 «기준 코드가 문서보다 새로운지» 를 본다.
- 대장은 각 줄의 `commit` 이후 그 구역 파일이 바뀌었으면 **썩음**으로 센다.

프로젝트의 시험 묶음에서 이 명령을 부르면, 산출물·대장을 갱신하지 않은 커밋이 배포 전에 걸린다.

## 다른 프로젝트에서 쓰기

스킬을 프로젝트에 복사해 두지 않는다 — 복사본은 그날부터 낡는다. 검수할 때마다 저장소에서 받는다(`README.md` «AI 에게»).
프로젝트에 종속된 것은 스킬 안에 없다 — 프로젝트 쪽에 두는 것은 `audit.json`(구역·산출물 목록)과 `docs/audit/` 뿐이다.
````````

<!-- file: templates/audit.json -->
````````json
{
  "_설명": "축 검수 설정 — 저장소 뿌리에 audit.json 으로 둔다. 주석 대신 _로 시작하는 키를 쓴다.",

  "_areas": "검수의 가로줄. 사람이 말하는 단위로 5~15개. paths 는 대장의 «썩음» 판정에 쓴다",
  "areas": [
    { "id": "auth",  "name": "로그인·계정", "paths": ["src/auth/**"] },
    { "id": "order", "name": "주문",        "paths": ["src/order/**", "src/api/order*"] },
    { "id": "admin", "name": "관리자",      "paths": ["src/admin/**"] }
  ],

  "_axes": "돌 축 번호. 비우면 1~12(핵심 축). 프로젝트 성격에 따라 넓힘 축을 더한다",
  "axes": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],

  "_artifacts": "검수 산출물. check(자체 검사) > generate(다시 뽑아 비교) > watch(git 으로 썩음만) 순으로 쓴다",
  "artifacts": [
    { "path": "docs/erd/ERD.md", "generate": "node tools/erd.mjs", "check": "node tools/erd.mjs --check" },
    { "path": "docs/audit/STATES.md", "generate": "node tools/states.mjs" },
    { "path": "docs/audit/USECASES.md", "watch": ["src/**"], "maxLagDays": 30 }
  ],

  "ledger": "docs/audit/LEDGER.md"
}
````````

<!-- file: templates/AUDIT.md -->
````````markdown
# 검수 기록 — YYYY-MM-DD

- **대상**: <저장소·범위>  · **커밋**: `<sha>`
- **돈 축**: 1~12 (건너뜀: 19 — 이유)
- **결과**: 치명 0 · 높음 2 · 중간 5 · 낮음 3 · 잠재 1
- **실데이터**: 읽기만 함 (쓰기·삭제·발송 없음)

## 요약 — 먼저 결정해 주실 것

1. **[H1]** … (한 줄) → 제안: …
2. **[H2]** … → 제안: …

## 항목

### [C1] 한 줄 제목 — 축: 5 불변식 / 구역: 휴가
- **도달 경로**: 어떤 사람이 어떤 화면·API 에서 무엇을 하면 닿는가
- **재현**: 시험 파일·번호 (재현 못 하면 «잠재» 로 등급을 내린다)
- **피해**: 무엇이 틀어지나 · 되돌릴 수 있나 · 알아챌 수 있나
- **제안**: 어디를 어떻게 (한 곳에서 막는 방법 우선)
- **상태**: 고침 / 정책 / 보류 / 사람이 실행

### [H1] …

## 못질한 것 (다시 안 생기게)

| 무엇 | 어디 |
|---|---|
| 재현 시험 | `tests/...` |
| 관문 한 곳으로 | `src/...` |
| 산출물 + `--check` | `docs/...` · `tools/...` |
| 규칙 문서 한 줄 | `WORK-RULES.md` … |

## 스킬에 되돌린 것

- 사례 `cases/YYYY-MM-DD-<성격>-<한단어>.md` · 새 축 제안 … · SKILL.md 고침 …
- 없으면 «없음 — 이유» (말없이 비워 두지 않는다)

## 정정

- 지난 회차에서 «높음» 으로 올렸던 X 는 코드 전수 확인 결과 «중간(잠재)» 로 내린다 — 이유
````````

<!-- file: templates/axis-template.md -->
````````markdown
## NN. <축 이름> 축 — <한 줄로 무엇을 보나>

**전수 목록**: <무엇을 하나도 빠짐없이 세는가. 셀 수 없으면 축이 아니다>

**뽑는 법**: <그 목록을 코드에서 어떻게 뽑는가. 손으로 세는 방법은 적지 않는다>

**전형적 구멍**
- <실제로 잡힌 것부터. 상상은 맨 아래>
- <…>

**못질**: <다시 안 생기게 하는 장치 — 관문·생성기·시험>

---

<!-- 위 네 칸이 다 차지 않으면 아직 축이 아니다. 사례(cases/) 1개를 함께 올린다. -->
````````

<!-- file: templates/case-template.md -->
````````markdown
# <한 줄 제목> — <YYYY-MM-DD>

| | |
|---|---|
| **프로젝트 성격** | 사내 업무 시스템 / 공개 서비스 / 배치 … (**이름은 적지 않는다**) |
| **축** | 5 불변식 (없던 축이면 «새 축 제안») |
| **등급** | 치명 / 높음 / 중간 |

## 무엇을 어떻게 찾았나
<어떤 목록을 전수로 뽑았더니 어느 칸이 비어 있었는지. 재현 방법>

## 왜 시험이 못 잡았나
<이게 가장 중요하다 — 시험이 어느 방향으로만 촘촘했는지>

## 어떻게 막았나
<관문 한 곳 / 재현 시험 / 산출물 · 그리고 그게 왜 재발을 막는지>

## 다른 프로젝트에 옮길 수 있는 교훈
<여기만의 이야기는 쓰지 않는다. 다른 스택에서도 통하는 한두 줄>
````````

<!-- file: templates/LEDGER.md -->
````````markdown
# 검수 대장

**«검수 완료» 가 무슨 뜻인지 여기에만 있다.** 구역 × 축을 훑을 때마다 한 줄 더한다.
지운 줄은 없다 — 다시 훑으면 **새 줄**을 더한다(옛 줄이 그때의 판단을 증언한다).

- **깊이** — `L1` 목록만 뽑아 봤다 · `L2` 빈칸마다 코드를 읽었다 · `L3` 고치고 재현 시험을 남겼다
- **커밋** — 그때의 HEAD. 이 커밋 이후 그 구역 파일이 바뀌면 검사기가 «다시 볼 칸» 으로 표시한다
- **비고** — 찾은 것 요약, 또는 건너뛴 이유

| 구역 | 축 | 깊이 | 날짜 | 커밋 | 비고 |
|---|---|---|---|---|---|
| auth | 4 | L3 | 2026-01-01 | abc1234 | 상세·내려받기에 판정 누락 2건 고침 |
| auth | 9 | L2 | 2026-01-01 | abc1234 | 입력 검증 한 곳으로 모을 것 — 보류 |
| order | 5 | L1 | 2026-01-01 | abc1234 | 불변식 3개 적음, 점검은 다음 차례 |

## 이번 회차 요약

- **회차**: 2026-01-01 · 훑은 칸 3/39 · 치명 0 · 높음 2 · 중간 1
- **다음 차례**: order × 5 (L1 → L3), admin 전 축
- **건너뛴 축과 이유**: 19 공급망 — 외부 의존이 없음
````````

