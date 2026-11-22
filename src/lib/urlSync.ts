import type {
  ActivePage,
  BackendTech,
  ContentType,
  DevelopmentPlatform,
  HostingProvider,
  PricingModel,
  SearchFilters,
  SortOption,
  VerificationStatus,
  ViewMode,
} from '../types/vibeatlas';

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  q: '',
  type: 'all',
  category: 'all',
  platform: 'all',
  hosting: 'all',
  backend: 'all',
  country: 'all',
  lang: 'all',
  license: 'all',
  pricing: 'all',
  verified: 'all',
  minStars: 0,
  updatedWithinDays: 0,
  sort: 'relevance',
  view: 'grid',
  page: 1,
};

const VALID_TYPES: ReadonlyArray<ContentType> = [
  'web_app',
  'ai_tool',
  'mcp_server',
  'ai_skill',
  'ai_agent',
  'template',
  'open_source',
];

const VALID_PLATFORMS: ReadonlyArray<DevelopmentPlatform> = [
  'lovable',
  'cursor',
  'windsurf',
  'bolt',
  'v0',
  'claude_code',
  'replit',
  'opencode',
  'google_ai_studio',
  'custom',
];

const VALID_HOSTINGS: ReadonlyArray<HostingProvider> = [
  'vercel',
  'cloudflare',
  'aws',
  'fly_io',
  'gcp',
  'netlify',
  'self_hosted',
  'unknown',
];

const VALID_BACKENDS: ReadonlyArray<BackendTech> = [
  'supabase',
  'firebase',
  'postgresql',
  'nodejs',
  'python_fastapi',
  'sqlite',
  'serverless',
  'none',
  'unknown',
];

const VALID_PRICINGS: ReadonlyArray<PricingModel> = [
  'free',
  'open_source',
  'freemium',
  'paid',
  'enterprise',
];

const VALID_VERIFIED: ReadonlyArray<VerificationStatus> = [
  'verified',
  'pending',
  'unverified',
];

const VALID_SORTS: ReadonlyArray<SortOption> = [
  'relevance',
  'trending_24h',
  'trending_7d',
  'trending_30d',
  'most_starred',
  'most_liked',
  'most_bookmarked',
  'recently_added',
  'recently_updated',
];

const VALID_LANGS: ReadonlyArray<'ko' | 'en' | 'bilingual' | 'other'> = [
  'ko',
  'en',
  'bilingual',
  'other',
];

function pickEnum<T extends string>(val: string | null, allowed: ReadonlyArray<T>, fallback: T | 'all'): T | 'all' {
  if (!val) return fallback;
  return (allowed as ReadonlyArray<string>).includes(val) ? (val as T) : fallback;
}

export interface RouteUrlState {
  tab: ActivePage;
  projectSlug: string | null;
  filters: SearchFilters;
}

export function parseUrlState(searchString: string): RouteUrlState {
  const params = new URLSearchParams(searchString.startsWith('?') ? searchString.slice(1) : searchString);
  const tabParam = params.get('tab');
  const tab: ActivePage =
    tabParam === 'discover' || tabParam === 'maker' || tabParam === 'submit' || tabParam === 'admin'
      ? tabParam
      : 'home';

  const projectSlug = params.get('project')?.trim() || null;

  const minStarsRaw = Number(params.get('minStars') ?? '0');
  const updatedWithinRaw = Number(params.get('days') ?? '0');
  const pageRaw = Number(params.get('page') ?? '1');
  const viewParam = params.get('view');
  const view: ViewMode = viewParam === 'list' ? 'list' : 'grid';

  const sortParam = params.get('sort');
  const sort: SortOption = (VALID_SORTS as ReadonlyArray<string>).includes(sortParam ?? '')
    ? (sortParam as SortOption)
    : 'relevance';

  const filters: SearchFilters = {
    q: params.get('q') ?? '',
    type: pickEnum(params.get('type'), VALID_TYPES, 'all'),
    category: params.get('category')?.trim() || 'all',
    platform: pickEnum(params.get('platform'), VALID_PLATFORMS, 'all'),
    hosting: pickEnum(params.get('hosting'), VALID_HOSTINGS, 'all'),
    backend: pickEnum(params.get('backend'), VALID_BACKENDS, 'all'),
    country: params.get('country')?.trim() || 'all',
    lang: pickEnum(params.get('lang'), VALID_LANGS, 'all'),
    license: params.get('license')?.trim() || 'all',
    pricing: pickEnum(params.get('pricing'), VALID_PRICINGS, 'all'),
    verified: pickEnum(params.get('verified'), VALID_VERIFIED, 'all'),
    minStars: Number.isFinite(minStarsRaw) && minStarsRaw > 0 ? Math.floor(minStarsRaw) : 0,
    updatedWithinDays:
      Number.isFinite(updatedWithinRaw) && updatedWithinRaw > 0 ? Math.floor(updatedWithinRaw) : 0,
    sort,
    view,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
  };

  return { tab, projectSlug, filters };
}

export function serializeUrlState(state: RouteUrlState): string {
  const params = new URLSearchParams();
  if (state.tab !== 'home') {
    params.set('tab', state.tab);
  }
  if (state.projectSlug) {
    params.set('project', state.projectSlug);
  }

  const f = state.filters;
  if (f.q.trim()) params.set('q', f.q.trim());
  if (f.type !== 'all') params.set('type', f.type);
  if (f.category !== 'all') params.set('category', f.category);
  if (f.platform !== 'all') params.set('platform', f.platform);
  if (f.hosting !== 'all') params.set('hosting', f.hosting);
  if (f.backend !== 'all') params.set('backend', f.backend);
  if (f.country !== 'all') params.set('country', f.country);
  if (f.lang !== 'all') params.set('lang', f.lang);
  if (f.license !== 'all') params.set('license', f.license);
  if (f.pricing !== 'all') params.set('pricing', f.pricing);
  if (f.verified !== 'all') params.set('verified', f.verified);
  if (f.minStars > 0) params.set('minStars', String(f.minStars));
  if (f.updatedWithinDays > 0) params.set('days', String(f.updatedWithinDays));
  if (f.sort !== 'relevance') params.set('sort', f.sort);
  if (f.view !== 'grid') params.set('view', f.view);
  if (f.page > 1) params.set('page', String(f.page));

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
