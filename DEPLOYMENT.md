# W-Vibe 무료 배포 가이드 (Vercel Hobby + Firebase Spark)

2026-04 조사 기준. 가격·쿼터는 변동되므로 배포 직전 각 공식 페이지에서 재확인할 것.

- Vercel Hobby: [vercel.com/pricing](https://vercel.com/pricing)
- Firebase 무료 등급(Spark) 쿼터: [firebase.google.com/pricing](https://firebase.google.com/pricing)
- Cloud Functions for Firebase는 **Blaze(종량제)** 필요: [firebase.google.com/docs/functions/quotas](https://firebase.google.com/docs/functions/quotas) — 무료 배포에는 함수 미포함 전제.

## 1. 아키텍처

```
브라우저 → Vercel (정적 dist/ + /api 함수)
              ├─ /api/health
              ├─ /api/github/repo          (GitHub REST 조회, 15분 캐시)
              ├─ /api/github/sync-batch      (최대 12개 일괄, GitHub REST 조회)
               ├─ /api/github/top-starred     (GitHub Stars 랭킹 검색 + 인메모리 캐시)
               └─ /api/github/translate-descriptions (설명 번역 프록시)
브라우저 → Firebase (Google 팝업 인증 + Firestore)
```

- 정적 번들: `vite build` → `dist/` (코드 스플리팅; `vite.config.ts`의 assets 복사 플러그인 포함).
- `/api/*`는 Express가 아니라 **Vercel 함수**가 서빙. 공유 로직은 `src/lib/githubRepo.ts`로 추출해 Express 서버(`server.ts`, 로컬/자가 호스팅용)와 함수가 동시 사용.
- 함수는 표준 Web API(`Request`/`Response`)만 사용 — Node 빌트인·Express 의존 없음.
- `/api/github/top-starred`·`/api/github/translate-descriptions`는 두 함수 모듈을 그대로 공유하는 로컬 Express 경로이기도 하다: `bun run dev`/`start`(server.ts)가 동일 핸들러로 프록시하므로 개발 중에도 함수와 같은 계약/검증/에러 JSON을 쓴다. 시크릿은 `.env`에서 `dotenv/config`로 동일하게 읽히므로 로컬에서도 `GITHUB_TOKEN`/`GEMINI_API_KEY`(및 필요 시 `TRANSLATION_MODEL`)를 준비해야 한다.
- 클라이언트는 상대경로(`/api/github/...`) 사용 → 오리진 동일 시 무수정 동작.
- `vercel.json`의 `/(.*)` → `/index.html` 재작성은 SPA 히스토리 폴백. 함수 라우트가 재작성보다 우선하지만, 배포 후 `/api/health` 스모크로 확인 권장.

## 2. 배포 절차 (Vercel)

1. https://vercel.com/login — GitHub 계정으로 로그인(외부 인증, 직접 수행).
2. https://vercel.com/park-kang-wons-projects — 해당 팀/워크스페이스에서 **Add New → Import Git Repository** → `kwpark0047/vi261121` 선택, 또는 CLI:
   `npm i -g vercel && vercel link && vercel --prod` (프로젝트 루트).
3. 자동 감지: Vite 프리셋, `bun install`/`npm install` → `vite build` → `dist/` 배포. (락파일 `bun.lock` 존재 — Vercel이 Bun 자동 감지, 아니면 npm으로 빌드해도 무방.)
4. **프로젝트 설정 → Environment Variables**: `GITHUB_TOKEN`(선택, GitHub Classic PAT `public_repo` 또는 fine-grained `Metadata: Read`+`Contents: Read`) — 없으면 공유 egress IP 풀에서 60 req/h 제한으로 429 빈번 가능.
5. **도메인**: 팀 설정 → Domains → `vibe.vercel.app` 추가(1순위, 무료 자동 SSL). 커스텀 도메인도 Hobby에서 무료.
6. Firebase: 기존 프로젝트 재사용이면 `firebase-applet-config.json` 값 유지(재빌드 불필요 — 번들 인라인), 신규면 값 교체 후 재빌드·재배포.
   - Google 제공자 활성화, **Authorized domains**에 배포 도메인 추가.
   - **Firestore rules 프로드 배포**: `firebase deploy --only firestore:rules` (로컬 `bun run rules:emulator`+`RULES_EMULATOR_TESTS=1 bun run test:rules`로 사전 검증 가능).

## 3. 배포 후 검증

- `curl https://<도메인>/api/health` → `{ok:true,...}` 확인(함수 라우팅·재작성 충돌 점검).
- 딥링크 새로고침(히스토리 폴백), Google 로그인 팝업, 카탈로그 조회, 좋아요/북마크, GitHub 연동 조회.
- 로컬 게이트: `bun run lint`, `bun test`(단위 + 규칙 소스 패턴 테스트; 에뮬레이터 불필요), `bun run build`; 규칙 에뮬레이터 평가는 `bun run rules:emulator` + `RULES_EMULATOR_TESTS=1 bun run test:rules`(로컬 JVM 에뮬레이터 필요, 미사용 시 skip).
  - 최근 측정값(2026-11-23, Bun 1.4.2 / Node 24): `bun test` → 58 pass · 19 skip · 0 fail (12 files), 규칙 소스 패턴 테스트 6 pass. 테스트 수는 추가/변경에 따라 변동 — 수치가 아니라 명령이 계약.

## 4. 무료 운용 노트 (조사값)

| 항목 | 무료 범위 |
|---|---|
| Vercel Hobby CDN 요청 | 1M/월 · 전송 100GB/월 · Functions 1M 호출/월 · 360 GB-hr/월 · Active CPU 4h/월 |
| Vercel 초과분 | Hobby는 **추가 구매 불가(하드 캡)** — 초과 시 Pro($20/월) 또는 트래픽 설계 조정 |
| Firebase Spark (Hosting) | 저장 10GB · 전송 360MB/일 |
| Firebase Spark (Firestore) | 1GiB · egress 10GiB/월 · 쓰기 20K/일 · 읽기 50K/일 · 삭제 20K/일 |
| Firebase Spark (Auth) | MAU 50K |

- 서버리스 인스턴스의 모듈 캐시는 콜드스타트마다 초기화(TTL 15분 근사 유지).
- 별도 결제·트라이얼 불필요(자격 시 $300 크레딧은 Blaze 업그레이드용 — 무료 배포엔 미필수).
