import type {
  OwnershipClaimRecord,
  ProjectActivityRecord,
  ProjectReportRecord,
} from '../types/vibeatlas';

export interface CommunityActivityUser {
  uid: string;
  name?: string;
}

export interface MergeCommunityActivitiesInput {
  projectId: string;
  firestoreActivities?: readonly ProjectActivityRecord[];
  localActivities?: readonly ProjectActivityRecord[];
  userReports?: readonly ProjectReportRecord[];
  /** The signed-in viewer, when the feed should mark their own items. */
  currentUser?: CommunityActivityUser | null;
}

function fromReport(
  report: ProjectReportRecord,
  currentUser: CommunityActivityUser | null | undefined
): ProjectActivityRecord {
  const mine = currentUser !== null && currentUser !== undefined && report.reporterUid === currentUser.uid;
  return {
    id: `report:${report.id}`,
    projectId: report.projectId,
    kind: 'report',
    actorUid: report.reporterUid,
    actorLabel: mine && currentUser?.name ? currentUser.name : undefined,
    note: report.details,
    status: report.status,
    createdAtIso: report.createdAtIso,
  };
}

function fromClaim(
  claim: OwnershipClaimRecord,
  currentUser: CommunityActivityUser | null | undefined
): ProjectActivityRecord {
  const mine = currentUser !== null && currentUser !== undefined && claim.claimantUid === currentUser.uid;
  return {
    id: `claim:${claim.id}`,
    projectId: claim.projectId,
    kind: 'claim',
    actorUid: claim.claimantUid,
    actorLabel: mine && currentUser?.name ? currentUser.name : undefined,
    note: claim.proofNote,
    status: claim.status,
    method: claim.verificationMethod,
    createdAtIso: claim.createdAtIso,
  };
}

/**
 * Viewer-scoped by design: a "community activity" feed must not become a
 * project-wide surveillance surface. Callers merge (a) activities already
 * readable for the viewer through the app's existing Firestore paths, (b)
 * locally-originated items the parent supplies, and (c) the viewer's reports.
 */
export function mergeAndSortCommunityActivities(
  input: MergeCommunityActivitiesInput
): ProjectActivityRecord[] {
  const {
    projectId,
    firestoreActivities = [],
    localActivities = [],
    userReports = [],
    currentUser = null,
  } = input;

  const merged: ProjectActivityRecord[] = [];
  const seen = new Set<string>();
  const push = (record: ProjectActivityRecord): void => {
    if (record.projectId && record.projectId !== projectId) return;
    const scoped = { ...record, projectId: record.projectId || projectId };
    if (seen.has(scoped.id)) return;
    seen.add(scoped.id);
    merged.push(scoped);
  };

  for (const record of [...localActivities, ...firestoreActivities]) push(record);
  for (const report of userReports) push(fromReport(report, currentUser));
  // Claims already arrive as ProjectActivityRecord via subscribeToProjectActivities.
  return merged.sort((a, b) => {
    const at = Date.parse(a.createdAtIso);
    const bt = Date.parse(b.createdAtIso);
    const aTime = Number.isNaN(at) ? 0 : at;
    const bTime = Number.isNaN(bt) ? 0 : bt;
    return bTime - aTime;
  });
}
