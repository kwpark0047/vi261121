import {
  Bookmark,
  LogIn,
  LogOut,
  Moon,
  ShieldCheck,
  Settings,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { ActivePage, AppLanguage } from '../types/vibeatlas';
import { ADMIN_STRINGS, UI_STRINGS } from '../data/i18n';
import { getAdminRole } from '../lib/admin';

interface WorkspaceBarProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: User | null;
  authLoading: boolean;
  bookmarkCount: number;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigate: (page: ActivePage) => void;
}

export function WorkspaceBar({
  language,
  onLanguageChange,
  darkMode,
  onToggleDarkMode,
  user,
  authLoading,
  bookmarkCount,
  onSignIn,
  onSignOut,
  onNavigate,
}: WorkspaceBarProps) {
  const copy = UI_STRINGS[language].workspace;
  const adminRole = getAdminRole(user);
  const isAdmin = adminRole !== null;

  return (
    <div className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-950"
          >
            <button
              type="button"
              onClick={() => onLanguageChange('ko')}
              className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                language === 'ko'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                language === 'en'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? copy.lightMode : copy.darkMode}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{darkMode ? copy.lightMode : copy.darkMode}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{ADMIN_STRINGS[language].navLabel}</span>
              <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {adminRole === 'main' ? 'M' : 'S'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('maker')}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>{copy.savedBookmarks}</span>
            <span className="tabular-nums font-mono text-slate-500 dark:text-slate-400">
              ({bookmarkCount})
            </span>
          </button>

          {/* User settings/profile button - appears when logged in; admin gets ShieldCheck badge */}
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                  aria-label={isAdmin ? 'Admin dashboard' : 'Profile'}
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">{isAdmin ? ADMIN_STRINGS[language].navLabel : '내 프로필'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('maker')}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                  aria-label="내 프로필"
                >
                  <Settings className="h-3 w-3" />
                  <span className="hidden sm:inline">내 프로필</span>
                </button>
              )}

              {isAdmin ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  aria-label={copy.signOut}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{copy.signOut}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={onSignIn}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <LogIn className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  <span>{copy.signInGoogle}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={onSignIn}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <LogIn className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
              <span>{copy.signInGoogle}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}