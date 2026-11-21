import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Flag,
  GitFork,
  Heart,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  AppLanguage,
  CatalogProject,
  OwnershipClaimRecord,
  ProjectReportRecord,
} from '../types/vibeatlas';
import {
  BACKEND_LABELS,
  CONTENT_TYPE_LABELS,
  HOSTING_LABELS,
  PLATFORM_LABELS,
  PRICING_LABELS,
  UI_STRINGS,
  VERIFICATION_LABELS,
} from '../data/i18n';
import {
  computeFreshnessState,
  detectMissingFields,
  formatCompactCount,
  getRelatedProjects,
} from '../lib/catalogEngine';
import { sanitizeExternalUrl, ownershipClaimSchema, reportSubmissionSchema } from '../lib/validation';
import { ProjectGrowthChart } from './ProjectGrowthChart';
const GrowthChart = lazy(() => import('./ProjectGrowthChart').then((m) => ({ default: m.ProjectGrowthChart })));

interface ProjectDetailModalProps {
  project: CatalogProject | null;
  allProjects: CatalogProject[];
  language: AppLanguage;
  user: User | null;
  isLiked: boolean;
  isBookmarked: boolean;
  isSyncing: boolean;
  onClose: () => void;
  onSelectProject: (project: CatalogProject) => void;
  onToggleLike: (project: CatalogProject) => void;
  onToggleBookmark: (project: CatalogProject) => void;
  onSyncSingleGithub: (project: CatalogProject) => void;
  onSubmitReport: (
    project: CatalogProject,
    reason: ProjectReportRecord['reason'],
    details: string
  ) => Promise<void>;
  onSubmitClaim: (
    project: CatalogProject,
    method: OwnershipClaimRecord['verificationMethod'],
    proofNote: string
  ) => Promise<void>;
  onSignIn: () => void;
}

export function ProjectDetailModal({
  project,
  allProjects,
  language,
  user,
  isLiked,
  isBookmarked,
  isSyncing,
  onClose,
  onSelectProject,
  onToggleLike,
  onToggleBookmark,
  onSyncSingleGithub,
  onSubmitReport,
  onSubmitClaim,
  onSignIn,
}: ProjectDetailModalProps) {
  const [activeActionForm, setActiveActionForm] = useState<'none' | 'report' | 'claim'>('none');
  const [reportReason, setReportReason] =
    useState<ProjectReportRecord['reason']>('stale_metadata');
  const [reportDetails, setReportDetails] = useState('');
  const [claimMethod, setClaimMethod] =
    useState<OwnershipClaimRecord['verificationMethod']>('github_repo');
  const [claimProof, setClaimProof] = useState('');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  useEffect(() => {
    setActiveActionForm('none');
    setFormFeedback(null);
    setFormError(null);
    setReportDetails('');
    setClaimProof('');
  }, [project?.id]);

  const related = useMemo(() => {
    if (!project) return [];
    return getRelatedProjects(project, allProjects, 3);
  }, [project, allProjects]);

  if (!project) return null;

  const copy = UI_STRINGS[language].detail;
  const cardCopy = UI_STRINGS[language].card;
  const missing = detectMissingFields(project);
  const freshness = computeFreshnessState(project.lastSyncedAt);
  const safeDemo = sanitizeExternalUrl(project.liveDemoUrl);
  const safeWebsite = sanitizeExternalUrl(project.websiteUrl);
  const safeGithub = sanitizeExternalUrl(project.githubUrl);
  const fullDesc =
    language === 'ko' && project.descriptionKo ? project.descriptionKo : project.description;
  const tagline = language === 'ko' && project.taglineKo ? project.taglineKo : project.tagline;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormFeedback(null);
    if (!user) {
      onSignIn();
      return;
    }
    const parsed = reportSubmissionSchema.safeParse({
      reason: reportReason,
      details: reportDetails,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Invalid report details');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitReport(project, parsed.data.reason, parsed.data.details);
      setFormFeedback(copy.actionSubmitted);
      setReportDetails('');
      setActiveActionForm('none');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormFeedback(null);
    if (!user) {
      onSignIn();
      return;
    }
    const parsed = ownershipClaimSchema.safeParse({
      verificationMethod: claimMethod,
      proofNote: claimProof,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Invalid proof details');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitClaim(project, parsed.data.verificationMethod, parsed.data.proofNote);
      setFormFeedback(copy.actionSubmitted);
      setClaimProof('');
      setActiveActionForm('none');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Top Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{CONTENT_TYPE_LABELS[language][project.contentType]}</span>
              <span aria-hidden="true">·</span>
              <span>{project.makerName}</span>
              {project.makerHandle && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{project.makerHandle}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{VERIFICATION_LABELS[language][project.verificationStatus]}</span>
            </div>
            <h2
              id="detail-modal-title"
              className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-white"
            >
              {project.name}
            </h2>
          </div>

          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          {/* Concise & Full Description */}
          <div>
            <p className="text-base font-medium text-slate-800 dark:text-slate-200">{tagline}</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {fullDesc}
            </p>
          </div>

          {/* Separated Metric Summary (Never Blended!) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">{cardCopy.githubStars}</p>
              <p
                className={`mt-1 inline-flex items-center gap-1.5 text-slate-900 dark:text-white ${
                  project.githubRepo && project.lastSyncedAt
                    ? 'font-mono text-lg font-bold tabular-nums'
                    : 'font-sans text-sm font-semibold'
                }`}
              >
                <Star className="h-4 w-4 text-amber-500" />
                {project.githubRepo
                  ? project.lastSyncedAt
                    ? formatCompactCount(project.githubStars)
                    : cardCopy.notSynced
                  : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">GitHub Forks</p>
              <p
                className={`mt-1 inline-flex items-center gap-1.5 text-slate-900 dark:text-white ${
                  project.githubRepo && project.lastSyncedAt
                    ? 'font-mono text-lg font-bold tabular-nums'
                    : 'font-sans text-sm font-semibold'
                }`}
              >
                <GitFork className="h-4 w-4 text-slate-500" />
                {project.githubRepo
                  ? project.lastSyncedAt
                    ? formatCompactCount(project.githubForks)
                    : cardCopy.notSynced
                  : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">{cardCopy.internalLikes}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                <Heart className="h-4 w-4 text-rose-600" />
                {project.likesCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cardCopy.internalBookmarks}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                <Bookmark className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                {project.bookmarksCount}
              </p>
            </div>
          </div>

          {/* Clearly Separated External Links vs Internal Actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {copy.externalLinksTitle}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {safeDemo && (
                  <a
                    href={safeDemo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    <span>{copy.liveDemo}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {safeWebsite && (
                  <a
                    href={safeWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>{copy.officialWebsite}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {safeGithub && (
                  <a
                    href={safeGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>{copy.githubRepository}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {!safeDemo && !safeWebsite && !safeGithub && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">No verified URLs listed.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {copy.internalActionsTitle}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleLike(project)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
                    isLiked
                      ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{cardCopy.likeAction}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleBookmark(project)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
                    isBookmarked
                      ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{cardCopy.bookmarkAction}</span>
                </button>

                {project.githubRepo && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => onSyncSingleGithub(project)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? copy.syncing : copy.syncGithubNow}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setActiveActionForm((prev) => (prev === 'claim' ? 'none' : 'claim'))
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{copy.claimButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveActionForm((prev) => (prev === 'report' ? 'none' : 'report'))
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>{copy.reportButton}</span>
                </button>
              </div>
            </div>
          </div>

          {formFeedback && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>{formFeedback}</span>
            </div>
          )}

          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              {formError}
            </div>
          )}

          {/* Inline Report or Ownership Claim Form */}
          {activeActionForm === 'report' && (
            <form
              onSubmit={handleReportSubmit}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{copy.reportTitle}</h3>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ProjectReportRecord['reason'])}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="broken_link">Broken link</option>
                <option value="stale_metadata">Stale metadata</option>
                <option value="misattribution">Wrong stack/creator attribution</option>
                <option value="spam">Spam</option>
                <option value="security_concern">Security concern</option>
              </select>
              <textarea
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe the discrepancy (min 5 characters)..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="flex items-center justify-between">
                {!user && <span className="text-xs text-slate-500">{copy.signInRequired}</span>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-auto rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                >
                  {copy.submitReport}
                </button>
              </div>
            </form>
          )}

          {activeActionForm === 'claim' && (
            <form
              onSubmit={handleClaimSubmit}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{copy.claimTitle}</h3>
              <select
                value={claimMethod}
                onChange={(e) =>
                  setClaimMethod(e.target.value as OwnershipClaimRecord['verificationMethod'])
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="github_repo">GitHub Repository Maintainer</option>
                <option value="domain_dns">Domain DNS TXT Verification</option>
                <option value="demo_meta">Live Demo Meta Tag</option>
              </select>
              <textarea
                rows={3}
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="Provide your GitHub handle or verification DNS/URL note..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="flex items-center justify-between">
                {!user && <span className="text-xs text-slate-500">{copy.signInRequired}</span>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-auto rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  {copy.submitClaim}
                </button>
              </div>
            </form>
          )}

          {/* Stack Attribution & Metadata Provenance */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {copy.techAndPlatformTitle}
              </h3>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.platformLabel}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {PLATFORM_LABELS[project.developmentPlatform]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.hostingLabel}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {HOSTING_LABELS[project.hostingProvider]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.backendLabel}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {BACKEND_LABELS[project.backendTech]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.licenseLabel}</dt>
                  <dd className="font-mono font-medium text-slate-900 dark:text-white">
                    {project.license}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.pricingLabel}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {PRICING_LABELS[language][project.pricingModel]}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.countryLangLabel}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {project.country} · {project.language}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {project.techStack.join(' · ')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {copy.provenanceTitle}
              </h3>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {copy.provenanceSourceLabel}
                  </dt>
                  <dd className="font-mono text-slate-900 dark:text-white">
                    {project.provenanceSource}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.lastSyncedLabel}</dt>
                  <dd
                    className={`inline-flex items-center gap-1 text-slate-900 dark:text-white ${
                      project.lastSyncedAt ? 'font-mono tabular-nums' : 'font-sans'
                    }`}
                  >
                    {freshness === 'stale' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    {freshness === 'unknown' && <HelpCircle className="h-3.5 w-3.5 text-slate-400" />}
                    <span>
                      {project.lastSyncedAt
                        ? new Date(project.lastSyncedAt).toISOString().slice(0, 10)
                        : cardCopy.notSynced}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{copy.missingFieldsLabel}</dt>
                  <dd className="text-right font-mono text-slate-700 dark:text-slate-300">
                    {missing.length > 0 ? missing.join(', ') : copy.noneMissing}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* 14-Day Recharts Historical Growth Chart */}
          <Suspense fallback={null}>
            <GrowthChart
              project={project}
              language={language}
              isSyncing={isSyncing}
              onSyncSingleGithub={onSyncSingleGithub}
            />
          </Suspense>

          {/* Related Projects */}
          {related.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {copy.relatedTitle}
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {related.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectProject(rel)}
                    className="rounded-xl border border-slate-200 p-3.5 text-left transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {CONTENT_TYPE_LABELS[language][rel.contentType]} · {rel.country}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {rel.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {language === 'ko' && rel.taglineKo ? rel.taglineKo : rel.tagline}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
