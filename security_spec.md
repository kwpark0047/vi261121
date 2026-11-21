# VibeAtlas Firestore Security Specification

## 1. Data Invariants
1. A project listing under `/projects/{projectId}` can only be created or edited by an email-verified authenticated user whose `request.auth.uid` matches `ownerUid`, and `ownerUid` + `createdAt` remain immutable after creation.
2. Users cannot self-verify a project (`verificationStatus` must start as `'unverified'` or `'pending'` unless modified by an admin).
3. A `/projects/{projectId}/likes/{userId}` document can only be created or deleted by `request.auth.uid == userId`, must reference an existing parent `/projects/{projectId}`, and any atomic counter increment/decrement on `/projects/{projectId}` may only adjust `likesCount` or `bookmarksCount` by `±1` alongside a matching subcollection/bookmark write.
4. Personal PII (`email`) is strictly isolated in `/users/{userId}/private/info` and `/newsletterSubscribers/{subId}`, readable only by the owning user (`request.auth.uid == userId`) or verified admin (`kwpark0047@iceu.kr`).
5. Reports and ownership claims always start in `'open'` / `'pending'` status and can never be escalated or modified to `'approved'`/`'resolved'` by non-admin callers.
6. Every document ID matches `^[a-zA-Z0-9_\-]+$` (max 128 chars), every string has explicit `.size()` bounds, and every array (`categories`, `techStack`) has explicit upper-bound size limits and first-element type validation.

## 2. Dirty Dozen Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Identity Spoofing on Project Create**: Creating `/projects/p1` with `ownerUid: "someone-else"` while signed in as `userA`.
2. **Self-Verification Privilege Escalation**: Creating `/projects/p2` with `verificationStatus: "verified"` as a regular user.
3. **Shadow Ghost Field Injection**: Creating `/projects/p3` with an undeclared field `isFeaturedAdminPick: true`.
4. **Oversized Document ID Poisoning**: Creating `/projects/<1500_char_id>` to exhaust rule evaluation or storage.
5. **Unbounded Array / String DoS**: Creating `/projects/p4` with `techStack` containing 50 items or `description` exceeding 4,000 chars.
6. **Immutable Field Tampering**: Updating `/projects/p1` to reassign `ownerUid` or `createdAt`.
7. **Server Timestamp Forgery**: Creating `/projects/p5` with a client-fabricated `createdAt` string or past timestamp instead of `request.time`.
8. **Unverified Email Bypass**: Attempting a write when `request.auth.token.email_verified == false`.
9. **Spoofed Admin Read on Private PII**: Reading `/users/victimUid/private/info` when `token.email == "kwpark0047@iceu.kr"` but `token.email_verified == false`.
10. **Like Counter Manipulation (+999)**: Updating `/projects/p1` to set `likesCount = existing().likesCount + 999`.
11. **Terminal State / Claim Auto-Approval**: Creating or updating `/ownershipClaims/c1` with `status: "approved"` as claimant.
12. **Blanket List Query Scraping**: Running `list` on `/reports` or `/ownershipClaims` as a regular user without scoping to `reporterUid == request.auth.uid` / `claimantUid == request.auth.uid`.

## 3. Documented Public Surface

- `match /test/connection` allows `get` for anyone (`allow get: if true`). It is
  an intentional reachability probe (client `testConnection()` in
  `src/lib/firebase.ts`), not a data read; it carries no schema and exposes
  nothing beyond existence/connectivity of the Firestore endpoint.
- Everything else, including all user/PII/report/claim collections, is covered
  by the top-level `match /{document=**} { allow read, write: if false; }`
  default-deny net plus the per-collection rules.
