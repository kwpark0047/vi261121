import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  ActivePage,
  AppLanguage,
  CatalogProject,
  ContentType,
  SearchFilters,
} from '../types/vibeatlas';
import {
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  UI_STRINGS,
} from '../data/i18n';
import {
  HERO_IMAGE_PATH,
  KOREAN_MAKERS_IMAGE,
  MCP_SHOWCASE_IMAGE,
  WORKSPACE_SHOWCASE_IMAGE,
} from '../data/seedCatalog';
import { getSearchSuggestions, sortProjects } from '../lib/catalogEngine';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { ProjectCard } from './ProjectCard';
import { VoiceSearchButton, VoiceSearchFeedback } from './VoiceSearchButton';

interface HomePageProps {
  language: AppLanguage;
  projects: CatalogProject[];
  likedIds: Set<string>;
  bookmarkedIds: Set<string>;
  user: User | null;
  isSyncingBatch: boolean;
  onSyncAllGithub: () => void;
  onOpenDetail: (project: CatalogProject) => void;
  onToggleLike: (project: CatalogProject) => void;
  onToggleBookmark: (project: CatalogProject) => void;
  onSearchAndDiscover: (patch: Partial<SearchFilters>) => void;
  onNavigate: (page: ActivePage) => void;
  onSignIn: () => void;
  onSubscribeNewsletter: (email: string) => Promise<void>;
}

type SpotlightTab = 'trending' | 'new' | 'oss';

export function HomePage({
  language,
  projects,
  likedIds,
  bookmarkedIds,
  user,
  isSyncingBatch,
  onSyncAllGithub,
  onOpenDetail,
  onToggleLike,
  onToggleBookmark,
  onSearchAndDiscover,
  onNavigate,
  onSignIn,
  onSubscribeNewsletter,
}: HomePageProps) {
  const [heroQuery, setHeroQuery] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [spotlightTab, setSpotlightTab] = useState<SpotlightTab>('trending');
  const [newsletterEmail, setNewsletterEmail] = useState(user?.email ?? '');
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const heroCopy = UI_STRINGS[language].hero;
  const homeCopy = UI_STRINGS[language].home;
  const typeLabels = CONTENT_TYPE_LABELS[language];

  const voiceSearch = useVoiceSearch({
    language,
    onInterimTranscript: (transcript) => {
      setHeroQuery(transcript);
    },
    onFinalTranscript: (transcript) => {
      setHeroQuery(transcript);
      onSearchAndDiscover({ q: transcript, page: 1 });
    },
  });

  const suggestions = useMemo(
    () => getSearchSuggestions(heroQuery, projects, language, 5),
    [heroQuery, projects, language]
  );

  const spotlightProjects = useMemo(() => {
    if (spotlightTab === 'new') {
      return sortProjects(projects, 'recently_added', '').slice(0, 3);
    }
    if (spotlightTab === 'oss') {
      const ossOnly = projects.filter(
        (p) => p.pricingModel === 'open_source' || Boolean(p.githubRepo)
      );
      return sortProjects(ossOnly, 'most_starred', '').slice(0, 3);
    }
    return sortProjects(projects, 'trending_7d', '').slice(0, 3);
  }, [projects, spotlightTab]);

  const mcpAndSkillProjects = useMemo(
    () =>
      projects
        .filter((p) => p.contentType === 'mcp_server' || p.contentType === 'ai_skill')
        .slice(0, 3),
    [projects]
  );

  const koreanAndGlobalSpotlights = useMemo(() => {
    const kr = projects.filter((p) => p.country === 'KR');
    const global = projects.filter((p) => p.country !== 'KR');
    return [...kr.slice(0, 2), ...global.slice(0, 1)].slice(0, 3);
  }, [projects]);

  const featuredMakers = useMemo(() => {
    const seen = new Set<string>();
    const makers: { name: string; handle: string; country: string; project: CatalogProject }[] = [];
    for (const p of projects) {
      if (!seen.has(p.makerName)) {
        seen.add(p.makerName);
        makers.push({ name: p.makerName, handle: p.makerHandle, country: p.country, project: p });
      }
      if (makers.length >= 4) break;
    }
    return makers;
  }, [projects]);

  const quickTypes: ContentType[] = [
    'web_app',
    'ai_tool',
    'mcp_server',
    'ai_skill',
    'ai_agent',
    'template',
    'open_source',
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchAndDiscover({ q: heroQuery.trim(), page: 1 });
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMsg(null);
    if (!user) {
      onSignIn();
      return;
    }
    const emailToSave = (newsletterEmail || user.email || '').trim();
    if (!emailToSave || !emailToSave.includes('@')) return;
    setNewsletterSubmitting(true);
    try {
      await onSubscribeNewsletter(emailToSave);
      setNewsletterMsg(homeCopy.newsletterSuccess);
    } catch (err) {
      setNewsletterMsg(err instanceof Error ? err.message : 'Subscription error');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white py-10 lg:py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-400">
              {heroCopy.kicker}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] dark:text-white">
              {heroCopy.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {heroCopy.subheadline}
            </p>

            {/* Universal Search Input with Instant Suggestions */}
            <form onSubmit={handleHeroSubmit} className="relative mt-6 max-w-2xl">
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15 dark:border-slate-700 dark:bg-slate-950">
                <Search className="ml-2.5 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder={heroCopy.searchPlaceholder}
                  aria-label={heroCopy.searchPlaceholder}
                  className="w-full bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                />
                <VoiceSearchButton
                  language={language}
                  isListening={voiceSearch.isListening}
                  onClick={voiceSearch.toggle}
                />
                <button
                  type="submit"
                  className="shrink-0 whitespace-nowrap rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  {heroCopy.searchButton}
                </button>
              </div>

              <VoiceSearchFeedback
                language={language}
                status={voiceSearch.status}
                errorCode={voiceSearch.errorCode}
                interimTranscript={voiceSearch.interimTranscript}
                onStop={voiceSearch.stop}
                onDismissError={voiceSearch.clearError}
              />

              {suggestions.length > 0 && (
                <div
                  role="listbox"
                  aria-label="Search suggestions"
                  className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  {suggestions.map((sug) => {
                    const match = projects.find((p) => p.id === sug.id);
                    return (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => {
                          setHeroQuery('');
                          if (match) onOpenDetail(match);
                        }}
                        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {sug.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {sug.subtitle}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          {typeLabels[sug.contentType]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </form>

            {/* Quick Content Type Shortcuts */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {heroCopy.quickBrowseLabel}:
              </span>
              {quickTypes.map((typeId) => (
                <button
                  key={typeId}
                  type="button"
                  onClick={() => onSearchAndDiscover({ type: typeId, page: 1 })}
                  className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/60"
                >
                  {typeLabels[typeId]}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {heroCopy.verifiedMetricNote}
              </p>
              <button
                type="button"
                disabled={isSyncingBatch}
                onClick={onSyncAllGithub}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncingBatch ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncingBatch ? homeCopy.syncingGithub : homeCopy.syncAllLiveGithub}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              {!heroImgFailed ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="VibeAtlas maker studio showcase"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[260px] flex-col justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-6 dark:from-slate-900 dark:to-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    VibeAtlas Global Index
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Web Apps · MCP Servers · AI Skills · Open Source
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Trending / Newly Launched / Rising OSS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Discovery spotlight tabs"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              type="button"
              role="tab"
              aria-selected={spotlightTab === 'trending'}
              onClick={() => setSpotlightTab('trending')}
              className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                spotlightTab === 'trending'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {homeCopy.trendingTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={spotlightTab === 'new'}
              onClick={() => setSpotlightTab('new')}
              className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                spotlightTab === 'new'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {homeCopy.newlyLaunchedTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={spotlightTab === 'oss'}
              onClick={() => setSpotlightTab('oss')}
              className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                spotlightTab === 'oss'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {homeCopy.risingOssTab}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSearchAndDiscover({ page: 1 })}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            <span>{homeCopy.viewAllDiscover}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {spotlightProjects.map((proj) => (
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
      </section>

      {/* Section 2: MCP Servers & AI Skills + Stack Curation */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {homeCopy.mcpAndSkillsTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {homeCopy.mcpAndSkillsSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSearchAndDiscover({ type: 'mcp_server', page: 1 })}
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
              >
                <span>MCP / Skills</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mcpAndSkillProjects.map((proj) => (
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
          </div>

          {/* Ecosystem Stack Directory Links */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {homeCopy.stacksTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {homeCopy.stacksSubtitle}
            </p>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {[
                {
                  label: `Built with ${PLATFORM_LABELS.lovable}`,
                  count: projects.filter((p) => p.developmentPlatform === 'lovable').length,
                  patch: { platform: 'lovable' as const },
                },
                {
                  label: 'Built with Vercel / v0',
                  count: projects.filter(
                    (p) => p.hostingProvider === 'vercel' || p.developmentPlatform === 'v0'
                  ).length,
                  patch: { hosting: 'vercel' as const },
                },
                {
                  label: 'Powered by Supabase',
                  count: projects.filter((p) => p.backendTech === 'supabase').length,
                  patch: { backend: 'supabase' as const },
                },
                {
                  label: `Built with ${PLATFORM_LABELS.cursor}`,
                  count: projects.filter((p) => p.developmentPlatform === 'cursor').length,
                  patch: { platform: 'cursor' as const },
                },
                {
                  label: `Built with ${PLATFORM_LABELS.claude_code}`,
                  count: projects.filter((p) => p.developmentPlatform === 'claude_code').length,
                  patch: { platform: 'claude_code' as const },
                },
              ].map((stack) => (
                <button
                  key={stack.label}
                  type="button"
                  onClick={() => onSearchAndDiscover({ ...stack.patch, page: 1 })}
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-400"
                >
                  <span>{stack.label}</span>
                  <span className="tabular-nums font-mono text-xs text-slate-500 dark:text-slate-400">
                    {stack.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <img
                src={MCP_SHOWCASE_IMAGE}
                alt="MCP protocol modules"
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover dark:border-slate-800"
              />
              <img
                src={WORKSPACE_SHOWCASE_IMAGE}
                alt="AI agent workspace"
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover dark:border-slate-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Korean & Global Builders Spotlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {homeCopy.koreanGlobalTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {homeCopy.koreanGlobalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSearchAndDiscover({ country: 'KR', page: 1 })}
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
          >
            <span>KR Projects</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {koreanAndGlobalSpotlights.map((proj) => (
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
      </section>

      {/* Section 4: Featured Makers + Submit CTA + Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Featured Makers */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {homeCopy.featuredMakersTitle}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {homeCopy.featuredMakersSubtitle}
            </p>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {featuredMakers.map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {m.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {m.handle || 'Maker'} · {m.country} · {m.project.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(m.project)}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {UI_STRINGS[language].card.openDetail}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit CTA + Seoul Studio Preview */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <img
                src={KOREAN_MAKERS_IMAGE}
                alt="Seoul independent maker workspace"
                referrerPolicy="no-referrer"
                className="mb-4 aspect-[16/9] w-full rounded-lg border border-slate-200 object-cover dark:border-slate-800"
              />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {homeCopy.submitCtaTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {homeCopy.submitCtaBody}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('submit')}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              <span>{homeCopy.submitCtaButton}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {homeCopy.newsletterTitle}
                </h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {homeCopy.newsletterBody}
              </p>
            </div>

            <form onSubmit={handleNewsletter} className="mt-4 space-y-2.5">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={homeCopy.newsletterPlaceholder}
                aria-label={homeCopy.newsletterTitle}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {homeCopy.newsletterButton}
              </button>
              {!user && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {homeCopy.newsletterSignInNotice}
                </p>
              )}
              {newsletterMsg && (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{newsletterMsg}</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
