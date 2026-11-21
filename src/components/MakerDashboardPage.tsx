import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Bookmark, Heart, LogIn, Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  ActivePage,
  AppLanguage,
  CatalogProject,
  OwnershipClaimRecord,
  ProjectReportRecord,
} from '../types/vibeatlas';
import { UI_STRINGS } from '../data/i18n';
import {
  computeMakerEngagementSummary,
  computeProjectEngagementRows,
  type MakerAnalyticsSort,
} from '../lib/makerAnalytics';
import { ProjectCard } from './ProjectCard';

interface MakerDashboardPageProps {
  language: AppLanguage;
  user: User | null;
  projects: CatalogProject[];
  likedIds: Set<string>;
  bookmarkedIds: Set<string>;
  reports: ProjectReportRecord[];
  claims: OwnershipClaimRecord[];
  syncingProjectId: string | null;
  onSignIn: () => void;
  onNavigate: (page: ActivePage) => void;
  onOpenDetail: (project: CatalogProject) => void;
  onToggleLike: (project: CatalogProject) => void;
  onToggleBookmark: (project: CatalogProject) => void;
  onSyncProject: (project: CatalogProject) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
}

type MakerTab = 'projects' | 'bookmarks' | 'governance';

export function MakerDashboardPage({
  language,
  user,
  projects,
  likedIds,
  bookmarkedIds,
  reports,
  claims,
  syncingProjectId,
  onSignIn,
  onNavigate,
  onOpenDetail,
  onToggleLike,
  onToggleBookmark,
  onSyncProject,
  onDeleteProject,
}: MakerDashboardPageProps) {
  const [tab, setTab] = useState<MakerTab>(user ? 'projects' : 'bookmarks');
  const [analyticsSort, setAnalyticsSort] = useState<MakerAnalyticsSort>('engagement');
  const prevUidRef = useRef<string | null>(user?.uid ?? null);
  const copy = UI_STRINGS[language].maker;

  useEffect(() => {
    const currentUid = user?.uid ?? null;
    if (!prevUidRef.current && currentUid) {
      setTab('projects');
    }
    prevUidRef.current = currentUid;
  }, [user?.uid]);

  const myProjects = useMemo(
    () => (user ? projects.filter((p) => p.ownerUid === user.uid) : []),
    [user, projects]
  );
  const bookmarkedProjects = useMemo(
    () => projects.filter((p) => bookmarkedIds.has(p.id)),
    [projects, bookmarkedIds]
  );

  const engagementSummary = useMemo(
    () => computeMakerEngagementSummary(myProjects),
    [myProjects]
  );
  const engagementRows = useMemo(
    () => computeProjectEngagementRows(myProjects, analyticsSort),
    [myProjects, analyticsSort]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('submit')}
          className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
        >
          {UI_STRINGS[language].nav.primaryCta}
        </button>
      </div>

      {!user && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {copy.signInCtaTitle}
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{copy.signInCtaBody}</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <LogIn className="h-4 w-4" />
            <span>{UI_STRINGS[language].workspace.signInGoogle}</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'projects'}
            onClick={() => setTab('projects')}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold ${
              tab === 'projects'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {copy.myProjectsTab} ({myProjects.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'bookmarks'}
            onClick={() => setTab('bookmarks')}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold ${
              tab === 'bookmarks'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {copy.myBookmarksTab} ({bookmarkedProjects.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'governance'}
            onClick={() => setTab('governance')}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold ${
              tab === 'governance'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {copy.claimsReportsTab} ({claims.length + reports.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tab === 'projects' && (
          <div className="space-y-6">
            {/* Project Engagement Analytics Section */}
            <section
              aria-labelledby="maker-analytics-heading"
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                    <h2
                      id="maker-analytics-heading"
                      className="text-sm font-bold text-slate-900 dark:text-white"
                    >
                      {copy.analyticsTitle}
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {copy.analyticsSubtitle}
                  </p>
                </div>

                {myProjects.length > 0 && (
                  <div
                    role="group"
                    aria-label={copy.analyticsTitle}
                    className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950"
                  >
                    {(
                      [
                        ['engagement', copy.analyticsSortEngagement],
                        ['likes', copy.analyticsSortLikes],
                        ['bookmarks', copy.analyticsSortBookmarks],
                        ['recent', copy.analyticsSortRecent],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAnalyticsSort(key)}
                        className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          analyticsSort === key
                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* KPI Totals Strip */}
              <div className="grid grid-cols-2 divide-y divide-slate-200 border-b border-slate-200 sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800">
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {copy.metricOwnedProjects}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {engagementSummary.totalProjects.toLocaleString()}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {copy.metricTotalLikes}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
                    {engagementSummary.totalLikes.toLocaleString()}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {copy.metricTotalBookmarks}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                    {engagementSummary.totalBookmarks.toLocaleString()}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {copy.metricTotalEngagement}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {engagementSummary.totalEngagement.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Per-project Engagement Table */}
              {engagementRows.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {copy.noProjectsYet}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {copy.analyticsEmptyHint}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('submit')}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{UI_STRINGS[language].nav.primaryCta}</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                          <th scope="col" className="px-5 py-2.5 font-medium">
                            {copy.tableProjectCol}
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                            {copy.tableLikesCol}
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                            {copy.tableBookmarksCol}
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                            {copy.tableTotalCol}
                          </th>
                          <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">
                            {copy.tableSplitCol}
                          </th>
                          <th scope="col" className="px-5 py-2.5 text-right font-medium whitespace-nowrap">
                            {copy.tableGithubCol}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {engagementRows.map((row) => (
                          <tr
                            key={row.project.id}
                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-3">
                              <button
                                type="button"
                                onClick={() => onOpenDetail(row.project)}
                                className="font-semibold text-slate-900 hover:text-blue-700 hover:underline dark:text-white dark:hover:text-blue-400"
                              >
                                {row.project.name}
                              </button>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{row.project.verificationStatus}</span>
                                <span aria-hidden="true">·</span>
                                <span>{row.project.contentType}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-rose-700 dark:text-rose-400">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Heart className="h-3 w-3" aria-hidden="true" />
                                {row.likesCount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-blue-700 dark:text-blue-400">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Bookmark className="h-3 w-3" aria-hidden="true" />
                                {row.bookmarksCount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                              {row.totalEngagement.toLocaleString()}
                            </td>
                            <td className="hidden w-48 px-4 py-3 md:table-cell">
                              <div
                                className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                                title={`${copy.tableLikesCol}: ${row.likesCount} · ${copy.tableBookmarksCol}: ${row.bookmarksCount}`}
                              >
                                {row.totalEngagement > 0 && (
                                  <div
                                    className="flex h-full overflow-hidden rounded-full"
                                    style={{ width: `${Math.max(row.barWidthPercent, 6)}%` }}
                                  >
                                    {row.likesSegmentPercent > 0 && (
                                      <span
                                        className="h-full bg-rose-500 dark:bg-rose-400"
                                        style={{ width: `${row.likesSegmentPercent}%` }}
                                      />
                                    )}
                                    {row.bookmarksSegmentPercent > 0 && (
                                      <span
                                        className="h-full bg-blue-600 dark:bg-blue-400"
                                        style={{ width: `${row.bookmarksSegmentPercent}%` }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Star className="h-3 w-3" aria-hidden="true" />
                                {row.githubStars.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                    <span>
                      {copy.metricExternalStarsNote}:{' '}
                      <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                        ★ {engagementSummary.totalGithubStars.toLocaleString()}
                      </strong>
                    </span>
                    {engagementSummary.topProject && (
                      <span>
                        {copy.topProjectLabel}:{' '}
                        <button
                          type="button"
                          onClick={() => onOpenDetail(engagementSummary.topProject!)}
                          className="font-semibold text-slate-900 hover:text-blue-700 hover:underline dark:text-white dark:hover:text-blue-400"
                        >
                          {engagementSummary.topProject.name}
                        </button>{' '}
                        <span className="font-mono tabular-nums">
                          (
                          {(
                            engagementSummary.topProject.likesCount +
                            engagementSummary.topProject.bookmarksCount
                          ).toLocaleString()}
                          )
                        </span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* User-Owned Project Management List */}
            {myProjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {copy.projectListHeading} ({myProjects.length})
                </h3>
                <div className="space-y-3">
                  {myProjects.map((proj) => {
                    const projTotalEngagement = proj.likesCount + proj.bookmarksCount;
                    return (
                      <div
                        key={proj.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onOpenDetail(proj)}
                            className="text-base font-semibold text-slate-900 hover:text-blue-700 hover:underline dark:text-white dark:hover:text-blue-400"
                          >
                            {proj.name}
                          </button>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>{proj.verificationStatus}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                              ♥ {proj.likesCount.toLocaleString()} {copy.likesUnit}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-blue-700 dark:text-blue-400">
                              {proj.bookmarksCount.toLocaleString()} {copy.bookmarksUnit}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono font-medium tabular-nums text-slate-700 dark:text-slate-200">
                              {projTotalEngagement.toLocaleString()} {copy.engagementUnit}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              ★ {proj.githubStars.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.githubRepo && (
                            <button
                              type="button"
                              disabled={syncingProjectId === proj.id}
                              onClick={() => onSyncProject(proj)}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <RefreshCw
                                className={`h-3.5 w-3.5 ${syncingProjectId === proj.id ? 'animate-spin' : ''}`}
                              />
                              <span>{copy.resyncGithub}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void onDeleteProject(proj.id)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{copy.deleteProject}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'bookmarks' && (
          <div>
            {bookmarkedProjects.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-300">{copy.noBookmarksYet}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {bookmarkedProjects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    language={language}
                    isLiked={likedIds.has(proj.id)}
                    isBookmarked={bookmarkedIds.has(proj.id)}
                    onOpenDetail={onOpenDetail}
                    onToggleLike={onToggleLike}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'governance' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ownership Claims ({claims.length})
              </h2>
              <div className="mt-3 space-y-2.5">
                {claims.length === 0 ? (
                  <p className="text-xs text-slate-500">No claims submitted yet.</p>
                ) : (
                  claims.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {c.projectSlug} · {c.status}
                      </p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{c.proofNote}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Submitted Reports ({reports.length})
              </h2>
              <div className="mt-3 space-y-2.5">
                {reports.length === 0 ? (
                  <p className="text-xs text-slate-500">No reports submitted yet.</p>
                ) : (
                  reports.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {r.projectSlug} · {r.reason} · {r.status}
                      </p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{r.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
