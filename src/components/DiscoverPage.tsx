import { useMemo, useState } from 'react';
import {
  Info,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  BackendTech,
  CatalogProject,
  ContentType,
  DevelopmentPlatform,
  HostingProvider,
  PricingModel,
  SearchFilters,
  SortOption,
  VerificationStatus,
} from '../types/vibeatlas';
import {
  BACKEND_LABELS,
  CONTENT_TYPE_LABELS,
  HOSTING_LABELS,
  PLATFORM_LABELS,
  PRICING_LABELS,
  SORT_LABELS,
  UI_STRINGS,
  VERIFICATION_LABELS,
} from '../data/i18n';
import {
  filterProjects,
  paginateProjects,
  sortProjects,
} from '../lib/catalogEngine';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { ProjectCard } from './ProjectCard';
import { VoiceSearchButton, VoiceSearchFeedback } from './VoiceSearchButton';

interface DiscoverPageProps {
  language: AppLanguage;
  projects: CatalogProject[];
  filters: SearchFilters;
  isLoading: boolean;
  likedIds: Set<string>;
  bookmarkedIds: Set<string>;
  onUpdateFilters: (patch: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  onOpenDetail: (project: CatalogProject) => void;
  onToggleLike: (project: CatalogProject) => void;
  onToggleBookmark: (project: CatalogProject) => void;
}

export function DiscoverPage({
  language,
  projects,
  filters,
  isLoading,
  likedIds,
  bookmarkedIds,
  onUpdateFilters,
  onResetFilters,
  onOpenDetail,
  onToggleLike,
  onToggleBookmark,
}: DiscoverPageProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showSearchNote, setShowSearchNote] = useState(false);
  const copy = UI_STRINGS[language].discover;
  const wsCopy = UI_STRINGS[language].workspace;

  const voiceSearch = useVoiceSearch({
    language,
    onInterimTranscript: (transcript) => {
      onUpdateFilters({ q: transcript, page: 1 });
    },
    onFinalTranscript: (transcript) => {
      onUpdateFilters({ q: transcript, page: 1 });
    },
  });

  const availableCountries = useMemo(
    () => Array.from(new Set(projects.map((p) => p.country))).sort(),
    [projects]
  );

  const availableLicenses = useMemo(
    () => Array.from(new Set(projects.map((p) => p.license))).sort(),
    [projects]
  );

  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);
  const sorted = useMemo(
    () => sortProjects(filtered, filters.sort, filters.q),
    [filtered, filters.sort, filters.q]
  );
  const paginated = useMemo(
    () => paginateProjects(sorted, filters.page, 9),
    [sorted, filters.page]
  );

  const renderFilterForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {copy.filtersHeading}
        </h2>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{copy.resetFilters}</span>
        </button>
      </div>

      {/* Content Type */}
      <div>
        <label htmlFor="filter-type" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterType}
        </label>
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => onUpdateFilters({ type: e.target.value as ContentType | 'all', page: 1 })}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {(Object.keys(CONTENT_TYPE_LABELS[language]) as ContentType[]).map((key) => (
            <option key={key} value={key}>
              {CONTENT_TYPE_LABELS[language][key]}
            </option>
          ))}
        </select>
      </div>

      {/* Dev Platform */}
      <div>
        <label htmlFor="filter-platform" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterPlatform}
        </label>
        <select
          id="filter-platform"
          value={filters.platform}
          onChange={(e) =>
            onUpdateFilters({ platform: e.target.value as DevelopmentPlatform | 'all', page: 1 })
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {(Object.keys(PLATFORM_LABELS) as DevelopmentPlatform[]).map((key) => (
            <option key={key} value={key}>
              {PLATFORM_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Hosting Provider */}
      <div>
        <label htmlFor="filter-hosting" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterHosting}
        </label>
        <select
          id="filter-hosting"
          value={filters.hosting}
          onChange={(e) =>
            onUpdateFilters({ hosting: e.target.value as HostingProvider | 'all', page: 1 })
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {(Object.keys(HOSTING_LABELS) as HostingProvider[]).map((key) => (
            <option key={key} value={key}>
              {HOSTING_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Backend Tech */}
      <div>
        <label htmlFor="filter-backend" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterBackend}
        </label>
        <select
          id="filter-backend"
          value={filters.backend}
          onChange={(e) =>
            onUpdateFilters({ backend: e.target.value as BackendTech | 'all', page: 1 })
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {(Object.keys(BACKEND_LABELS) as BackendTech[]).map((key) => (
            <option key={key} value={key}>
              {BACKEND_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <label htmlFor="filter-country" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterCountry}
        </label>
        <select
          id="filter-country"
          value={filters.country}
          onChange={(e) => onUpdateFilters({ country: e.target.value, page: 1 })}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label htmlFor="filter-language" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterLanguage}
        </label>
        <select
          id="filter-language"
          value={filters.lang}
          onChange={(e) =>
            onUpdateFilters({
              lang: e.target.value as SearchFilters['lang'],
              page: 1,
            })
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          <option value="ko">한국어 (ko)</option>
          <option value="en">English (en)</option>
          <option value="bilingual">한/영 (bilingual)</option>
        </select>
      </div>

      {/* License */}
      <div>
        <label htmlFor="filter-license" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterLicense}
        </label>
        <select
          id="filter-license"
          value={filters.license}
          onChange={(e) => onUpdateFilters({ license: e.target.value, page: 1 })}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {availableLicenses.map((lic) => (
            <option key={lic} value={lic}>
              {lic}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing */}
      <div>
        <label htmlFor="filter-pricing" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterPricing}
        </label>
        <select
          id="filter-pricing"
          value={filters.pricing}
          onChange={(e) =>
            onUpdateFilters({ pricing: e.target.value as PricingModel | 'all', page: 1 })
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {(Object.keys(PRICING_LABELS[language]) as PricingModel[]).map((key) => (
            <option key={key} value={key}>
              {PRICING_LABELS[language][key]}
            </option>
          ))}
        </select>
      </div>

      {/* Verification Status */}
      <div>
        <label htmlFor="filter-verification" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterVerification}
        </label>
        <select
          id="filter-verification"
          value={filters.verified}
          onChange={(e) =>
            onUpdateFilters({ verified: e.target.value as VerificationStatus | 'all', page: 1 })
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="all">{copy.allOption}</option>
          {(Object.keys(VERIFICATION_LABELS[language]) as VerificationStatus[]).map((key) => (
            <option key={key} value={key}>
              {VERIFICATION_LABELS[language][key]}
            </option>
          ))}
        </select>
      </div>

      {/* Min Stars */}
      <div>
        <label htmlFor="filter-min-stars" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterMinStars}
        </label>
        <select
          id="filter-min-stars"
          value={filters.minStars}
          onChange={(e) => onUpdateFilters({ minStars: Number(e.target.value), page: 1 })}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value={0}>{copy.allOption}</option>
          <option value={100}>100+</option>
          <option value={1000}>1,000+</option>
          <option value={10000}>10,000+</option>
        </select>
      </div>

      {/* Updated Within */}
      <div>
        <label htmlFor="filter-updated" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          {copy.filterUpdatedWithin}
        </label>
        <select
          id="filter-updated"
          value={filters.updatedWithinDays}
          onChange={(e) => onUpdateFilters({ updatedWithinDays: Number(e.target.value), page: 1 })}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value={0}>{copy.allOption}</option>
          <option value={7}>7d</option>
          <option value={30}>30d</option>
          <option value={90}>90d</option>
        </select>
      </div>
    </div>
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
          onClick={() => setShowSearchNote((prev) => !prev)}
          aria-expanded={showSearchNote}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Info className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
          <span>{wsCopy.koreanSearchNoteTitle}</span>
        </button>
      </div>

      {showSearchNote && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs leading-relaxed text-slate-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-slate-200">
          {wsCopy.koreanSearchNoteBody}
        </div>
      )}

      {/* Search Bar & Toolbar */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white py-1 pl-3 pr-1.5 dark:border-slate-700 dark:bg-slate-950">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => onUpdateFilters({ q: e.target.value, page: 1 })}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              className="w-full bg-transparent py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            />
            {filters.q && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => onUpdateFilters({ q: '', page: 1 })}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <VoiceSearchButton
              language={language}
              isListening={voiceSearch.isListening}
              onClick={voiceSearch.toggle}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{copy.mobileFiltersButton}</span>
            </button>

            <label htmlFor="sort-select" className="sr-only">
              {copy.sortLabel}
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => onUpdateFilters({ sort: e.target.value as SortOption, page: 1 })}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {(Object.keys(SORT_LABELS[language]) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[language][key]}
                </option>
              ))}
            </select>

            <div
              role="group"
              aria-label="View mode"
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
            >
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => onUpdateFilters({ view: 'grid' })}
                className={`rounded-md p-1.5 ${
                  filters.view === 'grid'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => onUpdateFilters({ view: 'list' })}
                className={`rounded-md p-1.5 ${
                  filters.view === 'list'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <VoiceSearchFeedback
          language={language}
          status={voiceSearch.status}
          errorCode={voiceSearch.errorCode}
          interimTranscript={voiceSearch.interimTranscript}
          onStop={voiceSearch.stop}
          onDismissError={voiceSearch.clearError}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Desktop Faceted Filter Sidebar */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            {renderFilterForm()}
          </div>
        </aside>

        {/* Results Panel */}
        <div className="lg:col-span-9">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="tabular-nums font-medium">
              {paginated.totalCount}
              {copy.resultsCount}
            </span>
            <span className="tabular-nums font-mono">
              {paginated.currentPage} / {paginated.totalPages}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-56 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : paginated.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {copy.emptyTitle}
              </p>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                {copy.emptyBody}
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{copy.resetFilters}</span>
              </button>
            </div>
          ) : (
            <div
              className={
                filters.view === 'list'
                  ? 'flex flex-col gap-4'
                  : 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'
              }
            >
              {paginated.items.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  language={language}
                  viewMode={filters.view}
                  isLiked={likedIds.has(proj.id)}
                  isBookmarked={bookmarkedIds.has(proj.id)}
                  onOpenDetail={onOpenDetail}
                  onToggleLike={onToggleLike}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {paginated.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                disabled={paginated.currentPage <= 1}
                onClick={() => onUpdateFilters({ page: paginated.currentPage - 1 })}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {copy.previousPage}
              </button>
              <span className="tabular-nums font-mono text-xs text-slate-600 dark:text-slate-400">
                {paginated.currentPage} / {paginated.totalPages}
              </span>
              <button
                type="button"
                disabled={paginated.currentPage >= paginated.totalPages}
                onClick={() => onUpdateFilters({ page: paginated.currentPage + 1 })}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {copy.nextPage}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-5 shadow-xl dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {copy.filtersHeading}
              </span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderFilterForm()}
          </div>
        </div>
      )}
    </div>
  );
}
