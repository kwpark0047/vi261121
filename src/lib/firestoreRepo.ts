import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import { mergeAndSortCommunityActivities } from './communityActivity';
import type {
  AppLanguage,
  CatalogProject,
  OwnershipClaimRecord,
  ProjectActivityRecord,
  ProjectReportRecord,
  VerificationStatus,
} from '../types/vibeatlas';

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export async function syncSignedInUserProfile(user: User): Promise<void> {
  const publicPath = `users/${user.uid}/public/profile`;
  const privatePath = `users/${user.uid}/private/info`;

  try {
    await setDoc(
      doc(db, 'users', user.uid, 'public', 'profile'),
      {
        uid: user.uid,
        displayName: (user.displayName || 'W-Vibe Maker').slice(0, 100),
        handle: user.email ? `@${user.email.split('@')[0].slice(0, 50)}` : '',
        bio: '',
        country: 'KR',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, publicPath);
  }

  try {
    const privateRef = doc(db, 'users', user.uid, 'private', 'info');
    const existing = await getDoc(privateRef);
    if (!existing.exists()) {
      await setDoc(privateRef, {
        uid: user.uid,
        email: (user.email || 'unknown@example.com').slice(0, 200),
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, privatePath);
  }
}

export function subscribeToFirestoreProjects(
  onData: (projects: CatalogProject[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'projects';
  const q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CatalogProject[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          slug: String(data.slug || d.id),
          name: String(data.name || ''),
          tagline: String(data.tagline || ''),
          taglineKo: String(data.taglineKo || ''),
          description: String(data.description || ''),
          descriptionKo: String(data.descriptionKo || ''),
          contentType: data.contentType || 'web_app',
          categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
          techStack: Array.isArray(data.techStack) ? data.techStack.map(String) : [],
          developmentPlatform: data.developmentPlatform || 'custom',
          hostingProvider: data.hostingProvider || 'unknown',
          backendTech: data.backendTech || 'unknown',
          country: String(data.country || 'KR'),
          language: data.language || 'ko',
          license: String(data.license || 'Unknown'),
          pricingModel: data.pricingModel || 'free',
          verificationStatus: data.verificationStatus || 'unverified',
          provenanceSource: data.provenanceSource || 'maker_submitted',
          liveDemoUrl: String(data.liveDemoUrl || ''),
          websiteUrl: String(data.websiteUrl || ''),
          githubRepo: String(data.githubRepo || ''),
          githubUrl: String(data.githubUrl || ''),
          thumbnailUrl: String(data.thumbnailUrl || ''),
          makerName: String(data.makerName || ''),
          makerHandle: String(data.makerHandle || ''),
          ownerUid: String(data.ownerUid || ''),
          githubStars: Number(data.githubStars || 0),
          githubForks: Number(data.githubForks || 0),
          likesCount: Number(data.likesCount || 0),
          bookmarksCount: Number(data.bookmarksCount || 0),
          lastSyncedAt: String(data.lastSyncedAt || ''),
          createdAtIso: toIsoString(data.createdAt),
          updatedAtIso: toIsoString(data.updatedAt),
          isCuratedSeed: false,
        };
      });
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeToUserBookmarks(
  userId: string,
  onData: (projectIds: Set<string>) => void
): Unsubscribe {
  const path = `users/${userId}/bookmarks`;
  const q = query(collection(db, 'users', userId, 'bookmarks'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      onData(new Set(snap.docs.map((d) => d.id)));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createFirestoreProject(
  user: User,
  payload: Omit<
    CatalogProject,
    'id' | 'ownerUid' | 'likesCount' | 'bookmarksCount' | 'createdAtIso' | 'updatedAtIso'
  >
): Promise<string> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `projects/${projectId}`;
  try {
    await setDoc(doc(db, 'projects', projectId), {
      slug: payload.slug.slice(0, 100),
      name: payload.name.slice(0, 120),
      tagline: payload.tagline.slice(0, 220),
      taglineKo: payload.taglineKo.slice(0, 220),
      description: payload.description.slice(0, 4000),
      descriptionKo: payload.descriptionKo.slice(0, 4000),
      contentType: payload.contentType,
      categories: payload.categories.slice(0, 6),
      techStack: payload.techStack.slice(0, 12),
      developmentPlatform: payload.developmentPlatform,
      hostingProvider: payload.hostingProvider,
      backendTech: payload.backendTech,
      country: payload.country.slice(0, 12),
      language: payload.language,
      license: payload.license.slice(0, 64),
      pricingModel: payload.pricingModel,
      verificationStatus: 'unverified',
      provenanceSource: payload.provenanceSource,
      liveDemoUrl: payload.liveDemoUrl.slice(0, 500),
      websiteUrl: payload.websiteUrl.slice(0, 500),
      githubRepo: payload.githubRepo.slice(0, 160),
      githubUrl: payload.githubUrl.slice(0, 500),
      thumbnailUrl: payload.thumbnailUrl.slice(0, 500),
      makerName: payload.makerName.slice(0, 100),
      makerHandle: payload.makerHandle.slice(0, 80),
      ownerUid: user.uid,
      githubStars: Math.max(0, Math.floor(payload.githubStars)),
      githubForks: Math.max(0, Math.floor(payload.githubForks)),
      likesCount: 0,
      bookmarksCount: 0,
      lastSyncedAt: payload.lastSyncedAt.slice(0, 64),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return projectId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateProjectGitHubStats(
  projectId: string,
  stars: number,
  forks: number,
  license: string
): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      githubStars: Math.max(0, Math.floor(stars)),
      githubForks: Math.max(0, Math.floor(forks)),
      license: license.slice(0, 64),
      lastSyncedAt: new Date().toISOString(),
      provenanceSource: 'github_sync',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreProject(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function toggleFirestoreBookmark(
  user: User,
  project: CatalogProject,
  currentlyBookmarked: boolean
): Promise<void> {
  const bookmarkPath = `users/${user.uid}/bookmarks/${project.id}`;
  const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', project.id);
  const parentRef = doc(db, 'projects', project.id);

  try {
    if (project.isCuratedSeed) {
      if (currentlyBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          projectId: project.id,
          projectSlug: project.slug.slice(0, 120),
          projectName: project.name.slice(0, 120),
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      return;
    }

    const batch = writeBatch(db);
    if (currentlyBookmarked) {
      batch.delete(bookmarkRef);
      batch.update(parentRef, {
        bookmarksCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(bookmarkRef, {
        projectId: project.id,
        projectSlug: project.slug.slice(0, 120),
        projectName: project.name.slice(0, 120),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      batch.update(parentRef, {
        bookmarksCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, bookmarkPath);
  }
}

export async function toggleFirestoreLike(
  user: User,
  project: CatalogProject,
  currentlyLiked: boolean
): Promise<void> {
  const likePath = `projects/${project.id}/likes/${user.uid}`;
  if (project.isCuratedSeed) {
    return;
  }

  const batch = writeBatch(db);
  const likeRef = doc(db, 'projects', project.id, 'likes', user.uid);
  const parentRef = doc(db, 'projects', project.id);

  try {
    if (currentlyLiked) {
      batch.delete(likeRef);
      batch.update(parentRef, {
        likesCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(likeRef, {
        projectId: project.id,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      batch.update(parentRef, {
        likesCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, likePath);
  }
}

export async function submitReportToFirestore(
  user: User,
  project: CatalogProject,
  reason: ProjectReportRecord['reason'],
  details: string
): Promise<void> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const path = `reports/${reportId}`;
  try {
    await setDoc(doc(db, 'reports', reportId), {
      projectId: project.id.slice(0, 128),
      projectSlug: project.slug.slice(0, 120),
      reporterUid: user.uid,
      reason,
      details: details.slice(0, 1000),
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function submitOwnershipClaimToFirestore(
  user: User,
  project: CatalogProject,
  verificationMethod: OwnershipClaimRecord['verificationMethod'],
  proofNote: string
): Promise<void> {
  const claimId = `clm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const path = `ownershipClaims/${claimId}`;
  try {
    await setDoc(doc(db, 'ownershipClaims', claimId), {
      projectId: project.id.slice(0, 128),
      projectSlug: project.slug.slice(0, 120),
      claimantUid: user.uid,
      verificationMethod,
      proofNote: proofNote.slice(0, 1000),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function subscribeToUserReports(
  userId: string,
  onData: (reports: ProjectReportRecord[]) => void
): Unsubscribe {
  const path = 'reports';
  const q = query(collection(db, 'reports'), where('reporterUid', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            projectId: String(data.projectId || ''),
            projectSlug: String(data.projectSlug || ''),
            reporterUid: String(data.reporterUid || ''),
            reason: data.reason || 'broken_link',
            details: String(data.details || ''),
            status: data.status || 'open',
            createdAtIso: toIsoString(data.createdAt),
          };
        })
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

export function subscribeToUserClaims(
  userId: string,
  onData: (claims: OwnershipClaimRecord[]) => void
): Unsubscribe {
  const path = 'ownershipClaims';
  const q = query(collection(db, 'ownershipClaims'), where('claimantUid', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            projectId: String(data.projectId || ''),
            projectSlug: String(data.projectSlug || ''),
            claimantUid: String(data.claimantUid || ''),
            verificationMethod: data.verificationMethod || 'github_repo',
            proofNote: String(data.proofNote || ''),
            status: data.status || 'pending',
            createdAtIso: toIsoString(data.createdAt),
          };
        })
      );
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// ---------------------------------------------------------------------------
// Admin moderation (main/sub admin). Firestore rules enforce every write;
// these helpers just keep the client payloads in the exact shapes the rules
// validate. Updates send the full existing document because the project rules
// re-validate the complete shape on every write.
// ---------------------------------------------------------------------------

/**
 * Viewer-scoped project activity: composes the app's existing user-scoped
 * report/claim subscriptions (the Firestore rules expose those to the
 * reporter/claimant and admins only) filtered to one project. Likes and
 * bookmarks are not readable per-viewer on today's rules, so those arrive via
 * `localActivities` supplied by the parent when a caller can source them.
 * Snapshot failures surface through the repo's shared handleFirestoreError
 * (matching every other subscription in this module).
 */
export function subscribeToProjectActivities(
  projectId: string,
  viewerUid: string | null,
  onData: (activities: ProjectActivityRecord[]) => void
): Unsubscribe {
  if (!viewerUid) {
    onData([]);
    return () => undefined;
  }

  const unsubscribes: Unsubscribe[] = [];
  let reportItems: ProjectActivityRecord[] = [];
  let claimItems: ProjectActivityRecord[] = [];

  const emit = (): void => {
    onData(
      mergeAndSortCommunityActivities({
        projectId,
        firestoreActivities: [...reportItems, ...claimItems],
      })
    );
  };

  unsubscribes.push(
    subscribeToUserReports(
      viewerUid,
      (list) => {
        reportItems = list
          .filter((report) => report.projectId === projectId)
          .map((report) => ({
            id: `report:${report.id}`,
            projectId: report.projectId,
            kind: 'report' as const,
            actorUid: report.reporterUid,
            note: report.details,
            status: report.status,
            createdAtIso: report.createdAtIso,
          }));
        emit();
      }
    )
  );

  unsubscribes.push(
    subscribeToUserClaims(
      viewerUid,
      (list) => {
        claimItems = list
          .filter((claim) => claim.projectId === projectId)
          .map((claim) => ({
            id: `claim:${claim.id}`,
            projectId: claim.projectId,
            kind: 'claim' as const,
            actorUid: claim.claimantUid,
            note: claim.proofNote,
            status: claim.status,
            method: claim.verificationMethod,
            createdAtIso: claim.createdAtIso,
          }));
        emit();
      }
    )
  );

  return () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };
}

export function subscribeToAllReports(
  onData: (reports: ProjectReportRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'reports';
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            projectId: String(data.projectId || ''),
            projectSlug: String(data.projectSlug || ''),
            reporterUid: String(data.reporterUid || ''),
            reason: data.reason || 'broken_link',
            details: String(data.details || ''),
            status: data.status || 'open',
            createdAtIso: toIsoString(data.createdAt),
            updatedAtIso: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
          };
        })
      );
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export function subscribeToAllClaims(
  onData: (claims: OwnershipClaimRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'ownershipClaims';
  const q = query(collection(db, 'ownershipClaims'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            projectId: String(data.projectId || ''),
            projectSlug: String(data.projectSlug || ''),
            claimantUid: String(data.claimantUid || ''),
            verificationMethod: data.verificationMethod || 'github_repo',
            proofNote: String(data.proofNote || ''),
            status: data.status || 'pending',
            createdAtIso: toIsoString(data.createdAt),
            updatedAtIso: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
          };
        })
      );
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function updateReportStatus(
  reportId: string,
  status: ProjectReportRecord['status']
): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    const ref = doc(db, 'reports', reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error('Report not found.');
    }
    await setDoc(ref, {
      ...snap.data(),
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateClaimStatus(
  claimId: string,
  status: OwnershipClaimRecord['status']
): Promise<void> {
  const path = `ownershipClaims/${claimId}`;
  try {
    const ref = doc(db, 'ownershipClaims', claimId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error('Ownership claim not found.');
    }
    await setDoc(ref, {
      ...snap.data(),
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateProjectVerificationStatus(
  projectId: string,
  verificationStatus: VerificationStatus
): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    const ref = doc(db, 'projects', projectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error('Project not found.');
    }
    await setDoc(ref, {
      ...snap.data(),
      verificationStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function subscribeNewsletterInFirestore(
  user: User,
  email: string,
  preferredLanguage: AppLanguage
): Promise<void> {
  const subId = `sub_${user.uid.slice(0, 64)}`;
  const path = `newsletterSubscribers/${subId}`;
  try {
    await setDoc(doc(db, 'newsletterSubscribers', subId), {
      uid: user.uid,
      email: email.slice(0, 200),
      preferredLanguage,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
