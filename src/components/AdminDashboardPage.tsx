import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  BadgeCheck,
  Bookmark,
  Check,
  ClipboardList,
  ExternalLink,
  Flag,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { getAdminRole } from '../lib/admin';
import {
  deleteFirestoreProject,
  subscribeToAllClaims,
  subscribeToAllReports,
  updateClaimStatus,
  updateProjectVerificationStatus,
  updateReportStatus,
} from '../lib/firestoreRepo';
import { ADMIN_STRINGS, PLATFORM_LABELS } from '../data/i18n';
import type {
  ActivePage,
  AppLanguage,
  CatalogProject,
  OwnershipClaimRecord,
  ProjectReportRecord,
  VerificationStatus,
} from '../types/vibeatlas';

type AdminTab = 'overview' | 'reports' | 'claims' | 'projects';

interface AdminDashboardPageProps {
  language: AppLanguage;
  user: User | null;
  authLoading: boolean;
  projects: CatalogProject[];
  onNavigate: (page: ActivePage) => void;
  onOpenDetail: (project: CatalogProject) => void;
}

function formatDate(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function toMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw) as { error?: unknown };
    if (typeof parsed.error === 'string' && parsed.error) return parsed.error;
  } catch {
    // not JSON
  }
  return raw;
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone =
    status === 'open' || status === 'pending'
      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
      : status === 'reviewed' || status === 'verified' || status === 'approved'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
        : status === 'resolved'
          ? 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200'
          : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export function AdminDashboardPage({
  language,
  user,
  authLoading,
  projects,
  onNavigate,
  onOpenDetail,
}: AdminDashboardPageProps) {
  const copy = ADMIN_STRINGS[language];
  const role = getAdminRole(user);
  const [tab, setTab] = useState<AdminTab>('overview');
  const [reports, setReports] = useState<ProjectReportRecord[]>([]);
  const [claims, setClaims] = useState<OwnershipClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!role) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubReports = subscribeToAllReports(
      (next) => {
        setReports(next);
        setLoading(false);
      },
      (err) => {
        setError(toMessage(err));
        setLoading(false);
      }
    );
    const unsubClaims = subscribeToAllClaims(
      (next) => setClaims(next),
      (err) => setError(toMessage(err))
    );
    return () => {
      unsubReports();
      unsubClaims();
    };
  }, [role]);

  const stats = useMemo(
    () => ({
      projects: projects.length,
      verified: projects.filter((p) => p.verificationStatus === 'verified').length,
      openReports: reports.filter((r) => r.status === 'open').length,
      pendingClaims: claims.filter((c) => c.status === 'pending').length,
      likes: projects.reduce((sum, p) => sum + p.likesCount, 0),
      bookmarks: projects.reduce((sum, p) => sum + p.bookmarksCount, 0),
    }),
    [projects, reports, claims]
  );

  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((p) =>
      [p.name, p.slug, p.makerName, p.ownerUid].some((value) => value.toLowerCase().includes(needle))
    );
  }, [projects, query]);

  const reportProject = (report: ProjectReportRecord): CatalogProject | undefined =>
    projects.find((p) => p.id === report.projectId || p.slug === report.projectSlug);

  const claimProject = (claim: OwnershipClaimRecord): CatalogProject | undefined =>
    projects.find((p) => p.id === claim.projectId || p.slug === claim.projectSlug);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-16 text-sm text-slate-500 sm:px-6 dark:text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        {copy.loading}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{copy.accessDeniedTitle}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{copy.accessDeniedBody}</p>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {copy.backHome}
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'overview', label: copy.tabs.overview, icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      id: 'reports',
      label: copy.tabs.reports,
      icon: <Flag className="h-4 w-4" />,
      badge: stats.openReports,
    },
    {
      id: 'claims',
      label: copy.tabs.claims,
      icon: <ClipboardList className="h-4 w-4" />,
      badge: stats.pendingClaims,
    },
    { id: 'projects', label: copy.tabs.projects, icon: <FolderKanban className="h-4 w-4" /> },
  ];

  const renderReportActions = (report: ProjectReportRecord) => {
    if (report.status === 'resolved') {
      return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>;
    }
    const id = `report:${report.id}`;
    const busy = busyId === id;
    return (
      <div className="flex flex-wrap gap-2">
        {report.status === 'open' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(id, () => updateReportStatus(report.id, 'reviewed'))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            {copy.reports.markReviewed}
          </button>
        )}
        {report.status === 'reviewed' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(id, () => updateReportStatus(report.id, 'open'))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-3 w-3" />
            {copy.reports.reopen}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(id, () => updateReportStatus(report.id, 'resolved'))}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <BadgeCheck className="h-3 w-3" />}
          {copy.reports.markResolved}
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{copy.title}</h1>
            <span className="rounded-full border border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
              {role === 'main' ? copy.mainAdmin : copy.subAdmin}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copy.backHome}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {copy.errorPrefix} {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {copy.loading}
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard icon={<FolderKanban className="h-4 w-4" />} label={copy.stats.projects} value={stats.projects} />
                <StatCard icon={<BadgeCheck className="h-4 w-4" />} label={copy.stats.verified} value={stats.verified} />
                <StatCard icon={<Flag className="h-4 w-4" />} label={copy.stats.openReports} value={stats.openReports} />
                <StatCard icon={<ClipboardList className="h-4 w-4" />} label={copy.stats.pendingClaims} value={stats.pendingClaims} />
                <StatCard icon={<Star className="h-4 w-4" />} label={copy.stats.likes} value={stats.likes} />
                <StatCard icon={<Bookmark className="h-4 w-4" />} label={copy.stats.bookmarks} value={stats.bookmarks} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{copy.reports.title}</h2>
                    <button
                      type="button"
                      onClick={() => setTab('reports')}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                    >
                      {copy.tabs.reports} →
                    </button>
                  </div>
                  {reports.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{copy.reports.empty}</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                      {reports.slice(0, 5).map((report) => (
                        <li key={report.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">
                            {report.projectSlug} · {copy.reasons[report.reason]}
                          </span>
                          <StatusBadge status={report.status} label={copy.status[report.status]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{copy.claims.title}</h2>
                    <button
                      type="button"
                      onClick={() => setTab('claims')}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                    >
                      {copy.tabs.claims} →
                    </button>
                  </div>
                  {claims.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{copy.claims.empty}</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                      {claims.slice(0, 5).map((claim) => (
                        <li key={claim.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{claim.projectSlug}</span>
                          <StatusBadge status={claim.status} label={copy.status[claim.status]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <section className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{copy.reports.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{copy.reports.subtitle}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{reports.length}</span>
              </div>
              {reports.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {copy.reports.empty}
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {reports.map((report) => {
                    const project = reportProject(report);
                    return (
                      <li
                        key={report.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={report.status} label={copy.status[report.status]} />
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {copy.reasons[report.reason]}
                              </span>
                              <button
                                type="button"
                                disabled={!project}
                                onClick={() => project && onOpenDetail(project)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline dark:text-indigo-300"
                              >
                                {report.projectSlug}
                                {project && <ExternalLink className="h-3 w-3" />}
                              </button>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                              {report.details || '—'}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                              {copy.reports.reporter}: <span className="font-mono">{report.reporterUid}</span> ·{' '}
                              {copy.reports.createdAt}: {formatDate(report.createdAtIso, language)}
                            </p>
                          </div>
                          <div className="shrink-0">{renderReportActions(report)}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {tab === 'claims' && (
            <section className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{copy.claims.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{copy.claims.subtitle}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{claims.length}</span>
              </div>
              {claims.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {copy.claims.empty}
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {claims.map((claim) => {
                    const project = claimProject(claim);
                    const id = `claim:${claim.id}`;
                    const busy = busyId === id;
                    return (
                      <li
                        key={claim.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={claim.status} label={copy.status[claim.status]} />
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {copy.methods[claim.verificationMethod]}
                              </span>
                              <button
                                type="button"
                                disabled={!project}
                                onClick={() => project && onOpenDetail(project)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline dark:text-indigo-300"
                              >
                                {claim.projectSlug}
                                {project && <ExternalLink className="h-3 w-3" />}
                              </button>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                              {claim.proofNote || '—'}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                              {copy.claims.claimant}: <span className="font-mono">{claim.claimantUid}</span> ·{' '}
                              {copy.claims.createdAt}: {formatDate(claim.createdAtIso, language)}
                            </p>
                          </div>
                          {claim.status === 'pending' && (
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void run(id, () => updateClaimStatus(claim.id, 'approved'))}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                              >
                                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                {copy.claims.approve}
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void run(id, () => updateClaimStatus(claim.id, 'rejected'))}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                              >
                                <X className="h-3 w-3" />
                                {copy.claims.reject}
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {tab === 'projects' && (
            <section className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{copy.projects.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{copy.projects.subtitle}</p>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={copy.projects.searchPlaceholder}
                    className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {copy.projects.empty}
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{copy.projects.name}</th>
                        <th className="px-4 py-3 font-semibold">{copy.projects.platform}</th>
                        <th className="px-4 py-3 font-semibold">{copy.projects.owner}</th>
                        <th className="px-4 py-3 font-semibold">{copy.projects.verification}</th>
                        <th className="px-4 py-3 text-right font-semibold">{copy.projects.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredProjects.map((project) => {
                        const id = `project:${project.id}`;
                        const busy = busyId === id;
                        const seed = Boolean(project.isCuratedSeed);
                        return (
                          <tr key={project.id} className="align-top">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900 dark:text-white">{project.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{project.slug}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {PLATFORM_LABELS[project.developmentPlatform]}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-slate-700 dark:text-slate-200">{project.makerName || '—'}</p>
                              <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{project.ownerUid}</p>
                            </td>
                            <td className="px-4 py-3">
                              {seed ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {copy.projects.seed}
                                </span>
                              ) : (
                                <select
                                  value={project.verificationStatus}
                                  disabled={busy}
                                  onChange={(e) =>
                                    void run(id, () =>
                                      updateProjectVerificationStatus(
                                        project.id,
                                        e.target.value as VerificationStatus
                                      )
                                    )
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                  <option value="verified">{copy.status.verified}</option>
                                  <option value="pending">{copy.status.pending}</option>
                                  <option value="unverified">{copy.status.unverified}</option>
                                </select>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => onOpenDetail(project)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {copy.projects.view}
                                </button>
                                {!seed && (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => {
                                      if (window.confirm(copy.projects.confirmDelete)) {
                                        void run(id, () => deleteFirestoreProject(project.id));
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                  >
                                    {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                    {copy.projects.delete}
                                  </button>
                                )}
                              </div>
                              {seed && (
                                <p className="mt-1 max-w-[220px] text-right text-[10px] text-slate-400 dark:text-slate-500">
                                  {copy.projects.noActions}
                                </p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
