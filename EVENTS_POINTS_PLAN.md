# W-Vibe Events & Points System Plan

## Overview
This document outlines the event, points, and referral system for W-Vibe, designed to reward user engagement, project submissions, and community growth. The system integrates with the existing Firestore security rules, admin roles, and platform taxonomy.

---

## 1. Points Earning Events

| Event | Points | Conditions | Notes |
|---|---|---|---|
| **Project Registration** | 50 pts | `isCuratedSeed: false` projects submitted via `SubmitProjectPage` | Points awarded once per successful project creation (document `createdAt`). |
| **Project Verification by Admin** | 20 pts (to admin) | Admin sets `verificationStatus` to `verified` via `updateProjectVerificationStatus` | Admin receives a small bonus for active moderation. |
| **Report Submission** | 30 pts | User submits a valid report (`reason` ∈ [`plagiarism`, `spam`, `inappropriate`, `copyright`, `other`]) | Points awarded only if report is not automatically rejected by rules. |
| **Claim Submission** | 30 pts | User submits a valid ownership claim (`verificationMethod` ∈ [`github`, `website`, `other`]) | |
| **Report/Claim Resolution** (by Admin) | 10 pts (to admin) | Admin marks report as `reviewed` or `resolved`, or claim as `approved`/`rejected` | Encourages active moderation. |
| **Daily Active Usage** | 5 pts/day | User visits app on a given day (tracked via localStorage `vibeatlas_daily_visit_v1`) | Reset at midnight UTC; prevents spam via IP + userId composite. |
| **Referral Sign-up** | 100 pts (to referrer) + 50 pts (to referee) | New user signs up via referrer's unique code and completes Google login | Referrer gets points after referee's 3rd day of daily usage. |
| **Referral Code Generation** | 20 pts | Existing user generates a referral code via admin dashboard | One-time reward; code cannot be regenerated. |
| **Social Share** | 10 pts | User shares a project via Twitter/LinkedIn (client-side tracking via UTM) | Points awarded if the shared link contains UTM params and is clicked. |

---

## 2. Referral Code System

### 2.1. Referral Code Format
- **Format**: `WV-{6 uppercase alphanumeric chars}` (e.g., `WV-AB3CDF`)
- **Generation**: HMAC-SHA256 of `{userId}|{timestamp}` truncated to 6 chars; stored in `users/{uid}/referralCode`.
- **Uniqueness**: Verified on creation via Firestore `getDoc`; if collision, regenerate.

### 2.2. Storage Schema (`users/{uid}`)
```json
{
  "referralCode": "WV-AB3CD",
  "referrerUid": "optional-parent-uid",
  "referredCount": 0,
  "referredUsers": ["uid1", "uid2"],
  "referredPointsAwarded": false,
  "totalEarnedPoints": 150,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

### 2.3. Referral Flow
1. **Existing user** generates code → 20 pts awarded.
2. **New user** enters code during `Sign-in with Google` flow (UI prompt: "Enter referral code?"). Code stored in `auth.token.customProperties['refCode']`.
3. **Referee's first 3 daily usages** → 50 pts awarded to referee (once per referee).
4. **Referee's totalEarnedPoints >= 100** → additional bonus of 20 pts to referrer (capped at 3 referrals).

### 2.4. Admin Controls
- Admin can view `referralCode`, `referredCount`, `totalEarnedPoints` per user in the **Projects tab** of Admin Dashboard.
- Admin can manually award/deduct points via `updateReportStatus`/`updateClaimStatus` pattern (new function `awardPoints(uid, points, reason)`).

---

## 3. Points Redemption / Usage

Points currently **cannot be cashed out** but are used for:
- **Featured placement**: 500 pts → project pinned to top of Discover for 24h.
- **Boost**: 100 pts → project `isCuratedSeed` temporarily set to `true` for 7 days (admin must approve).
- **Report priority**: 50 pts → report moved to front of admin review queue.
- **Custom badge**: 300 pts → user earns a custom badge displayed on profile.

*No cash-out or external reward. Points are purely for engagement gamification.*

---

## 4. Firestore Schema Extensions

### 4.1. `users/{uid}` (extend existing)
Add fields as described in 2.2.

### 4.2. `projects/{projectId}` (extend existing)
Add:
```json
{
  "earnedPoints": 50,     // points from registration
  "totalViews": 0,        // incremented on view
  "viewHistory": ["uid1", "uid3"]  // optional, last 5 viewer UIDs
}
```

### 4.3. `pointsLog/{docId}` (new collection)
```json
{
  "uid": "user-uid",
  "event": "project_registration|report_submission|referral_signup|daily_visit|admin_award|redemption",
  "points": 50,
  "relatedId": "projectId|reportId|claimId|referralCode",
  "meta": { "verificationStatus": "verified" | "pending" }, // optional
  "createdAt": "2026-01-15T10:00:00Z"
}
```
- **Index**: `createdAt` descending, `uid` for user-level queries.
- **Admin Dashboard**: "Points Log" tab lists recent entries with filter by event type and date range.

### 4.4. `referralCodes/{code}` (new collection, optional)
```json
{
  "uid": "referrer-uid",
  "usedBy": "referee-uid",     // last used date, or array
  "timesUsed": 3,
  "status": "active|used|expired",
  "createdAt": "2026-01-15T10:00:00Z"
}
```
- Used to verify code validity on new sign-up (prevent code reuse beyond limit).

---

## 5. Admin Dashboard Extensions

### 5.1. New Tabs
- **Points**: List all users with `totalEarnedPoints`, search, filter by event, export CSV.
- **Referrals**: View referral tree, code usage stats, award manual points.
- **Redemptions**: View redemption requests, approve/deny.

### 5.2. Admin Actions (Firestore Rules: `isAdmin()`)
- `awardPoints(uid, points, reason)` → writes to `pointsLog` + updates `users.{uid}.totalEarnedPoints`.
- `grantRedemption(uid, redemptionType)` → deducts points, applies benefit.
- `resetDailyVisits(uid)` → for support purposes only.

### 5.3. UI (WorkspaceBar → AdminDashboardPage)
- **ShieldCheck** button → navigates to admin dashboard (visible only to verified admin).
- **Points** tab: table of top users, referral stats.
- **Referral** tab: input field to generate own code, share link `https://vibe.vercel.app?ref=CODE`, usage graph.

---

## 6. Implementation Roadmap

| Phase | Tasks | Owner | ETA |
|---|---|---|---|
| **P0** | - Add `referralCode`, `referredCount`, `totalEarnedPoints` to `users/{uid}` model<br>- Create `pointsLog` collection and helper functions (`addPoints`, `getUserPoints`, `getPointsLog`)<br>- Implement referral code generation & validation in `src/lib/admin.ts` and sign-in flow<br>- Add 5 earning events to `firestore.rules` (createDoc patterns for reports/claims, project creation)<br>- Basic UI: `WorkspaceBar` ShieldCheck → Points/Referrals summary | Backend + Frontend | 1 week |
| **P1** | - Daily visit tracking via localStorage + optional Cloud Function cron<br>- Referral sign-up flow (code entry during Google login)<br>- Points display on user profile/header<br>- Admin: Points Log tab, manual award UI<br>- Redemption UI (featured/boost/badge requests) | Frontend | 2 weeks |
| **P2** | - Redemption: featured placement, boost, priority queue<br>- A/B test: points vs no-points on conversion<br>- Localization of new strings (ko/en)<br>- Performance: pagination for points log, caching<br>- Analytics: export, charts, top referrers | Full-stack | 3 weeks |
| **P3** | - Refinement based on usage data<br>- Bonus events (e.g., first 10 likes, 10 bookmarks)<br>- Referral tier system (Bronze/Silver/Gold based on referral count)<br>- Points expiry policy (12 months inactive → 50% decay) | Full-stack | Ongoing |

---

## 7. Security Rules Considerations

### 7.1. Points Log Write
```javascript
// pointsLog/{docId}
allow create: if isAdmin() && 
    request.resource.data.keys().hasOnly(['uid','event','points','relatedId','meta','createdAt']) &&
    request.resource.data.data.createdAt == request.time;
```
- Only admins can write points log entries.
- `createdAt` must match `request.time` (prevent backdating).

### 7.2. User Points Read
```javascript
// users/{uid}
allow read: if isSignedIn() && request.auth.uid == uid;
allow update: if isAdmin() && ...; // only via awardPoints helper
```
- Users read their own points; admins can update via approved helper.

### 7.3. Referral Code Validation
```javascript
// users/{uid}/referralCode
allow read: if isSignedIn();
allow write: if isAdmin() && request.resource.data.keys().hasOnly(['uid','referralCode','referredCount','totalEarnedPoints','referredUsers','referredPointsAwarded','createdAt','updatedAt']);
```
- Public read; admin write only.

### 7.4. Redemption (if implemented as client-triggered)
```javascript
// redemption requests collection
allow create: if isSignedIn() && 
    request.resource.data.keys().hasOnly(['uid','redemptionType','points','status','createdAt']) &&
    request.resource.data.data.createdAt == request.time &&
    // user has enough points (checked in function, not pure rule)
    true;  // full check in Callable Function
```
- Simpler: use Admin Dashboard `awardPoints` + redemption UI is admin-only.

---

## 8. i18n Strings (ko/en)

Add to `src/data/i18n.ts` under `ADMIN_STRINGS` (or extend existing `UI_STRINGS`):

```typescript
admin: {
  navLabel: '행정관리',
  title: 'W-Vibe 관리자 대시보드',
  subtitle: '포인트·추천코드 시스템',
  mainAdmin: '메인 관리자',
  subAdmin: '서브 관리자',
  backHome: '홈으로',
  accessDeniedTitle: '권한이 없습니다',
  accessDeniedBody: '메인(admin@kwpark0047@gmail.com) 또는 서브(admin@kwpark0047@iceu.kr) 관리자만 접근 가능합니다.',
  loading: '로딩 중...',
  error: '오류가 발생했습니다.',
  
  // Points tab
  pointsTitle: '포인트 현황',
  pointsSubtitle: '총 earned 포인트 상위 사용자',
  user: '사용자',
  totalPoints: '총 포인트',
  event: '이벤트',
  date: '날짜',
  noData: '데이터가 없습니다.',
  
  // Referrals tab
  referralsTitle: '추천코드',
  referralsSubtitle: '내 코드와 추천 통계',
  myCode: '내 코드',
  shareLink: '공유 링크',
  codeCopied: '복사되었습니다!',
  referrer: '추천인',
  referee: '피추천인',
  referralEarned: '추천으로 Earned',
  referralBonus: '피추천이 Earned',
  usageGraph: '활용 그래프',
  generateCode: '추천코드 생성',
  generateCodeSuccess: '추천코드가 생성되었습니다. 20포인트가 적립되었습니다.',
  codeAlreadyExists: '이미 생성된 코드가 있습니다.',
  
  // Redemptions tab
  redemptionsTitle: '환급 신청',
  redemptionType: '환급 유형',
  pointsSpent: '소모 포인트',
  statusPending: '접수 대기',
  statusApproved: '승인',
  statusRejected: '거절',
  requestTitle: '신청 제목',
  requestDescription: '신청 설명',
  submit: '신청',
  confirmDelete: '정말로 삭제하시겠습니까?',
  
  // Status labels
  statusOpen: '열림',
  statusReviewed: '검토중',
  statusResolved: '해결됨',
  statusPending: '대기',
  statusApproved: '승인',
  statusRejected: '거절',
  statusVerified: '인증됨',
  statusUnverified: '인증안됨',
}
```

---

## 9. Callable Functions (Firebase Functions, Blaze)

| Function | Description |
|---|---|
| `addPoints(uid, points, event, relatedId, meta?)` | Writes to `pointsLog`, updates `users.{uid}.totalEarnedPoints`. Validates `points` ∈ `[5,10,20,30,50,100]`. Returns new total. |
| `getUserPoints(uid)` | Returns `{totalEarnedPoints, referredCount, lastDailyVisit}`. |
| `getPointsLog(uid, start?, end?)` | Paginated list of points entries for user/admin. |
| `generateReferralCode(uid)` | Returns `referralCode`; awards 20 pts. Idempotent if code already exists. |
| `validateReferralCode(code, refereeUid)` | Returns `{valid, referrerUid, alreadyUsed}`. |
| `awardReferralBonus(referrerUid, refereeUid)` | Awards 50 pts to referrer after referee's 3rd daily visit. |
| `redeemPoints(uid, redemptionType)` | Deducts points, applies redemption (featured/boost/badge). Returns remaining points. |

*These functions require `firebase-functions`/`blaze` plan. If staying on Spark, equivalent Firestore transactions + callable-lite pattern can be used.*

---

## 10. Migration / Seed Data

If existing project has users without `referralCode`/`points` fields:
- **Seed script** (`node scripts/migrate-points.js`): Backfill `referralCode` (random 6-char), initialize `totalEarnedPoints: 0`, `referredCount: 0`.
- Run once after deploy: `firebase functions:shell --code migration`.
- Preserve existing `totalEarnedPoints` if any (edge cases from prior manual awards).

---

## 11. Usage Limits & Safeguards

| Limit | Value | Rationale |
|---|---|---|
| Max daily points per user | 30 pts/day (daily_visit 5 + others bounded) | Prevent farming. |
| Referral code regenerate | Not allowed (one-time) | Maintain code stability. |
| Referral bonus per referee | Max 3 referrals per referrer | Caps admin payout. |
| Points expiry | None (permanent), but inactive >12mo → half after notification | Encourages retention without harsh loss. |
| Points audit | Monthly export + verification against `pointsLog` | Detect drift/bugs. |

---

## 12. Success Metrics (post-launch)

- **Adoption**: % of new users who generate/use referral code (target: >20%).
- **Retention**: Daily active users (DAU) uplift from daily-visit points (target: +5% MoM).
- **Engagement**: Avg points earned per active user (target: >75 pts/Month).
- **Moderation**: % of reports/claims resolved within 48h (target: >80%).
- **Redemption**: % of points redeemed for featured/boost (target: 10-15% of total points).

---

## References & Related Files
- `src/lib/admin.ts` (new) — admin role helpers
- `firestore.rules` — `isAdmin()`, points log write rule
- `src/data/i18n.ts` — `ADMIN_STRINGS` addition
- `src/lib/firestoreRepo.ts` — new helper functions (`addPoints`, `getUserPoints`, `generateReferralCode`, etc.)
- `DEPLOYMENT.md` — Firebase/Spark compatibility notes
- `security_spec.md` — admin model + invariant documentation

---
*Plan version: 2026-11-22 v1.0*
*Approved by: Product & Engineering*