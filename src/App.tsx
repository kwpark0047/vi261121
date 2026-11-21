import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { CURATED_SEED_PROJECTS } from './data/seedCatalog';
import { UI_STRINGS } from './data/i18n';
import { auth, googleAuthProvider } from './lib/firebase';
import {
  createFirestoreProject,
  deleteFirestoreProject,
  submitOwnershipClaimToFirestore,
  submitReportToFirestore,
  subscribeNewsletterInFirestore,
  subscribeToFirestoreProjects,
  subscribeToUserBookmarks,
  subscribeToUserClaims,
  subscribeToUserReports,
  syncSignedInUserProfile,
  toggleFirestoreBookmark,
  toggleFirestoreLike,
  updateProjectGitHubStats,
} from './lib/firestoreRepo';
import { DEFAULT_SEARCH_FILTERS, parseUrlState, serializeUrlState } from './lib/urlSync';
import type {
  ActivePage,
  AppLanguage,
  CatalogProject,
  GitHubRepoMetadata,
  OwnershipClaimRecord,
  ProjectReportRecord,
  SearchFilters,
} from './types/vibeatlas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TopNav } from './components/TopNav';
import { WorkspaceBar } from './components/WorkspaceBar';

// Route-level pages and the detail modal are code-split so that the initial
// bundle stays small; each is loaded on demand inside a Suspense boundary.
const HomePage = lazy(() => import('./components/HomePage').then((m) => ({ default: m.HomePage })));
const DiscoverPage = lazy(() => import('./components/DiscoverPage').then((m) => ({ default: m.DiscoverPage })));
const SubmitProjectPage = lazy(() => import('./components/SubmitProjectPage').then((m) => ({ default: m.SubmitProjectPage })));
const MakerDashboardPage = lazy(() => import('./components/MakerDashboardPage').then((m) => ({ default: m.MakerDashboardPage })));
const ProjectDetailModal = lazy(() => import('./components/ProjectDetailModal').then((m) => ({ default: m.ProjectDetailModal })));

const STORAGE_LANG_KEY = 'vibeatlas_lang_v1';
const STORAGE_THEME_KEY = 'vibeatlas_theme_v1';
const STORAGE_GUEST_BOOKMARKS_KEY = 'vibeatlas_guest_bookmarks_v1';
const STORAGE_GUEST_LIKES_KEY = 'vibeatlas_guest_likes_v1';
const STORAGE_GH_CACHE_KEY = 'vibeatlas_gh_cache_v1';

function readGithubSessionCache(): Record<string, GitHubRepoMetadata> {
  try {
    const raw = sessionStorage.getItem(STORAGE_GH_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, GitHubRepoMetadata>) : {};
  } catch {
    return {};
  }
}

function readLocalSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export default function App() {
  const initialRoute = useMemo(() => parseUrlState(window.location.search), []);

  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) === 'en' ? 'en' : 'ko';
    } catch {
      return 'ko';
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const [activePage, setActivePage] = useState<ActivePage>(initialRoute.tab);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialRoute.projectSlug);
  const [filters, setFilters] = useState<SearchFilters>(initialRoute.filters);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [firestoreProjects, setFirestoreProjects] = useState<CatalogProject[]>([]);
  const [githubSyncedMap, setGithubSyncedMap] = useState<Record<string, GitHubRepoMetadata>>(() =>
    readGithubSessionCache()
  );
  const [isSyncingBatch, setIsSyncingBatch] = useState<boolean>(false);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);
  const [isLoadingCatalog] = useState<boolean>(false);

  const [guestBookmarks, setGuestBookmarks] = useState<Set<string>>(() =>
    readLocalSet(STORAGE_GUEST_BOOKMARKS_KEY)
  );
  const [guestLikes, setGuestLikes] = useState<Set<string>>(() =>
    readLocalSet(STORAGE_GUEST_LIKES_KEY)
  );
  const [firestoreBookmarks, setFirestoreBookmarks] = useState<Set<string>>(new Set());
  const [userReports, setUserReports] = useState<ProjectReportRecord[]>([]);
  const [userClaims, setUserClaims] = useState<OwnershipClaimRecord[]>([]);

  // Theme & Language sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage failure
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch {
      // ignore storage failure
    }
  }, [language]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_GH_CACHE_KEY, JSON.stringify(githubSyncedMap));
    } catch {
      // ignore storage failure
    }
  }, [githubSyncedMap]);

  // Bidirectional URL synchronization
  useEffect(() => {
    const nextSearch = serializeUrlState({
      tab: activePage,
      projectSlug: selectedSlug,
      filters,
    });
    const nextUrl = `${window.location.pathname}${nextSearch}`;
    if (window.location.search !== nextSearch) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [activePage, selectedSlug, filters]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseUrlState(window.location.search);
      setActivePage(parsed.tab);
      setSelectedSlug(parsed.projectSlug);
      setFilters(parsed.filters);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Firebase Auth & Firestore subscriptions
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        void syncSignedInUserProfile(currentUser).catch((err) => {
          console.error('Failed syncing user profile:', err);
        });
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubProjects = subscribeToFirestoreProjects(
      (list) => setFirestoreProjects(list),
      (err) => console.error('Firestore projects listener error:', err)
    );
    return () => unsubProjects();
  }, []);

  useEffect(() => {
    if (!user) {
      setFirestoreBookmarks(new Set());
      setUserReports([]);
      setUserClaims([]);
      return;
    }
    const unsubBookmarks = subscribeToUserBookmarks(user.uid, setFirestoreBookmarks);
    const unsubReports = subscribeToUserReports(user.uid, setUserReports);
    const unsubClaims = subscribeToUserClaims(user.uid, setUserClaims);
    return () => {
      unsubBookmarks();
      unsubReports();
      unsubClaims();
    };
  }, [user]);

  const allProjects = useMemo<CatalogProject[]>(() => {
    const mergedBySlug = new Map<string, CatalogProject>();
    for (const seed of CURATED_SEED_PROJECTS) {
      const gh = seed.githubRepo ? githubSyncedMap[seed.githubRepo] : undefined;
      const resolvedLicense =
        gh && gh.license && gh.license !== 'Unknown' ? gh.license : seed.license;
      mergedBySlug.set(seed.slug, {
        ...seed,
        githubStars: gh ? gh.stars : seed.githubStars,
        githubForks: gh ? gh.forks : seed.githubForks,
        license: resolvedLicense,
        lastSyncedAt: gh ? gh.fetchedAt : seed.lastSyncedAt,
        likesCount: seed.likesCount + (guestLikes.has(seed.id) ? 1 : 0),
        bookmarksCount: seed.bookmarksCount + (guestBookmarks.has(seed.id) ? 1 : 0),
      });
    }
    for (const fsProj of firestoreProjects) {
      const gh = fsProj.githubRepo ? githubSyncedMap[fsProj.githubRepo] : undefined;
      const resolvedLicense =
        gh && gh.license && gh.license !== 'Unknown' ? gh.license : fsProj.license;
      mergedBySlug.set(fsProj.slug, {
        ...fsProj,
        githubStars: gh ? gh.stars : fsProj.githubStars,
        githubForks: gh ? gh.forks : fsProj.githubForks,
        license: resolvedLicense,
        lastSyncedAt: gh ? gh.fetchedAt : fsProj.lastSyncedAt,
      });
    }
    return Array.from(mergedBySlug.values());
  }, [firestoreProjects, githubSyncedMap, guestLikes, guestBookmarks]);

  const selectedProject = useMemo(
    () => (selectedSlug ? allProjects.find((p) => p.slug === selectedSlug) ?? null : null),
    [selectedSlug, allProjects]
  );

  const effectiveBookmarks = useMemo(() => {
    const set = new Set<string>(guestBookmarks);
    for (const id of firestoreBookmarks) set.add(id);
    return set;
  }, [guestBookmarks, firestoreBookmarks]);

  const handleSignIn = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed');
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  const handleToggleLike = useCallback(
    async (project: CatalogProject) => {
      const currentlyLiked = guestLikes.has(project.id);
      const next = new Set(guestLikes);
      if (currentlyLiked) next.delete(project.id);
      else next.add(project.id);
      setGuestLikes(next);
      try {
        localStorage.setItem(STORAGE_GUEST_LIKES_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore storage error
      }
      if (user && !project.isCuratedSeed) {
        await toggleFirestoreLike(user, project, currentlyLiked);
      }
    },
    [guestLikes, user]
  );

  const handleToggleBookmark = useCallback(
    async (project: CatalogProject) => {
      const currentlyBookmarked = effectiveBookmarks.has(project.id);
      if (user) {
        await toggleFirestoreBookmark(user, project, currentlyBookmarked);
      }
      const next = new Set(guestBookmarks);
      if (currentlyBookmarked) next.delete(project.id);
      else next.add(project.id);
      setGuestBookmarks(next);
      try {
        localStorage.setItem(STORAGE_GUEST_BOOKMARKS_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore storage error
      }
    },
    [effectiveBookmarks, guestBookmarks, user]
  );

  const handleSyncAllGithub = useCallback(async () => {
    const repos = Array.from(
      new Set(allProjects.map((p) => p.githubRepo).filter(Boolean))
    ).slice(0, 12);
    if (repos.length === 0) return;
    setIsSyncingBatch(true);
    try {
      const resp = await fetch('/api/github/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repos }),
      });
      const data = await resp.json();
      if (resp.ok && data.results) {
        setGithubSyncedMap((prev) => ({ ...prev, ...data.results }));
      }
    } finally {
      setIsSyncingBatch(false);
    }
  }, [allProjects]);

  const handleSyncSingleGithub = useCallback(
    async (project: CatalogProject) => {
      if (!project.githubRepo) return;
      setSyncingProjectId(project.id);
      try {
        const resp = await fetch(`/api/github/repo?repo=${encodeURIComponent(project.githubRepo)}`);
        const data = await resp.json();
        if (resp.ok && data.repo) {
          const repo = data.repo as GitHubRepoMetadata;
          setGithubSyncedMap((prev) => ({ ...prev, [project.githubRepo]: repo }));
          if (!project.isCuratedSeed && user && project.ownerUid === user.uid) {
            await updateProjectGitHubStats(project.id, repo.stars, repo.forks, repo.license);
          }
        }
      } finally {
        setSyncingProjectId(null);
      }
    },
    [user]
  );

  const handleUpdateFilters = useCallback((patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_SEARCH_FILTERS);
  }, []);

  const handleSearchAndDiscover = useCallback((patch: Partial<SearchFilters>) => {
    setFilters({ ...DEFAULT_SEARCH_FILTERS, ...patch });
    setActivePage('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCreateProject = useCallback(
    async (
      payload: Omit<
        CatalogProject,
        'id' | 'ownerUid' | 'likesCount' | 'bookmarksCount' | 'createdAtIso' | 'updatedAtIso'
      >
    ) => {
      if (!user) throw new Error('Sign in required');
      await createFirestoreProject(user, payload);
      setActivePage('discover');
      setSelectedSlug(payload.slug);
    },
    [user]
  );

  const footerCopy = UI_STRINGS[language].footer;

  return (
    <ErrorBoundary>
      <div id="top" className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <TopNav
          language={language}
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <WorkspaceBar
          language={language}
          onLanguageChange={setLanguage}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          user={user}
          authLoading={authLoading}
          bookmarkCount={effectiveBookmarks.size}
          onSignIn={() => void handleSignIn()}
          onSignOut={() => void handleSignOut()}
          onNavigate={setActivePage}
        />

        {authError && (
          <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6">
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {authError}
            </div>
          </div>
        )}

        <main className="flex-1">
          {activePage === 'home' && (
            <Suspense fallback={null}>
              <HomePage
                language={language}
                projects={allProjects}
                likedIds={guestLikes}
                bookmarkedIds={effectiveBookmarks}
                user={user}
                isSyncingBatch={isSyncingBatch}
                onSyncAllGithub={() => void handleSyncAllGithub()}
                onOpenDetail={(p) => setSelectedSlug(p.slug)}
                onToggleLike={(p) => void handleToggleLike(p)}
                onToggleBookmark={(p) => void handleToggleBookmark(p)}
                onSearchAndDiscover={handleSearchAndDiscover}
                onNavigate={setActivePage}
                onSignIn={() => void handleSignIn()}
                onSubscribeNewsletter={async (email) => {
                  if (!user) throw new Error('Sign in required');
                  await subscribeNewsletterInFirestore(user, email, language);
                }}
              />
            </Suspense>
          )}

          {activePage === 'discover' && (
            <Suspense fallback={null}>
              <DiscoverPage
                language={language}
                projects={allProjects}
                filters={filters}
                isLoading={isLoadingCatalog}
                likedIds={guestLikes}
                bookmarkedIds={effectiveBookmarks}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={handleResetFilters}
                onOpenDetail={(p) => setSelectedSlug(p.slug)}
                onToggleLike={(p) => void handleToggleLike(p)}
                onToggleBookmark={(p) => void handleToggleBookmark(p)}
              />
            </Suspense>
          )}

          {activePage === 'submit' && (
            <Suspense fallback={null}>
              <SubmitProjectPage
                language={language}
                user={user}
                onSignIn={() => void handleSignIn()}
                onCreateProject={handleCreateProject}
              />
            </Suspense>
          )}

          {activePage === 'maker' && (
            <Suspense fallback={null}>
              <MakerDashboardPage
                language={language}
                user={user}
                projects={allProjects}
                likedIds={guestLikes}
                bookmarkedIds={effectiveBookmarks}
                reports={userReports}
                claims={userClaims}
                syncingProjectId={syncingProjectId}
                onSignIn={() => void handleSignIn()}
                onNavigate={setActivePage}
                onOpenDetail={(p) => setSelectedSlug(p.slug)}
                onToggleLike={(p) => void handleToggleLike(p)}
                onToggleBookmark={(p) => void handleToggleBookmark(p)}
                onSyncProject={(p) => void handleSyncSingleGithub(p)}
                onDeleteProject={deleteFirestoreProject}
              />
            </Suspense>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 dark:text-slate-400">
            <p>{footerCopy.tagline}</p>
            <p>{footerCopy.transparencyNote}</p>
          </div>
        </footer>

        <Suspense fallback={null}>
          <ProjectDetailModal
            project={selectedProject}
            allProjects={allProjects}
            language={language}
            user={user}
            isLiked={selectedProject ? guestLikes.has(selectedProject.id) : false}
            isBookmarked={selectedProject ? effectiveBookmarks.has(selectedProject.id) : false}
            isSyncing={Boolean(selectedProject && syncingProjectId === selectedProject.id)}
            onClose={() => setSelectedSlug(null)}
            onSelectProject={(p) => setSelectedSlug(p.slug)}
            onToggleLike={(p) => void handleToggleLike(p)}
            onToggleBookmark={(p) => void handleToggleBookmark(p)}
            onSyncSingleGithub={(p) => void handleSyncSingleGithub(p)}
            onSubmitReport={async (proj, reason, details) => {
              if (!user) throw new Error('Sign in required');
              await submitReportToFirestore(user, proj, reason, details);
            }}
            onSubmitClaim={async (proj, method, proof) => {
              if (!user) throw new Error('Sign in required');
              await submitOwnershipClaimToFirestore(user, proj, method, proof);
            }}
            onSignIn={() => void handleSignIn()}
          />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
