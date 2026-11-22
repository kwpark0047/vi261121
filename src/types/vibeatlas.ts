export type AppLanguage = 'ko' | 'en';

export type ContentType =
  | 'web_app'
  | 'ai_tool'
  | 'mcp_server'
  | 'ai_skill'
  | 'ai_agent'
  | 'template'
  | 'open_source';

export type DevelopmentPlatform =
  | 'lovable'
  | 'cursor'
  | 'windsurf'
  | 'bolt'
  | 'v0'
  | 'claude_code'
  | 'replit'
  | 'opencode'
  | 'google_ai_studio'
  | 'custom';

export type PlatformCategory = 'ai_coding_agent' | 'ai_app_builder' | 'other';

export type HostingProvider =
  | 'vercel'
  | 'cloudflare'
  | 'aws'
  | 'fly_io'
  | 'gcp'
  | 'netlify'
  | 'self_hosted'
  | 'unknown';

export type BackendTech =
  | 'supabase'
  | 'firebase'
  | 'postgresql'
  | 'nodejs'
  | 'python_fastapi'
  | 'sqlite'
  | 'serverless'
  | 'none'
  | 'unknown';

export type PricingModel = 'free' | 'open_source' | 'freemium' | 'paid' | 'enterprise';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type ProvenanceSource = 'github_sync' | 'maker_submitted' | 'editorial_curated';

export type FreshnessState = 'fresh' | 'stale' | 'unknown';

export type SortOption =
  | 'relevance'
  | 'trending_24h'
  | 'trending_7d'
  | 'trending_30d'
  | 'most_starred'
  | 'most_liked'
  | 'most_bookmarked'
  | 'recently_added'
  | 'recently_updated';

export type ViewMode = 'grid' | 'list';

export type ActivePage = 'home' | 'discover' | 'maker' | 'submit' | 'admin' | 'github-stars';

export interface DailySignalPoint {
  date: string;
  githubStarsDelta: number;
  internalLikes: number;
  internalBookmarks: number;
}

export interface CatalogProject {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  taglineKo: string;
  description: string;
  descriptionKo: string;
  contentType: ContentType;
  categories: string[];
  techStack: string[];
  developmentPlatform: DevelopmentPlatform;
  hostingProvider: HostingProvider;
  backendTech: BackendTech;
  country: string;
  language: 'ko' | 'en' | 'bilingual' | 'other';
  license: string;
  pricingModel: PricingModel;
  verificationStatus: VerificationStatus;
  provenanceSource: ProvenanceSource;
  liveDemoUrl: string;
  websiteUrl: string;
  githubRepo: string;
  githubUrl: string;
  thumbnailUrl: string;
  makerName: string;
  makerHandle: string;
  ownerUid: string;
  githubStars: number;
  githubForks: number;
  likesCount: number;
  bookmarksCount: number;
  lastSyncedAt: string;
  createdAtIso: string;
  updatedAtIso: string;
  isCuratedSeed?: boolean;
  historicalSignals?: DailySignalPoint[];
}

export interface SearchFilters {
  q: string;
  type: ContentType | 'all';
  category: string;
  platform: DevelopmentPlatform | 'all';
  hosting: HostingProvider | 'all';
  backend: BackendTech | 'all';
  country: string;
  lang: 'all' | 'ko' | 'en' | 'bilingual' | 'other';
  license: string;
  pricing: PricingModel | 'all';
  verified: VerificationStatus | 'all';
  minStars: number;
  updatedWithinDays: number;
  sort: SortOption;
  view: ViewMode;
  page: number;
}

export interface SearchSuggestion {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  contentType: ContentType;
}

export interface ProjectReportRecord {
  id: string;
  projectId: string;
  projectSlug: string;
  reporterUid: string;
  reason: 'broken_link' | 'stale_metadata' | 'spam' | 'misattribution' | 'security_concern';
  details: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAtIso: string;
  updatedAtIso?: string;
}

export interface OwnershipClaimRecord {
  id: string;
  projectId: string;
  projectSlug: string;
  claimantUid: string;
  verificationMethod: 'github_repo' | 'domain_dns' | 'demo_meta';
  proofNote: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAtIso: string;
  updatedAtIso?: string;
}

export interface GitHubRepoMetadata {
  fullName: string;
  name: string;
  description: string;
  homepage: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  license: string;
  language: string;
  topics: string[];
  ownerLogin: string;
  pushedAt: string;
  fetchedAt: string;
}

export interface GitHubRankedRepo {
  id: number;
  rank: number;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  description: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string;
  license: string;
}

export type GitHubTopRepoPreset = 'all' | 'web_apps' | 'ai_agents' | 'typescript' | 'python' | 'rust' | 'go';
