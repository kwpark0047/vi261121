import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mergeAndSortCommunityActivities,
} from './communityActivity';
import type {
  OwnershipClaimRecord,
  ProjectActivityRecord,
  ProjectReportRecord,
} from '../types/vibeatlas';

const activity = (over: Partial<ProjectActivityRecord>): ProjectActivityRecord => ({
  id: 'a1',
  projectId: 'p1',
  kind: 'like',
  createdAtIso: '2026-11-20T10:00:00.000Z',
  ...over,
});
const report = (over: Partial<ProjectReportRecord>): ProjectReportRecord => ({
  id: 'r1',
  projectId: 'p1',
  projectSlug: 'p1',
  reporterUid: 'u1',
  reason: 'stale_metadata',
  details: 'details',
  status: 'open',
  createdAtIso: '2026-11-21T10:00:00.000Z',
  ...over,
});
const claim = (over: Partial<OwnershipClaimRecord>): OwnershipClaimRecord => ({
  id: 'c1',
  projectId: 'p1',
  projectSlug: 'p1',
  claimantUid: 'u2',
  verificationMethod: 'github_repo',
  proofNote: 'proof',
  status: 'pending',
  createdAtIso: '2026-11-22T10:00:00.000Z',
  ...over,
});

test('merge: empty inputs yield empty list', () => {
  assert.deepEqual(mergeAndSortCommunityActivities({ projectId: 'p1' }), []);
});

test('merge: sorts mixed sources newest-first', () => {
  const merged = mergeAndSortCommunityActivities({
    projectId: 'p1',
    localActivities: [activity({ id: 'like-1', createdAtIso: '2026-11-19T10:00:00.000Z' })],
    firestoreActivities: [activity({ id: 'like-2', createdAtIso: '2026-11-20T10:00:00.000Z' })],
    userReports: [report({ id: 'r1' })],
  });
  assert.deepEqual(merged.map((a) => a.id), ['report:r1', 'like-2', 'like-1']);
});

test('merge: drops other-project records, keeps blank projectId scoped', () => {
  const merged = mergeAndSortCommunityActivities({
    projectId: 'p1',
    localActivities: [
      activity({ id: 'other', projectId: 'p2' }),
      activity({ id: 'blank', projectId: '' }),
    ],
  });
  assert.deepEqual(merged.map((a) => a.id), ['blank']);
  assert.equal(merged[0].projectId, 'p1');
});

test('merge: dedupes by id (first source wins) and skips invalid timestamps last', () => {
  const merged = mergeAndSortCommunityActivities({
    projectId: 'p1',
    firestoreActivities: [activity({ id: 'dup', createdAtIso: '2026-11-20T10:00:00.000Z' })],
    localActivities: [activity({ id: 'dup', createdAtIso: '2026-11-19T10:00:00.000Z' })],
    userReports: [report({ id: 'bad', createdAtIso: 'not-a-date' })],
  });
  assert.deepEqual(merged.map((a) => a.id), ['dup', 'report:bad']);
});

test('merge: maps reports/claims with viewer label, note, status, method', () => {
  const merged = mergeAndSortCommunityActivities({
    projectId: 'p1',
    userReports: [report({ id: 'r1', reporterUid: 'me' })],
    currentUser: { uid: 'me', name: '김뷰' },
  });
  assert.equal(merged[0].actorLabel, '김뷰');
  assert.equal(merged[0].note, 'details');
  assert.equal(merged[0].status, 'open');
  assert.equal(merged[0].kind, 'report');

  const merged2 = mergeAndSortCommunityActivities({
    projectId: 'p1',
    firestoreActivities: [
      activity({
        id: 'claim:c1',
        kind: 'claim',
        actorUid: 'u2',
        note: 'proof',
        status: 'approved',
        method: 'domain_dns',
      }),
    ],
  });
  assert.equal(merged2[0].method, 'domain_dns');
  assert.equal(merged2[0].status, 'approved');
});

test('merge: report from another viewer gets no actor label', () => {
  const merged = mergeAndSortCommunityActivities({
    projectId: 'p1',
    userReports: [report({ id: 'r1', reporterUid: 'someone-else' })],
    currentUser: { uid: 'me' },
  });
  assert.equal(merged[0].actorLabel, undefined);
});
