import type { CatalogProject } from '../types/vibeatlas';

export type MakerAnalyticsSort = 'engagement' | 'likes' | 'bookmarks' | 'recent';

export interface MakerEngagementSummary {
  totalProjects: number;
  totalLikes: number;
  totalBookmarks: number;
  totalEngagement: number;
  totalGithubStars: number;
  topProject: CatalogProject | null;
}

export interface ProjectEngagementRow {
  project: CatalogProject;
  likesCount: number;
  bookmarksCount: number;
  totalEngagement: number;
  githubStars: number;
  barWidthPercent: number;
  likesSegmentPercent: number;
  bookmarksSegmentPercent: number;
}

export function computeMakerEngagementSummary(
  ownedProjects: CatalogProject[]
): MakerEngagementSummary {
  if (ownedProjects.length === 0) {
    return {
      totalProjects: 0,
      totalLikes: 0,
      totalBookmarks: 0,
      totalEngagement: 0,
      totalGithubStars: 0,
      topProject: null,
    };
  }

  let totalLikes = 0;
  let totalBookmarks = 0;
  let totalGithubStars = 0;
  let topProject: CatalogProject = ownedProjects[0]!;
  let topScore = -1;

  for (const project of ownedProjects) {
    const likes = Math.max(0, Number(project.likesCount) || 0);
    const bookmarks = Math.max(0, Number(project.bookmarksCount) || 0);
    const stars = Math.max(0, Number(project.githubStars) || 0);

    totalLikes += likes;
    totalBookmarks += bookmarks;
    totalGithubStars += stars;

    const engagement = likes + bookmarks;
    if (engagement > topScore) {
      topScore = engagement;
      topProject = project;
    }
  }

  return {
    totalProjects: ownedProjects.length,
    totalLikes,
    totalBookmarks,
    totalEngagement: totalLikes + totalBookmarks,
    totalGithubStars,
    topProject,
  };
}

export function computeProjectEngagementRows(
  ownedProjects: CatalogProject[],
  sortBy: MakerAnalyticsSort = 'engagement'
): ProjectEngagementRow[] {
  if (ownedProjects.length === 0) return [];

  let maxEngagement = 0;
  for (const project of ownedProjects) {
    const likes = Math.max(0, Number(project.likesCount) || 0);
    const bookmarks = Math.max(0, Number(project.bookmarksCount) || 0);
    maxEngagement = Math.max(maxEngagement, likes + bookmarks);
  }

  const rows: ProjectEngagementRow[] = ownedProjects.map((project) => {
    const likesCount = Math.max(0, Number(project.likesCount) || 0);
    const bookmarksCount = Math.max(0, Number(project.bookmarksCount) || 0);
    const totalEngagement = likesCount + bookmarksCount;
    const githubStars = Math.max(0, Number(project.githubStars) || 0);

    const barWidthPercent =
      maxEngagement > 0 ? Math.round((totalEngagement / maxEngagement) * 100) : 0;
    const likesSegmentPercent =
      totalEngagement > 0 ? Math.round((likesCount / totalEngagement) * 100) : 0;
    const bookmarksSegmentPercent =
      totalEngagement > 0 ? Math.max(0, 100 - likesSegmentPercent) : 0;

    return {
      project,
      likesCount,
      bookmarksCount,
      totalEngagement,
      githubStars,
      barWidthPercent,
      likesSegmentPercent,
      bookmarksSegmentPercent,
    };
  });

  rows.sort((a, b) => {
    switch (sortBy) {
      case 'likes':
        return (
          b.likesCount - a.likesCount ||
          b.bookmarksCount - a.bookmarksCount ||
          a.project.name.localeCompare(b.project.name)
        );
      case 'bookmarks':
        return (
          b.bookmarksCount - a.bookmarksCount ||
          b.likesCount - a.likesCount ||
          a.project.name.localeCompare(b.project.name)
        );
      case 'recent':
        return (
          (b.project.createdAtIso || '').localeCompare(a.project.createdAtIso || '') ||
          b.totalEngagement - a.totalEngagement
        );
      case 'engagement':
      default:
        return (
          b.totalEngagement - a.totalEngagement ||
          b.likesCount - a.likesCount ||
          a.project.name.localeCompare(b.project.name)
        );
    }
  });

  return rows;
}
