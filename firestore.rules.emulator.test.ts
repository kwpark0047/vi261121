/**
 * Emulator-backed evaluation tests for `firestore.rules`.
 *
 * `firestore.rules.test.ts` asserts that the rules *source* contains expected
 * patterns; this file goes further and executes the rules against the Firestore
 * emulator, asserting real allow/deny behavior. Scenarios mirror
 * `security_spec.md` (Data Invariants + Dirty Dozen adversarial payloads) so the
 * spec, the rules, and the tests cannot drift apart silently.
 *
 * ## Requirements
 * - Java 21+ (firebase-tools 15 requires it; the emulator itself runs on the JVM)
 * - Network access on first run (firebase-tools downloads the emulator jars)
 * - A running Firestore emulator. Easiest path:
 *
 *   bun run rules:emulator
 *   # firebase emulators:start --only firestore --project demo-vibeatlas-rules
 *
 * The emulator is discovered via `FIRESTORE_EMULATOR_HOST` (default
 * `127.0.0.1:5000`) or run manually with firebase-tools.
 *
 * ## Running
 *   RULES_EMULATOR_TESTS=1 bun run test:rules
 *
 * The suite is skipped unless the env var is set, so plain `bun test` (unit +
 * source-pattern tests) stays fast and emulator-free.
 */
import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import fs from 'node:fs';
import { doc, deleteDoc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { type DocumentData, type Firestore, Timestamp } from 'firebase/firestore';

const RUN = process.env.RULES_EMULATOR_TESTS === '1';

const rulesSource = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');

const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:5000';
const [host, portRaw] = EMULATOR_HOST.split(':');
const port = Number(portRaw);

type ContextFirestore = ReturnType<RulesTestContext['firestore']>;

let env: RulesTestEnvironment | null = null;
let initError: string | null = null;

if (RUN) {
  try {
    env = await initializeTestEnvironment({
      projectId: 'demo-vibeatlas-rules',
      firestore: { rules: rulesSource, host, port },
    });
  } catch (err) {
    initError = `emulator initialization failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function requireEnv(): RulesTestEnvironment {
  assert.ok(env, initError ?? 'emulator environment is not initialized');
  return env;
}

// Emulator state persists between runs; start each run from a clean slate.
before(async () => {
  if (RUN) {
    await requireEnv().clearFirestore();
  }
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function validProject(overrides: Record<string, unknown> = {}): DocumentData {
  return {
    slug: 'demo-project',
    name: 'Demo Project',
    tagline: 'A demo project tagline',
    taglineKo: '',
    description: 'A sufficiently long English description for the demo project listing.',
    descriptionKo: '',
    contentType: 'web_app',
    categories: ['utilities'],
    techStack: [],
    developmentPlatform: 'lovable',
    hostingProvider: 'vercel',
    backendTech: 'firebase',
    country: 'KR',
    language: 'en',
    license: 'MIT',
    pricingModel: 'free',
    verificationStatus: 'unverified',
    provenanceSource: 'maker_submitted',
    liveDemoUrl: '',
    websiteUrl: '',
    githubRepo: '',
    githubUrl: '',
    thumbnailUrl: '',
    makerName: 'Alice',
    makerHandle: '',
    ownerUid: 'alice',
    githubStars: 0,
    githubForks: 0,
    likesCount: 0,
    bookmarksCount: 0,
    lastSyncedAt: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function pendingReport(overrides: Record<string, unknown> = {}): DocumentData {
  return {
    projectId: 'p-report',
    projectSlug: 'demo-project',
    reporterUid: 'alice',
    reason: 'stale_metadata',
    details: 'Some details about the report',
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function pendingClaim(overrides: Record<string, unknown> = {}): DocumentData {
  return {
    projectId: 'p-claim',
    projectSlug: 'demo-project',
    claimantUid: 'alice',
    verificationMethod: 'github_repo',
    proofNote: 'Proof note for the claim',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

async function expectDenied(label: string, op: Promise<unknown>): Promise<void> {
  let error: unknown = null;
  try {
    await op;
  } catch (err) {
    error = err;
  }
  assert.ok(error, `${label}: expected PERMISSION_DENIED, but the operation succeeded`);
  const code = (error as { code?: unknown }).code;
  const message = error instanceof Error ? error.message : String(error);
  assert.ok(
    /permission|denied|403/i.test(String(code)) || /permission|denied/i.test(message),
    `${label}: expected a permission-denied error, got ${String(code) ?? message}`,
  );
}

// Firestore v9 modular has no DocumentReference.create(); wrap setDoc for readability.
async function createDoc(store: ContextFirestore, id: string, data: DocumentData): Promise<void> {
  await setDoc(doc(store as unknown as Firestore, id), data);
}

// The context's Firestore instance comes from the compat surface, so modular
// `query()`/`getDocs()` (class-identity checked) cannot be used on it.
// Going through the instance's own collection().get() keeps the assertions honest.
async function snapshotDocs(
  store: ContextFirestore,
  path: string,
): Promise<Array<{ id?: string }>> {
  const legacy = store as unknown as {
    collection: (p: string) => { get: () => Promise<{ docs: Array<{ id?: string }> }> };
  };
  const snapshot = await legacy.collection(path).get();
  return snapshot.docs;
}

// ---------------------------------------------------------------------------
// Positive paths (guards against over-restrictive rules)
// ---------------------------------------------------------------------------

test('verified user can create a well-formed project; directory reads stay public', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });

  await assertSucceeds(createDoc(alice.firestore(), 'projects/p1', validProject()));
  await assertSucceeds(getDoc(doc(alice.firestore(), 'projects/p1')));
  await assertSucceeds(snapshotDocs(alice.firestore(), 'projects'));

  const bob = t.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true });
  await assertSucceeds(getDoc(doc(bob.firestore(), 'projects/p1')));

  const anonymous = t.unauthenticatedContext();
  await assertSucceeds(getDoc(doc(anonymous.firestore(), 'projects/p1')));
});

test('owner can update and delete their project; other users cannot', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const bob = t.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true });
  const fs = alice.firestore();

  await assertSucceeds(createDoc(fs, 'projects/p2', validProject()));
  const current = (await getDoc(doc(fs, 'projects/p2'))).data() as DocumentData;
  await assertSucceeds(
    updateDoc(doc(fs, 'projects/p2'), {
      ...current,
      name: 'Renamed',
      description: 'Updated description text',
      updatedAt: serverTimestamp(),
    }),
  );
  await expectDenied("bob cannot delete alice's project", deleteDoc(doc(bob.firestore(), 'projects/p2')));
  await assertSucceeds(deleteDoc(doc(fs, 'projects/p2')));
});

test('like and bookmark counters sync atomically with their subcollection writes', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const fs = alice.firestore();

  await assertSucceeds(createDoc(fs, 'projects/p3', validProject()));
  await assertSucceeds(createDoc(fs, 'users/alice/bookmarks/p3', {
    projectId: 'p3',
    projectSlug: 'demo-project',
    projectName: 'Demo Project',
    userId: 'alice',
    createdAt: serverTimestamp(),
  }));
  // A lone like document, without the matching parent counter bump, is rejected.
  await expectDenied('like document without parent counter sync', createDoc(fs, 'projects/p3/likes/alice', {
    projectId: 'p3',
    userId: 'alice',
    createdAt: serverTimestamp(),
  }));
  // And a bare counter bump, without the like document, is rejected.
  await expectDenied('counter bump without like document', updateDoc(doc(fs, 'projects/p3'), {
    likesCount: 1,
    updatedAt: serverTimestamp(),
  }));
});

test('verified user can register profile, PII, report, and pending claim', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const bob = t.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true });
  const fs = alice.firestore();

  await assertSucceeds(createDoc(fs, 'users/alice/public/profile', {
    uid: 'alice', displayName: 'Alice', handle: 'alice', bio: '', country: 'KR',
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(createDoc(fs, 'users/alice/private/info', {
    uid: 'alice', email: 'alice@example.com', createdAt: serverTimestamp(),
  }));
  await expectDenied('other user reading private PII', getDoc(doc(bob.firestore(), 'users/alice/private/info')));
  await assertSucceeds(createDoc(fs, 'reports/r1', pendingReport()));
  await assertSucceeds(createDoc(fs, 'ownershipClaims/c1', pendingClaim()));
});

// ---------------------------------------------------------------------------
// Negative paths: Dirty Dozen adversarial payloads (security_spec.md)
// ---------------------------------------------------------------------------

test('1. identity spoofing: ownerUid must match the signed-in user', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  await expectDenied('ownerUid spoof', createDoc(alice.firestore(), 'projects/p-spoof',
    validProject({ ownerUid: 'bob' }),
  ));
});

test('2. self-verification: regular users cannot create verified listings', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  await expectDenied('self-verify', createDoc(alice.firestore(), 'projects/p-verify',
    validProject({ verificationStatus: 'verified' }),
  ));
});

test('3. undeclared fields are rejected (hasOnly)', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  await expectDenied('ghost field', createDoc(alice.firestore(), 'projects/p-ghost',
    validProject({ isFeaturedAdminPick: true }),
  ));
});

test('4. oversized document IDs are rejected', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const oversizedId = 'a'.repeat(1500);
  await expectDenied('1500-char document id', createDoc(alice.firestore(), `projects/${oversizedId}`, validProject()));
});

test('5. unbounded strings/arrays are rejected', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const fs = alice.firestore();
  await expectDenied('techStack with 50 items', createDoc(fs, 'projects/p-stack',
    validProject({ techStack: Array.from({ length: 50 }, (_, i) => `tech-${i}`) }),
  ));
  await expectDenied('description over 4000 chars', createDoc(fs, 'projects/p-desc',
    validProject({ description: 'x'.repeat(4001) }),
  ));
});

test('6. immutable ownerUid/createdAt cannot be reassigned', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const fs = alice.firestore();
  await assertSucceeds(createDoc(fs, 'projects/p-immut', validProject()));
  await expectDenied('ownerUid reassignment', updateDoc(doc(fs, 'projects/p-immut'), { ownerUid: 'bob' }));
  await expectDenied('createdAt reassignment', updateDoc(doc(fs, 'projects/p-immut'), {
    createdAt: Timestamp.fromMillis(0),
  }));
});

test('7. client-fabricated timestamps are rejected', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  await expectDenied('past createdAt on create', createDoc(alice.firestore(), 'projects/p-ts',
    validProject({ createdAt: Timestamp.fromMillis(0) }),
  ));
});

test('8. unverified email cannot write', { skip: !RUN }, async () => {
  const t = requireEnv();
  const carol = t.authenticatedContext('carol', { email: 'carol@example.com', email_verified: false });
  await expectDenied('unverified user create', createDoc(carol.firestore(), 'projects/p-unver', validProject({
    ownerUid: 'carol', makerName: 'Carol',
  })));
});

test('9. spoofed admin email (unverified) cannot read private PII', { skip: !RUN }, async () => {
  const t = requireEnv();
  const mallory = t.authenticatedContext('mallory', {
    email: 'kwpark0047@iceu.kr',
    email_verified: false,
  });
  await expectDenied('spoofed admin PII read', getDoc(doc(mallory.firestore(), 'users/victim/private/info')));
});

test('10. like/bookmark counter cannot be manipulated by +999', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const fs = alice.firestore();
  await assertSucceeds(createDoc(fs, 'projects/p-counter', validProject()));
  await expectDenied('likesCount +999', updateDoc(doc(fs, 'projects/p-counter'), { likesCount: 999 }));
  await expectDenied('bookmarksCount +999', updateDoc(doc(fs, 'projects/p-counter'), { bookmarksCount: 999 }));
});

test('11. claims cannot jump to terminal state without admin', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const fs = alice.firestore();
  await expectDenied('claim created as approved', createDoc(fs, 'ownershipClaims/c-approve',
    pendingClaim({ status: 'approved' }),
  ));
  await assertSucceeds(createDoc(fs, 'ownershipClaims/c2', pendingClaim()));
  await expectDenied('claim auto-approved by claimant', updateDoc(doc(fs, 'ownershipClaims/c2'), { status: 'approved' }));
});

test('12. list queries cannot scrape other users\' reports/claims', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const bob = t.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true });
  const fs = alice.firestore();
  await assertSucceeds(createDoc(fs, 'reports/r2', pendingReport()));
  await assertSucceeds(createDoc(fs, 'ownershipClaims/c3', pendingClaim()));
  await expectDenied("bob's /reports list", snapshotDocs(bob.firestore(), 'reports'));
  await expectDenied("bob's /ownershipClaims list", snapshotDocs(bob.firestore(), 'ownershipClaims'));
  await expectDenied("bob reading alice's report", getDoc(doc(bob.firestore(), 'reports/r2')));
  await expectDenied("bob reading alice's claim", getDoc(doc(bob.firestore(), 'ownershipClaims/c3')));
});

// ---------------------------------------------------------------------------
// Admin moderation (main + sub admin identities from `security_spec.md`)
// ---------------------------------------------------------------------------

test('main admin can list and moderate reports/claims and verify projects', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const admin = t.authenticatedContext('main-admin', {
    email: 'kwpark0047@gmail.com',
    email_verified: true,
  });

  await assertSucceeds(createDoc(alice.firestore(), 'reports/admin-r1', pendingReport()));
  await assertSucceeds(createDoc(alice.firestore(), 'ownershipClaims/admin-c1', pendingClaim()));
  await assertSucceeds(createDoc(alice.firestore(), 'projects/admin-p1', validProject()));

  // Admin-wide list queries are the moderation dashboard's data source.
  await assertSucceeds(snapshotDocs(admin.firestore(), 'reports'));
  await assertSucceeds(snapshotDocs(admin.firestore(), 'ownershipClaims'));

  const adminFs = admin.firestore();
  const reportRef = doc(adminFs, 'reports/admin-r1');
  const reportSnap = await getDoc(reportRef);
  assert.ok(reportSnap.exists(), 'report fixture should exist before moderation');
  await assertSucceeds(
    setDoc(reportRef, {
      ...reportSnap.data(),
      status: 'resolved',
      updatedAt: serverTimestamp(),
    }),
  );

  const claimRef = doc(adminFs, 'ownershipClaims/admin-c1');
  const claimSnap = await getDoc(claimRef);
  assert.ok(claimSnap.exists(), 'claim fixture should exist before moderation');
  await assertSucceeds(
    setDoc(claimRef, {
      ...claimSnap.data(),
      status: 'approved',
      updatedAt: serverTimestamp(),
    }),
  );

  const projectRef = doc(adminFs, 'projects/admin-p1');
  const projectSnap = await getDoc(projectRef);
  assert.ok(projectSnap.exists(), 'project fixture should exist before moderation');
  await assertSucceeds(
    setDoc(projectRef, {
      ...projectSnap.data(),
      verificationStatus: 'verified',
      updatedAt: serverTimestamp(),
    }),
  );

  // Resolved reports are terminal; the rules reject reopening them.
  await expectDenied(
    'reopening a resolved report',
    setDoc(reportRef, {
      ...reportSnap.data(),
      status: 'open',
      updatedAt: serverTimestamp(),
    }),
  );

  await assertSucceeds(deleteDoc(projectRef));
});

test('sub admin can list and resolve reports', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const subAdmin = t.authenticatedContext('sub-admin', {
    email: 'kwpark0047@iceu.kr',
    email_verified: true,
  });

  await assertSucceeds(createDoc(alice.firestore(), 'reports/sub-r1', pendingReport()));
  await assertSucceeds(snapshotDocs(subAdmin.firestore(), 'reports'));

  const ref = doc(subAdmin.firestore(), 'reports/sub-r1');
  const snap = await getDoc(ref);
  assert.ok(snap.exists(), 'report fixture should exist before moderation');
  await assertSucceeds(
    setDoc(ref, {
      ...snap.data(),
      status: 'reviewed',
      updatedAt: serverTimestamp(),
    }),
  );
});

test('unverified admin email cannot use moderation queries', { skip: !RUN }, async () => {
  const t = requireEnv();
  const alice = t.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const unverified = t.authenticatedContext('unverified-admin', {
    email: 'kwpark0047@gmail.com',
    email_verified: false,
  });

  await assertSucceeds(createDoc(alice.firestore(), 'reports/unverified-r1', pendingReport()));
  await expectDenied("unverified admin's /reports list", snapshotDocs(unverified.firestore(), 'reports'));
});

