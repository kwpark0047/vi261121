import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  GitFork,
  Languages,
  Loader2,
  RefreshCw,
  Search,
  Star,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  CatalogProject,
  GitHubRankedRepo,
  GitHubTopRepoPreset,
} from '../types/vibeatlas';
import { UI_STRINGS } from '../data/i18n';
import { formatCompactCount } from '../lib/catalogEngine';
import {
  computeLeaderboardSummary,
  extractLeaderboardLanguages,
  filterGitHubRankedRepos,
  findCatalogProjectByRepo,
} from '../lib/githubLeaderboard';
import {
  chunkTranslationItems,
  needsDescriptionTranslation,
  resolveDisplayedRepoDescription,
} from '../lib/repoDescriptionTranslator';
import { sanitizeExternalUrl } from '../lib/validation';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { VoiceSearchButton, VoiceSearchFeedback } from './VoiceSearchButton';

interface GitHubStarsPageProps {
  language: AppLanguage;
  catalogProjects: CatalogProject[];
  onOpenDetail: (project: CatalogProject) => void;
}

interface TopStarredApiResponse {
  preset: GitHubTopRepoPreset;
  fetchedAt: string;
  staleCache?: boolean;
  items: GitHubRankedRepo[];
  error?: string;
  resetAtIso?: string | null;
}

export function GitHubStarsPage({
  language,
  catalogProjects,
  onOpenDetail,
}: GitHubStarsPageProps) {
  const [preset, setPreset] = useState<GitHubTopRepoPreset>('all');
  const [items, setItems] = useState<GitHubRankedRepo[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string>('');
  const [staleCache, setStaleCache] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetAtIso, setResetAtIso] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [translationsByLang, setTranslationsByLang] = useState<
    Partial<Record<AppLanguage, Record<number, string>>>
  >({});
  const translationsRef = useRef(translationsByLang);
  translationsRef.current = translationsByLang;
  const [translating, setTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationRetryTick, setTranslationRetryTick] = useState(0);
  const [showOriginalIds, setShowOriginalIds] = useState<Set<number>>(new Set());

  const copy = UI_STRINGS[language].githubStarsPage;

  const voiceSearch = useVoiceSearch({
    language,
    onInterimTranscript: (transcript) => setQuery(transcript),
    onFinalTranscript: (transcript) => setQuery(transcript),
  });

  const loadLeaderboard = useCallback(
    async (targetPreset: GitHubTopRepoPreset, forceRefresh: boolean, signal?: AbortSignal) => {
      setLoading(true);
      setErrorMsg(null);
      setResetAtIso(null);
      try {
        const refreshParam = forceRefresh ? '&refresh=1' : '';
        const resp = await fetch(
          `/api/github/top-starred?preset=${encodeURIComponent(targetPreset)}${refreshParam}`,
          { signal }
        );
        const data = (await resp.json()) as TopStarredApiResponse;
        if (!resp.ok) {
          setErrorMsg(data.error || `Request failed with status ${resp.status}`);
          setResetAtIso(data.resetAtIso ?? null);
          setItems([]);
          return;
        }
        setItems(Array.isArray(data.items) ? data.items : []);
        setFetchedAt(data.fetchedAt || new Date().toISOString());
        setStaleCache(Boolean(data.staleCache));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorMsg(err instanceof Error ? err.message : 'Network error loading leaderboard.');
        setItems([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadLeaderboard(preset, false, controller.signal);
    return () => controller.abort();
  }, [preset, loadLeaderboard]);

  const activeTranslations = useMemo(
    () => translationsByLang[language] ?? {},
    [translationsByLang, language]
  );

  useEffect(() => {
    if (loading || items.length === 0) {
      setTranslating(false);
      setTranslationProgress(null);
      return;
    }

    const existingMap = translationsRef.current[language] ?? {};
    const pending = items
      .filter(
        (repo) =>
          repo.description &&
          needsDescriptionTranslation(repo.description, language) &&
          !existingMap[repo.id]
      )
      .map((repo) => ({ id: repo.id, text: repo.description }));

    if (pending.length === 0) {
      setTranslating(false);
      setTranslationProgress(null);
      setTranslationError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setTranslating(true);
    setTranslationProgress({ completed: 0, total: pending.length });
    setTranslationError(null);

    const requestBatch = async (
      batch: { id: number; text: string }[]
    ): Promise<{ ok: boolean; status: number; errorCode?: string; error?: string; translatedCount: number }> => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        if (cancelled) return { ok: true, status: 200, translatedCount: 0 };
        const resp = await fetch('/api/github/translate-descriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetLanguage: language, items: batch }),
          signal: controller.signal,
        });
        const data = (await resp.json()) as {
          translations?: Record<string, string>;
          error?: string;
          errorCode?: string;
        };

        const validEntries: Array<[number, string]> = [];
        if (data.translations && Object.keys(data.translations).length > 0) {
          for (const [idStr, text] of Object.entries(data.translations)) {
            const numId = Number(idStr);
            if (Number.isFinite(numId) && typeof text === 'string' && text.trim()) {
              validEntries.push([numId, text.trim()]);
            }
          }
          if (validEntries.length > 0) {
            setTranslationsByLang((prev) => {
              const currentLangMap = { ...(prev[language] ?? {}) };
              for (const [numId, text] of validEntries) {
                currentLangMap[numId] = text;
              }
              return { ...prev, [language]: currentLangMap };
            });
          }
        }
        const applied = validEntries.length;

        if (resp.ok) {
          return { ok: true, status: resp.status, translatedCount: applied };
        }

        const isTransient = resp.status === 429 || resp.status >= 500;
        const isMissingKey = data.errorCode === 'MISSING_API_KEY' || resp.status === 401 || resp.status === 403;
        if (!isTransient || isMissingKey || attempt === 1) {
          return {
            ok: false,
            status: resp.status,
            errorCode: data.errorCode,
            error: data.error || `Translation failed (${resp.status})`,
            translatedCount: applied,
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 750));
      }
      return { ok: false, status: 500, translatedCount: 0 };
    };

    const run = async () => {
      const batches = chunkTranslationItems(pending, 15);
      let nextIndex = 0;
      let completedCount = 0;
      let fatalStop = false;
      let lastFailureMsg: string | null = null;

      const worker = async () => {
        while (!cancelled && !fatalStop) {
          const idx = nextIndex;
          nextIndex += 1;
          if (idx >= batches.length) break;

          const batch = batches[idx];
          try {
            const outcome = await requestBatch(batch);
            completedCount += outcome.translatedCount;
            if (!cancelled) {
              setTranslationProgress({
                completed: Math.min(pending.length, completedCount),
                total: pending.length,
              });
            }
            if (!outcome.ok) {
              lastFailureMsg = outcome.error || 'Translation request failed.';
              if (
                outcome.errorCode === 'MISSING_API_KEY' ||
                outcome.status === 401 ||
                outcome.status === 403
              ) {
                fatalStop = true;
              }
            }
          } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            lastFailureMsg =
              err instanceof Error ? err.message : 'Translation request failed.';
          }
        }
      };

      await Promise.all([worker(), worker()]);

      if (!cancelled) {
        setTranslating(false);
        setTranslationProgress(null);
        if (lastFailureMsg) {
          setTranslationError(lastFailureMsg);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [items, language, loading, translationRetryTick]);

  const toggleOriginalForRepo = (repoId: number) => {
    setShowOriginalIds((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) next.delete(repoId);
      else next.add(repoId);
      return next;
    });
  };

  const availableLanguages = useMemo(() => extractLeaderboardLanguages(items), [items]);
  const summary = useMemo(() => computeLeaderboardSummary(items), [items]);
  const filteredItems = useMemo(
    () => filterGitHubRankedRepos(items, query, languageFilter, activeTranslations),
    [items, query, languageFilter, activeTranslations]
  );

  const presetOptions: { id: GitHubTopRepoPreset; label: string }[] = [
    { id: 'all', label: copy.presetAll },
    { id: 'web_apps', label: copy.presetWebApps },
    { id: 'ai_agents', label: copy.presetAiAgents },
    { id: 'typescript', label: copy.presetTypescript },
    { id: 'python', label: copy.presetPython },
    { id: 'rust', label: copy.presetRust },
    { id: 'go', label: copy.presetGo },
  ];

  const handlePresetSelect = (nextPreset: GitHubTopRepoPreset) => {
    setPreset(nextPreset);
    setLanguageFilter('all');
  };

  const formattedSyncTime = useMemo(() => {
    if (!fetchedAt) return '—';
    const date = new Date(fetchedAt);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }, [fetchedAt]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header & Refresh Action */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            {copy.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            {copy.subtitle}
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => void loadLeaderboard(preset, true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{loading ? copy.refreshing : copy.refreshButton}</span>
        </button>
      </div>

      {/* Cohort Preset Segmented Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label={copy.title}>
        {presetOptions.map((opt) => {
          const isActive = preset === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handlePresetSelect(opt.id)}
              className={`whitespace-nowrap shrink-0 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-blue-700 bg-blue-700 text-white dark:border-blue-500 dark:bg-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 4-Column Summary KPI Strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">{copy.kpiRankedCount}</p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {loading ? '—' : `${summary.totalRepos}`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">{copy.kpiTopStars}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            <Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <span>{loading || summary.topStars === 0 ? '—' : summary.topStars.toLocaleString()}</span>
          </p>
          {summary.topRepoName && !loading && (
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {summary.topRepoName}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">{copy.kpiMedianStars}</p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {loading || summary.medianStars === 0 ? '—' : summary.medianStars.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">{copy.kpiLastUpdated}</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
            {loading ? '—' : formattedSyncTime}
          </p>
          {staleCache && !loading && (
            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
              {copy.cachedFallbackBadge}
            </p>
          )}
        </div>
      </div>

      {/* Search & Language Filter Toolbar */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 w-full flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white py-1 pl-3 pr-1.5 sm:min-w-[260px] dark:border-slate-700 dark:bg-slate-950">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              className="w-full bg-transparent py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear leaderboard search"
                onClick={() => setQuery('')}
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

          <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <label htmlFor="stars-language-select" className="sr-only">
              {copy.allLanguagesOption}
            </label>
            <select
              id="stars-language-select"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">{copy.allLanguagesOption}</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {translating && (
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>
                  {copy.translatingDescriptions}
                  {translationProgress && translationProgress.total > 0
                    ? ` (${translationProgress.completed}/${translationProgress.total})`
                    : ''}
                </span>
              </span>
            )}

            <span className="shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {filteredItems.length} {copy.showingCountLabel}
            </span>
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

        {translationError && !loading && (
          <div
            role="status"
            className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Languages className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
              <span>{copy.translationErrorNotice}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTranslationError(null);
                  setTranslationRetryTick((prev) => prev + 1);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-900"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>{copy.retryButton}</span>
              </button>
              <button
                type="button"
                onClick={() => setTranslationError(null)}
                aria-label="Dismiss notice"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div
          aria-busy="true"
          className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-72 rounded bg-slate-100 dark:bg-slate-800/70" />
                  </div>
                </div>
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error / Rate Limit State */}
      {!loading && errorMsg && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/40"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                {copy.errorTitle}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                {errorMsg}
              </p>
              {resetAtIso && (
                <p className="mt-1 font-mono text-[11px] tabular-nums text-rose-700 dark:text-rose-400">
                  {copy.rateLimitResetPrefix}: {resetAtIso.replace('T', ' ').slice(0, 19)} UTC
                </p>
              )}
              <button
                type="button"
                onClick={() => void loadLeaderboard(preset, true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{copy.retryButton}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!loading && !errorMsg && items.length === 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {copy.emptyTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {copy.emptyBody}
          </p>
        </div>
      )}

      {!loading && !errorMsg && items.length > 0 && filteredItems.length === 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {copy.emptyFilteredTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {copy.emptyFilteredBody}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setLanguageFilter('all');
            }}
            className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {copy.resetFilterButton}
          </button>
        </div>
      )}

      {/* Top 100 Leaderboard Table */}
      {!loading && !errorMsg && filteredItems.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th scope="col" className="w-16 px-4 py-3 text-right">
                  {copy.colRank}
                </th>
                <th scope="col" className="px-4 py-3">
                  {copy.colRepository}
                </th>
                <th scope="col" className="w-48 px-4 py-3 whitespace-nowrap">
                  {copy.colLanguageLicense}
                </th>
                <th scope="col" className="w-28 px-4 py-3 text-right">
                  {copy.colForks}
                </th>
                <th scope="col" className="w-36 px-4 py-3 text-right">
                  {copy.colStars}
                </th>
                <th scope="col" className="w-36 px-4 py-3 text-right">
                  {copy.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.map((repo) => {
                const safeRepoUrl = sanitizeExternalUrl(repo.htmlUrl);
                const matchedProject = findCatalogProjectByRepo(catalogProjects, repo.fullName);
                const isTopThree = repo.rank <= 3;

                return (
                  <tr
                    key={repo.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-right align-top">
                      <span
                        className={`font-mono text-sm tabular-nums ${
                          isTopThree
                            ? 'font-bold text-amber-700 dark:text-amber-400'
                            : 'font-semibold text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        #{repo.rank}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        {repo.ownerAvatarUrl && (
                          <img
                            src={repo.ownerAvatarUrl}
                            alt={`${repo.ownerLogin} avatar`}
                            referrerPolicy="no-referrer"
                            className="mt-0.5 h-6 w-6 shrink-0 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                          />
                        )}
                        <div className="min-w-0">
                          {safeRepoUrl ? (
                            <a
                              href={safeRepoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline dark:text-white dark:hover:text-blue-400"
                            >
                              {repo.fullName}
                            </a>
                          ) : (
                            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                              {repo.fullName}
                            </span>
                          )}
                          {repo.description && (
                            <div className="mt-0.5 max-w-xl">
                              <p
                                data-testid="repo-description"
                                className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300"
                              >
                                {resolveDisplayedRepoDescription({
                                  repoId: repo.id,
                                  originalDescription: repo.description,
                                  translationsMap: activeTranslations,
                                  showOriginal: showOriginalIds.has(repo.id),
                                }).text}
                              </p>
                              {(() => {
                                const state = resolveDisplayedRepoDescription({
                                  repoId: repo.id,
                                  originalDescription: repo.description,
                                  translationsMap: activeTranslations,
                                  showOriginal: showOriginalIds.has(repo.id),
                                });
                                return state.hasTranslation ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleOriginalForRepo(repo.id)}
                                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline dark:text-blue-400"
                                  >
                                    <Languages className="h-3 w-3" aria-hidden="true" />
                                    <span>
                                      {state.isTranslated ? copy.showOriginal : copy.showTranslated}
                                    </span>
                                  </button>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-xs">
                      <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {repo.language || '—'}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {repo.license || '—'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right align-top font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center justify-end gap-1">
                        <GitFork className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        <span>{formatCompactCount(repo.forks)}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right align-top font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      <span className="inline-flex items-center justify-end gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                        <span>{repo.stars.toLocaleString()}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right align-top">
                      <div className="inline-flex items-center justify-end gap-2">
                        {matchedProject && (
                          <button
                            type="button"
                            onClick={() => onOpenDetail(matchedProject)}
                            className="shrink-0 whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                          >
                            {copy.openInVibeAtlas}
                          </button>
                        )}
                        {safeRepoUrl && (
                          <a
                            href={safeRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${repo.fullName} ${copy.openGithub}`}
                            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <span>{copy.openGithub}</span>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
