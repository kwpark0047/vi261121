import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesSource = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');
const blueprint = JSON.parse(
  fs.readFileSync(new URL('./firebase-blueprint.json', import.meta.url), 'utf8'),
) as {
  firestore: Record<string, { schema: unknown; description?: string }>;
};

test('firestore.rules includes default deny safety net', () => {
  assert.match(rulesSource, /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/);
});

test('firestore.rules enforces verified users and immutable ownerUid on projects', () => {
  assert.match(rulesSource, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesSource, /incoming\(\)\.ownerUid == existing\(\)\.ownerUid/);
  assert.match(rulesSource, /incoming\(\)\.verificationStatus in \['unverified', 'pending'\]/);
});

test('firestore.rules restricts PII and list scraping', () => {
  assert.match(rulesSource, /match \/users\/\{userId\}\/private\/info/);
  assert.match(rulesSource, /allow list: if isSignedIn\(\) && \(resource\.data\.reporterUid == request\.auth\.uid \|\| isAdmin\(\)\)/);
  assert.match(rulesSource, /allow list: if isSignedIn\(\) && \(resource\.data\.claimantUid == request\.auth\.uid \|\| isAdmin\(\)\)/);
});

test('firestore.rules enforces atomic counter sync with existsAfter and getAfter', () => {
  assert.match(rulesSource, /existsAfter\(/);
  assert.match(rulesSource, /getAfter\(/);
});

test('firestore.rules covers every collection declared in firebase-blueprint.json', () => {
  // Each blueprint firestore path must map to a match block in the rules so that
  // the schema contract and the security rules cannot drift apart silently.
  const expectedMatches: Record<string, string> = {
    '/projects/{projectId}': 'match /projects/{projectId} {',
    '/projects/{projectId}/likes/{userId}': 'match /likes/{userId} {',
    '/users/{userId}/public/profile': 'match /users/{userId}/public/profile {',
    '/users/{userId}/private/info': 'match /users/{userId}/private/info {',
    '/users/{userId}/bookmarks/{projectId}': 'match /users/{userId}/bookmarks/{projectId} {',
    '/reports/{reportId}': 'match /reports/{reportId} {',
    '/ownershipClaims/{claimId}': 'match /ownershipClaims/{claimId} {',
    '/newsletterSubscribers/{subId}': 'match /newsletterSubscribers/{subId} {',
  };

  const declaredPaths = Object.keys(blueprint.firestore);
  assert.equal(declaredPaths.length, Object.keys(expectedMatches).length);
  for (const path of declaredPaths) {
    assert.ok(
      expectedMatches[path] !== undefined,
      `No rules-coverage expectation registered for blueprint path ${path}`,
    );
    assert.ok(
      rulesSource.includes(expectedMatches[path]!),
      `firestore.rules has no match block for blueprint path ${path}`,
    );
  }
});
