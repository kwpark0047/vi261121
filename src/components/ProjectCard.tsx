import { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  GitFork,
  Heart,
  HelpCircle,
  Star,
} from 'lucide-react';
import type { AppLanguage, CatalogProject, ViewMode } from '../types/vibeatlas';
import {
  BACKEND_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  PRICING_LABELS,
  UI_STRINGS,
} from '../data/i18n';
import {
  computeFreshnessState,
  detectMissingFields,
  formatCompactCount,
} from '../lib/catalogEngine';
import { sanitizeExternalUrl } from '../lib/validation';

interface ProjectCardProps {
  project: CatalogProject;
  language: AppLanguage;
  viewMode?: ViewMode;
  isLiked: boolean;
  isBookmarked: boolean;
  onOpenDetail: (project: CatalogProject) => void;
  onToggleLike: (project: CatalogProject) => void;
  onToggleBookmark: (project: CatalogProject) => void;
}

export function ProjectCard({
  project,
  language,
  viewMode = 'grid',
  isLiked,
  isBookmarked,
  onOpenDetail,
  onToggleLike,
  onToggleBookmark,
}: ProjectCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const copy = UI_STRINGS[language].card;
  const typeLabel = CONTENT_TYPE_LABELS[language][project.contentType];
  const platformLabel = PLATFORM_LABELS[project.developmentPlatform];
  const backendLabel = BACKEND_LABELS[project.backendTech];
  const pricingLabel = PRICING_LABELS[language][project.pricingModel];
  const freshness = computeFreshnessState(project.lastSyncedAt);
  const missing = detectMissingFields(project);
  const tagline = language === 'ko' && project.taglineKo ? project.taglineKo : project.tagline;
  const safeDemo = sanitizeExternalUrl(project.liveDemoUrl);
  const safeGithub = sanitizeExternalUrl(project.githubUrl);

  const verificationNode =
    project.verificationStatus === 'verified' ? (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>{copy.verifiedLabel}</span>
      </span>
    ) : project.verificationStatus === 'pending' ? (
      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>{copy.pendingLabel}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{copy.unverifiedLabel}</span>
      </span>
    );

  return (
    <article
      className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${
        viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-6 p-4 sm:p-5' : 'p-5'
      }`}
    >
      <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
        {viewMode === 'grid' && project.thumbnailUrl && !imgFailed && (
          <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="aspect-[16/9] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">{typeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{project.country}</span>
          <span aria-hidden="true">·</span>
          {verificationNode}
          {freshness === 'stale' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 dark:text-amber-400">{copy.staleLabel}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">{typeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{project.country}</span>
          <span aria-hidden="true">·</span>
          {verificationNode}
          {freshness === 'stale' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 dark:text-amber-400">{copy.staleLabel}</span>
            </>
          )}
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
            {project.likesCount} {copy.internalLikes} ·
            {project.bookmarksCount} {copy.internalBookmarks}
          </span>
        </div>

        <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900 dark:text-white">
          <button
            type="button"
            onClick={() => onOpenDetail(project)}
            className="text-left hover:text-blue-700 hover:underline dark:hover:text-blue-400"
          >
            {project.name}
          </button>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {tagline}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{platformLabel}</span>
          {project.backendTech !== 'none' && project.backendTech !== 'unknown' && (
            <>
              <span aria-hidden="true">/</span>
              <span>{backendLabel}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{pricingLabel}</span>
          <span aria-hidden="true">·</span>
          <span
            className={
              missing.includes('license')
                ? 'text-amber-700 dark:text-amber-400'
                : 'font-mono text-slate-600 dark:text-slate-300'
            }
          >
            {missing.includes('license') ? copy.missingLicense : project.license}
          </span>
        </div>
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-slate-100 dark:border-slate-800 ${
          viewMode === 'list'
            ? 'mt-4 border-t pt-3 sm:mt-0 sm:w-72 sm:shrink-0 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0'
            : 'mt-4 border-t pt-3.5'
        }`}
      >
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          {project.githubRepo ? (
            <span
              title={copy.githubStars}
              className={`inline-flex items-center gap-1 ${
                project.lastSyncedAt ? 'tabular-nums font-mono' : 'font-sans'
              }`}
            >
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {project.lastSyncedAt ? formatCompactCount(project.githubStars) : copy.notSynced}
            </span>
          ) : null}
          {project.githubForks > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums font-mono text-slate-500 dark:text-slate-400">
              <GitFork className="h-3.5 w-3.5" />
              {formatCompactCount(project.githubForks)}
            </span>
          )}
          <span
            title={copy.internalLikes}
            className="inline-flex items-center gap-1 tabular-nums font-mono"
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            {project.likesCount}
          </span>
          <span
            title={copy.internalBookmarks}
            className="inline-flex items-center gap-1 tabular-nums font-mono"
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-blue-700 text-blue-700 dark:fill-blue-400 dark:text-blue-400' : ''}`}
            />
            {project.bookmarksCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`${copy.likeAction}: ${project.name}`}
            onClick={() => onToggleLike(project)}
            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
              isLiked
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            aria-label={`${copy.bookmarkAction}: ${project.name}`}
            onClick={() => onToggleBookmark(project)}
            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
              isBookmarked
                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {(safeDemo || safeGithub) && (
            <a
              href={safeDemo || safeGithub || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`External link: ${project.name}`}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onOpenDetail(project)}
            className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {copy.openDetail}
          </button>
        </div>
      </div>
    </article>
  );
}
