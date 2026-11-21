import type {
  AppLanguage,
  CatalogProject,
  FreshnessState,
  SearchFilters,
  SearchSuggestion,
} from '../types/vibeatlas';

const KOREAN_TECH_ALIASES: Record<string, string[]> = {
  엠씨피: ['mcp', 'model context protocol'],
  서버: ['server', 'mcp_server'],
  에이전트: ['agent', 'ai_agent'],
  스킬: ['skill', 'ai_skill'],
  스킬즈: ['skills', 'ai_skill'],
  오픈소스: ['open_source', 'open source', 'oss'],
  템플릿: ['template', 'starter'],
  웹앱: ['web_app', 'web app'],
  바이브코딩: ['vibe', 'lovable', 'cursor', 'bolt', 'v0'],
  한국: ['kr', 'korea', 'korean', 'seoul', '한국'],
  러버블: ['lovable'],
  버셀: ['vercel'],
  수파베이스: ['supabase'],
  파이어베이스: ['firebase'],
  커서: ['cursor'],
  클로드: ['claude', 'claude_code', 'anthropic'],
  자동화: ['automation', 'workflow', 'n8n'],
  브라우저: ['browser'],
  검색: ['search', 'discovery'],
};

export function normalizeQueryText(raw: string): string {
  return raw.trim().toLowerCase();
}

export function tokenizeBilingualQuery(raw: string): string[] {
  const normalized = normalizeQueryText(raw);
  if (!normalized) return [];
  const baseTokens = normalized.split(/[\s/·,_]+/).filter(Boolean);
  const expanded = new Set<string>(baseTokens);

  for (const token of baseTokens) {
    for (const [koKey, aliases] of Object.entries(KOREAN_TECH_ALIASES)) {
      if (token.includes(koKey)) {
        for (const alias of aliases) {
          expanded.add(alias);
        }
      }
    }
  }
  return Array.from(expanded);
}

export function computeFreshnessState(lastSyncedAt: string, nowMs: number = Date.now()): FreshnessState {
  if (!lastSyncedAt || !lastSyncedAt.trim()) return 'unknown';
  const parsed = Date.parse(lastSyncedAt);
  if (Number.isNaN(parsed)) return 'unknown';
  const ageDays = (nowMs - parsed) / (1000 * 60 * 60 * 24);
  return ageDays > 14 ? 'stale' : 'fresh';
}

export function detectMissingFields(project: CatalogProject): string[] {
  const missing: string[] = [];
  if (!project.liveDemoUrl.trim()) missing.push('liveDemoUrl');
  if (!project.websiteUrl.trim()) missing.push('websiteUrl');
  if (!project.githubRepo.trim()) missing.push('githubRepo');
  if (!project.license.trim() || project.license.toLowerCase() === 'unknown') missing.push('license');
  if (!project.lastSyncedAt.trim()) missing.push('lastSyncedAt');
  if (!project.descriptionKo.trim()) missing.push('descriptionKo');
  return missing;
}

export function computeRelevanceScore(project: CatalogProject, rawQuery: string): number {
  const normalized = normalizeQueryText(rawQuery);
  if (!normalized) return 0;

  const baseTokens = normalized.split(/[\s/·,_]+/).filter(Boolean);
  const expandedTokens = tokenizeBilingualQuery(rawQuery);

  const name = project.name.toLowerCase();
  const slug = project.slug.toLowerCase();
  const tagline = `${project.tagline} ${project.taglineKo}`.toLowerCase();
  const desc = `${project.description} ${project.descriptionKo}`.toLowerCase();
  const stackAndCats = [
    ...project.categories,
    ...project.techStack,
    project.developmentPlatform,
    project.hostingProvider,
    project.backendTech,
    project.contentType,
    project.country,
    project.makerName,
    project.makerHandle,
    project.githubRepo,
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;

  // Base tokens must all match at least one alias or field
  for (const token of baseTokens) {
    const tokenAliases = [token];
    for (const [koKey, aliases] of Object.entries(KOREAN_TECH_ALIASES)) {
      if (token.includes(koKey)) {
        tokenAliases.push(...aliases);
      }
    }

    let tokenMatched = false;
    for (const candidate of tokenAliases) {
      if (name === candidate || slug === candidate) {
        score += 120;
        tokenMatched = true;
      } else if (name.includes(candidate)) {
        score += 70;
        tokenMatched = true;
      } else if (tagline.includes(candidate)) {
        score += 35;
        tokenMatched = true;
      } else if (stackAndCats.includes(candidate)) {
        score += 28;
        tokenMatched = true;
      } else if (desc.includes(candidate)) {
        score += 14;
        tokenMatched = true;
      }
    }
    if (!tokenMatched) {
      return 0;
    }
  }

  for (const extra of expandedTokens) {
    if (stackAndCats.includes(extra)) score += 6;
  }

  if (project.verificationStatus === 'verified') score += 8;
  return score;
}

export function filterProjects(
  projects: CatalogProject[],
  filters: SearchFilters,
  nowMs: number = Date.now()
): CatalogProject[] {
  return projects.filter((project) => {
    if (filters.q.trim()) {
      if (computeRelevanceScore(project, filters.q) <= 0) return false;
    }
    if (filters.type !== 'all' && project.contentType !== filters.type) return false;
    if (
      filters.category !== 'all' &&
      !project.categories.some((c) => c.toLowerCase() === filters.category.toLowerCase())
    ) {
      return false;
    }
    if (filters.platform !== 'all' && project.developmentPlatform !== filters.platform) return false;
    if (filters.hosting !== 'all' && project.hostingProvider !== filters.hosting) return false;
    if (filters.backend !== 'all' && project.backendTech !== filters.backend) return false;
    if (filters.country !== 'all' && project.country.toUpperCase() !== filters.country.toUpperCase()) {
      return false;
    }
    if (filters.lang !== 'all' && project.language !== filters.lang) return false;
    if (
      filters.license !== 'all' &&
      project.license.toLowerCase() !== filters.license.toLowerCase()
    ) {
      return false;
    }
    if (filters.pricing !== 'all' && project.pricingModel !== filters.pricing) return false;
    if (filters.verified !== 'all' && project.verificationStatus !== filters.verified) return false;
    if (filters.minStars > 0 && project.githubStars < filters.minStars) return false;
    if (filters.updatedWithinDays > 0) {
      const updatedMs = Date.parse(project.updatedAtIso);
      if (Number.isNaN(updatedMs)) return false;
      const diffDays = (nowMs - updatedMs) / (1000 * 60 * 60 * 24);
      if (diffDays > filters.updatedWithinDays) return false;
    }
    return true;
  });
}

function getWindowSignalScore(project: CatalogProject, days: number): number {
  const points = project.historicalSignals ?? [];
  if (points.length === 0) {
    return project.likesCount * 2 + project.bookmarksCount * 3;
  }
  const slice = points.slice(-days);
  return slice.reduce(
    (acc, pt) => acc + pt.internalBookmarks * 3 + pt.internalLikes * 2 + pt.githubStarsDelta,
    0
  );
}

export function sortProjects(
  projects: CatalogProject[],
  sort: SearchFilters['sort'],
  rawQuery: string
): CatalogProject[] {
  const copy = [...projects];
  copy.sort((a, b) => {
    switch (sort) {
      case 'relevance': {
        if (rawQuery.trim()) {
          const diff = computeRelevanceScore(b, rawQuery) - computeRelevanceScore(a, rawQuery);
          if (diff !== 0) return diff;
        }
        const verifiedDiff =
          (b.verificationStatus === 'verified' ? 1 : 0) -
          (a.verificationStatus === 'verified' ? 1 : 0);
        if (verifiedDiff !== 0) return verifiedDiff;
        return b.bookmarksCount + b.likesCount - (a.bookmarksCount + a.likesCount);
      }
      case 'trending_24h':
        return getWindowSignalScore(b, 1) - getWindowSignalScore(a, 1);
      case 'trending_7d':
        return getWindowSignalScore(b, 7) - getWindowSignalScore(a, 7);
      case 'trending_30d':
        return getWindowSignalScore(b, 30) - getWindowSignalScore(a, 30);
      case 'most_starred':
        return b.githubStars - a.githubStars;
      case 'most_liked':
        return b.likesCount - a.likesCount;
      case 'most_bookmarked':
        return b.bookmarksCount - a.bookmarksCount;
      case 'recently_added':
        return Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso);
      case 'recently_updated':
        return Date.parse(b.updatedAtIso) - Date.parse(a.updatedAtIso);
      default:
        return 0;
    }
  });
  return copy;
}

export function paginateProjects(
  projects: CatalogProject[],
  page: number,
  pageSize: number = 9
): {
  items: CatalogProject[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
} {
  const totalCount = projects.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: projects.slice(start, start + pageSize),
    totalCount,
    totalPages,
    currentPage,
  };
}

export function getRelatedProjects(
  target: CatalogProject,
  allProjects: CatalogProject[],
  limit: number = 3
): CatalogProject[] {
  return allProjects
    .filter((p) => p.id !== target.id)
    .map((candidate) => {
      let overlap = 0;
      if (candidate.contentType === target.contentType) overlap += 4;
      for (const cat of candidate.categories) {
        if (target.categories.includes(cat)) overlap += 3;
      }
      for (const tech of candidate.techStack) {
        if (target.techStack.includes(tech)) overlap += 1;
      }
      if (candidate.developmentPlatform === target.developmentPlatform) overlap += 1;
      return { candidate, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function getSearchSuggestions(
  query: string,
  allProjects: CatalogProject[],
  lang: AppLanguage,
  limit: number = 5
): SearchSuggestion[] {
  if (!query.trim()) return [];
  const ranked = allProjects
    .map((p) => ({ p, score: computeRelevanceScore(p, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked.map(({ p }) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: lang === 'ko' && p.taglineKo ? p.taglineKo : p.tagline,
    contentType: p.contentType,
  }));
}

export function formatCompactCount(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return '0';
  if (val >= 1000) {
    return `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k`;
  }
  return String(val);
}
