import type { CatalogProject, DailySignalPoint } from '../types/vibeatlas';

export const STAR_SNAPSHOTS_STORAGE_KEY = 'vibeatlas_star_snapshots_v1';

/** Rolling window (calendar days) used for the Discover "trending" star badge. */
export const TRENDING_WINDOW_DAYS = 7;

/** Maximum number of projects that may carry the trending badge at once. */
export const TRENDING_BADGE_LIMIT = 3;

export interface StarGrowthPoint {
  date: string;
  shortDate: string;
  githubStars: number;
  githubStarsDelta: number;
  internalLikes: number;
  internalBookmarks: number;
}

export interface HistoricalGrowthSeries {
  points: StarGrowthPoint[];
  hasStarHistoryDeltas: boolean;
  isBaselineSnapshot: boolean;
  totalDelta14d: number;
}

type StoredRepoSnapshots = Record<string, Record<string, number>>;

function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return isoDate.slice(5, 10) || isoDate;
}

function toIsoDateDay(isoTimestamp: string): string | null {
  if (!isoTimestamp) return null;
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function loadStarSnapshots(
  githubRepo: string,
  storage: Storage | null | undefined = typeof window !== 'undefined' ? window.localStorage : null
): Record<string, number> {
  if (!storage || !githubRepo) return {};
  try {
    const raw = storage.getItem(STAR_SNAPSHOTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const repoMap = (parsed as StoredRepoSnapshots)[githubRepo.toLowerCase()];
    if (!repoMap || typeof repoMap !== 'object') return {};
    const valid: Record<string, number> = {};
    for (const [day, count] of Object.entries(repoMap)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(day) && typeof count === 'number' && Number.isFinite(count) && count >= 0) {
        valid[day] = count;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export function recordStarSnapshot(
  githubRepo: string,
  isoTimestamp: string,
  stars: number,
  storage: Storage | null | undefined = typeof window !== 'undefined' ? window.localStorage : null
): void {
  if (!storage || !githubRepo || !Number.isFinite(stars) || stars < 0) return;
  const day = toIsoDateDay(isoTimestamp);
  if (!day) return;
  try {
    const raw = storage.getItem(STAR_SNAPSHOTS_STORAGE_KEY);
    const parsed: StoredRepoSnapshots =
      raw && typeof JSON.parse(raw) === 'object' && JSON.parse(raw) !== null
        ? (JSON.parse(raw) as StoredRepoSnapshots)
        : {};
    const repoKey = githubRepo.toLowerCase();
    const existing = parsed[repoKey] && typeof parsed[repoKey] === 'object' ? { ...parsed[repoKey] } : {};
    existing[day] = Math.round(stars);

    // Keep at most the most recent 30 daily snapshots per repository
    const sortedEntries = Object.entries(existing)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30);
    parsed[repoKey] = Object.fromEntries(sortedEntries);
    storage.setItem(STAR_SNAPSHOTS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage quota or serialization failures silently
  }
}

function buildFallbackSignals(project: CatalogProject): DailySignalPoint[] {
  const anchorRaw =
    project.lastSyncedAt || project.updatedAtIso || project.createdAtIso || '2026-11-20T00:00:00.000Z';
  const anchorDate = new Date(anchorRaw);
  const baseTime = Number.isNaN(anchorDate.getTime())
    ? Date.UTC(2026, 10, 20)
    : Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());

  const days = 14;
  const likes = Math.max(0, Number(project.likesCount) || 0);
  const bookmarks = Math.max(0, Number(project.bookmarksCount) || 0);
  const out: DailySignalPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(baseTime - i * 86_400_000);
    const isLatest = i === 0;
    out.push({
      date: d.toISOString().slice(0, 10),
      githubStarsDelta: 0,
      internalLikes: isLatest ? likes : 0,
      internalBookmarks: isLatest ? bookmarks : 0,
    });
  }
  return out;
}

/**
 * Calendar-day window (inclusive at both ends) used to surface "trending"
 * projects: how many GitHub stars a listing gained within the last `days`
 * days, relative to `now`. Negative deltas are clamped at zero, matching the
 * growth series semantics (a star count never decreases).
 */
export function getStarGainInWindow(
  project: CatalogProject,
  days: number = TRENDING_WINDOW_DAYS,
  now: Date = new Date()
): number {
  const windowDays =
    Number.isFinite(days) && days >= 1 ? Math.floor(days) : TRENDING_WINDOW_DAYS;
  const reference = Number.isNaN(now.getTime()) ? new Date() : now;
  const today = toIsoDateDay(reference.toISOString()) ?? '';
  const windowStart = toIsoDateDay(
    new Date(reference.getTime() - (windowDays - 1) * 86_400_000).toISOString()
  );

  if (!windowStart || !today) return 0;

  const series = buildHistoricalGrowthSeries(project);
  let gain = 0;
  for (const point of series.points) {
    if (point.date < windowStart || point.date > today) continue;
    gain += Math.max(0, Number(point.githubStarsDelta) || 0);
  }
  return gain;
}

/**
 * Ranking helper for "trending" badges: projects with star gains inside the
 * window, highest gain first. Ties break on total stars, then name so the
 * badge set is stable across renders.
 */
export interface TrendingSelectionOptions {
  windowDays?: number;
  limit?: number;
  now?: Date;
}

export function selectTrendingProjects(
  projects: readonly CatalogProject[],
  options: TrendingSelectionOptions = {}
): CatalogProject[] {
  const { windowDays, limit = TRENDING_BADGE_LIMIT, now } = options;
  return projects
    .map((project) => ({ project, gain: getStarGainInWindow(project, windowDays, now) }))
    .filter((entry) => entry.gain > 0)
    .sort((a, b) => {
      if (b.gain !== a.gain) return b.gain - a.gain;
      if (b.project.githubStars !== a.project.githubStars) return b.project.githubStars - a.project.githubStars;
      return a.project.name < b.project.name ? -1 : a.project.name > b.project.name ? 1 : 0;
    })
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.project);
}

export function buildHistoricalGrowthSeries(
  project: CatalogProject,
  recordedSnapshots?: Record<string, number>
): HistoricalGrowthSeries {
  const baseSignals =
    project.historicalSignals && project.historicalSignals.length > 0
      ? [...project.historicalSignals]
      : buildFallbackSignals(project);

  // Align rightmost window date with lastSyncedAt if live sync happened on a newer UTC day
  const syncedDay = toIsoDateDay(project.lastSyncedAt);
  if (syncedDay && baseSignals.length > 0) {
    const lastDay = baseSignals[baseSignals.length - 1]?.date || '';
    if (syncedDay > lastDay) {
      baseSignals.push({
        date: syncedDay,
        githubStarsDelta: 0,
        internalLikes: Math.max(0, Number(project.likesCount) || 0),
        internalBookmarks: Math.max(0, Number(project.bookmarksCount) || 0),
      });
      if (baseSignals.length > 14) {
        baseSignals.shift();
      }
    }
  }

  const currentStars = Math.max(0, Number(project.githubStars) || 0);
  const snapshots = recordedSnapshots ?? (project.githubRepo ? loadStarSnapshots(project.githubRepo) : {});
  const snapshotDaysInWindow = baseSignals
    .map((pt) => pt.date)
    .filter((d) => typeof snapshots[d] === 'number');

  // Incorporate multi-day live snapshots into githubStarsDelta if caller supplied/recorded >= 2 distinct dates
  const sourceSignals: DailySignalPoint[] = baseSignals.map((pt) => ({ ...pt }));
  if (snapshotDaysInWindow.length >= 2) {
    let prevDayStars: number | null = null;
    for (const pt of sourceSignals) {
      const snapVal = snapshots[pt.date];
      if (typeof snapVal === 'number') {
        if (prevDayStars !== null) {
          pt.githubStarsDelta = Math.max(0, snapVal - prevDayStars);
        }
        prevDayStars = snapVal;
      }
    }
  }

  const hasStarHistoryDeltas = sourceSignals.some((pt) => (Number(pt.githubStarsDelta) || 0) !== 0);

  let totalDelta14d = 0;
  for (const pt of sourceSignals) {
    totalDelta14d += Math.max(0, Number(pt.githubStarsDelta) || 0);
  }

  const cumulativeStars = new Array<number>(sourceSignals.length).fill(0);
  let isBaselineSnapshot = false;

  if (sourceSignals.length > 0) {
    if (hasStarHistoryDeltas) {
      let running = currentStars;
      cumulativeStars[sourceSignals.length - 1] = running;
      for (let i = sourceSignals.length - 2; i >= 0; i -= 1) {
        const nextDelta = Math.max(0, Number(sourceSignals[i + 1]?.githubStarsDelta) || 0);
        running = Math.max(0, running - nextDelta);
        cumulativeStars[i] = running;
      }
    } else if (currentStars > 0) {
      // Single point-in-time GitHub REST API snapshot without recorded multi-day deltas:
      // render an honest flat baseline at the verified count rather than fabricating a cliff on day 14.
      isBaselineSnapshot = true;
      for (let i = 0; i < sourceSignals.length; i += 1) {
        cumulativeStars[i] = currentStars;
      }
    }
  }

  const points: StarGrowthPoint[] = sourceSignals.map((pt, idx) => ({
    date: pt.date,
    shortDate: formatShortDate(pt.date),
    githubStars: cumulativeStars[idx] ?? 0,
    githubStarsDelta: Math.max(0, Number(pt.githubStarsDelta) || 0),
    internalLikes: Math.max(0, Number(pt.internalLikes) || 0),
    internalBookmarks: Math.max(0, Number(pt.internalBookmarks) || 0),
  }));

  return {
    points,
    hasStarHistoryDeltas,
    isBaselineSnapshot,
    totalDelta14d,
  };
}
