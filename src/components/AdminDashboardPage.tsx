import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User } from 'firebase/auth';
import { BadgeCheck, Bookmark, Check, ClipboardList, ExternalLink, Flag, FolderKanban, LayoutDashboard, Loader2, Search, ShieldCheck, Star, Trash2, X } from 'lucide-react';

import { getAdminRole, AdminRole } from '../lib/admin';
import { ADMIN_STRINGS } from '../data/i18n';
import { PLATFORM_LABELS, PLATFORM_CATEGORIES, PLATFORM_CATEGORY_LABELS } from '../data/i18n';
import { subscribeToAllReports, subscribeToAllClaims, updateReportStatus, updateClaimStatus, updateProjectVerificationStatus } from '../lib/firestoreRepo';

interface AdminDashboardProps {
  language: 'ko' | 'en';
  user: User | null;
  authLoading: boolean;
  projects: any[];
  onNavigate: (page: string) => void;
  onOpenDetail?: (project: any) => void;
}

export function AdminDashboardPage({
  language,
  user,
  authLoading,
  projects,
  onNavigate,
  onOpenDetail,
}: AdminDashboardProps) {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [subPage, setSubPage] = useState<'overview' | 'reports' | 'claims' | 'projects' | 'points' | 'referrals' | 'redemptions' | ''>( '');
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ q: string; platform?: string; verification?: string }>({ q: '' });
  const [reports, setReports] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState({
    projects: projects.length,
    verified: 0, // will be computed from projects
    openReports: 0,
    pendingClaims: 0,
    likes: 0,
    bookmarks: 0,
  });

  // Determine role once user is available
  useEffect(() => {
    if (!authLoading && user) {
      setRole(getAdminRole({ email: user.email, emailVerified: user.emailVerified }));
    }
  }, [authLoading, user]);

  // Access denied if no valid admin role
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold mb-2">{language === 'ko' ? ADMIN_STRINGS[language].accessDeniedTitle : ADMIN_STRINGS[language].accessDeniedTitle}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{language === 'ko' ? ADMIN_STRINGS[language].accessDeniedBody : ADMIN_STRINGS[language].accessDeniedBody}</p>
          <button
            onClick={() => onNavigate('home')}
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 dark:hover:bg-indigo-500"
          >
            {language === 'ko' ? '홈으로 이동' : 'Go to Home'}
          </button>
        </div>
      </div>
    );
  }

  // Subscribe to reports and claims when role is confirmed
  useEffect(() => {
    if (role) {
      const reportsUnsub = subscribeToAllReports(
        (snap) => setReports(snap),
        (err) => setError(toMessage(err))
      );
      const claimsUnsub = subscribeToAllClaims(
        (snap) => setClaims(snap),
        (err) => setError(toMessage(err))
      );
      return () => {
        reportsUnsub();
        claimsUnsub();
      };
    }
  }, [role]);

  // Compute stats from projects
  useEffect(() => {
    if (projects) {
      const verifiedCount = projects.filter((p: any) => p.verificationStatus === 'verified').length;
      const openReportCount = reports.filter((r: any) => r.status === 'open').length;
      const pendingClaimCount = claims.filter((c: any) => c.status === 'pending').length;
      setStats({
        projects: projects.length,
        verified: verifiedCount,
        openReports: openReportCount,
        pendingClaims: pendingClaimCount,
        likes: 0, // TODO: compute from projects
        bookmarks: 0, // TODO: compute from projects
      });
    }
  }, [projects, reports, claims]);

  const toMessage = (err: any): string => {
    try {
      return err?.error?.message || JSON.stringify(err);
    } catch {
      return '알 수 없는 오류';
    }
  };

  // Tab navigation
  const navigateTo = (page: 'overview' | 'reports' | 'claims' | 'projects' | 'points' | 'referrals' | 'redemptions') => {
    setSubPage(page);
    onNavigate(`admin/${page}`);
  };

  // --- Overview Tab ---
  if (subPage === 'overview') {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? ADMIN_STRINGS[language].title : ADMIN_STRINGS[language].title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? ADMIN_STRINGS[language].subtitle : ADMIN_STRINGS[language].subtitle}</p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Projects Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">{language === 'ko' ? ADMIN_STRINGS[language].stats.projects : ADMIN_STRINGS[language].stats.projects}</h3>
            <p className="text-3xl font-bold">{stats.projects}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">총 등록 프로젝트</p>
          </div>

          {/* Verified Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">{language === 'ko' ? ADMIN_STRINGS[language].stats.verified : ADMIN_STRINGS[language].stats.verified}</h3>
            <p className="text-3xl font-bold">{stats.verified}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">검증 완료</p>
          </div>

          {/* Open Reports Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">{language === 'ko' ? ADMIN_STRINGS[language].stats.openReports : ADMIN_STRINGS[language].stats.openReports}</h3>
            <p className="text-3xl font-bold">{stats.openReports}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">미처리 신고</p>
          </div>

          {/* Pending Claims Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">{language === 'ko' ? ADMIN_STRINGS[language].stats.pendingClaims : ADMIN_STRINGS[language].stats.pendingClaims}</h3>
            <p className="text-3xl font-bold">{stats.pendingClaims}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">대기 클레임</p>
          </div>

          {/* Likes Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Likes</h3>
            <p className="text-3xl font-bold">{stats.likes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">총 좋아요 수</p>
          </div>

          {/* Bookmarks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Bookmarks</h3>
            <p className="text-3xl font-bold">{stats.bookmarks}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">총 북마크 수</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Recent Reports */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm h-full">
            <h3 className="text-xl font-semibold mb-4">{language === 'ko' ? ADMIN_STRINGS[language].reports.title : ADMIN_STRINGS[language].reports.title}</h3>
            {reports.length === 0 ? (
              <p>{language === 'ko' ? ADMIN_STRINGS[language].reports.empty : ADMIN_STRINGS[language].reports.empty}</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {reports.slice(0, 5).map((report: any) => (
                  <div key={report.id} className="p-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{report.projectSlug || 'Unknown'} ({report.status})</span>
                      <span className="text-xs text-gray-500">{report.reporterUid?.substring(0, 6)}...</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.details?.substring(0, 50) || ''}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Claims */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm h-full">
            <h3 className="text-xl font-semibold mb-4">{language === 'ko' ? ADMIN_STRINGS[language].claims.title : ADMIN_STRINGS[language].claims.title}</h3>
            {claims.length === 0 ? (
              <p>{language === 'ko' ? ADMIN_STRINGS[language].claims.empty : ADMIN_STRINGS[language].claims.empty}</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {claims.slice(0, 5).map((claim: any) => (
                  <div key={claim.id} className="p-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{claim.projectSlug || 'Unknown'} ({claim.status})</span>
                      <span className="text-xs text-gray-500">{claim.claimantUid?.substring(0, 6)}...</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{claim.verificationMethod || ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Reports Tab ---
  if (subPage === 'reports') {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? ADMIN_STRINGS[language].reports.title : ADMIN_STRINGS[language].reports.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? ADMIN_STRINGS[language].reports.subtitle : ADMIN_STRINGS[language].reports.subtitle}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <select
              onChange={(e) => setFilter(({ q }) => ({ ...filter, status: e.target.value as any }))}
              className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="">전체 상태</option>
              <option value="open">{language === 'ko' ? '접수' : 'Open'}</option>
              <option value="reviewed">{language === 'ko' ? '검토 중' : 'Reviewed'}</option>
              <option value="resolved">{language === 'ko' ? '해결됨' : 'Resolved'}</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder={language === 'ko' ? '프로젝트명 또는 UID 검색' : 'Search project or UID'}
              value={filter.q}
              onChange={(e) => setFilter(({ q }) => ({ q: e.target.value }))}
              className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {reports.map((report: any) => {
            const statusMap: Record<string, string> = { open: 'ko' === language ? '접수' : 'Open', reviewed: 'ko' === language ? '검토 중' : 'Reviewed', resolved: 'ko' === language ? '해결됨' : 'Resolved' };
            const status = statusMap[report.status] || report.status;
            return (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{report.projectSlug || 'Unknown project'}</span>
                  <span className="text-xs text-gray-500">{report.reporterUid?.substring(0, 6) || 'unknown'} · {report.createdAt ? new Date(report.createdAt).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US') : 'unknown'}</span>
                </div>
                <div className="flex gap-2">
                  {report.status === 'open' && (
                    <>
                      <button
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                        className="px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800"
                      >
                        {language === 'ko' ? '검토 중' : 'Mark Reviewed'}
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, 'resolved')}
                        className="px-3 py-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        {language === 'ko' ? '해결됨' : 'Mark Resolved'}
                      </button>
                    </>
                  )}
                  {report.status === 'reviewed' && (
                    <button
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                      className="px-3 py-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded hover:bg-green-200 dark:hover:bg-green-800"
                    >
                      {language === 'ko' ? '해결됨' : 'Mark Resolved'}
                    </button>
                  )}
                  {report.status === 'resolved' && <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ko' ? '터미널' : 'Terminal'}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Claims Tab ---
  if (subPage === 'claims') {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? ADMIN_STRINGS[language].claims.title : ADMIN_STRINGS[language].claims.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? ADMIN_STRINGS[language].claims.subtitle : ADMIN_STRINGS[language].claims.subtitle}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <select
              onChange={(e) => setFilter(({ q }) => ({ ...filter, status: e.target.value as any }))}
              className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="">전체 상태</option>
              <option value="pending">{language === 'ko' ? '대기' : 'Pending'}</option>
              <option value="approved">{language === 'ko' ? '승인' : 'Approved'}</option>
              <option value="rejected">{language === 'ko' ? '거절' : 'Rejected'}</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder={language === 'ko' ? '프로젝트명 또는 UID 검색' : 'Search project or UID'}
              value={filter.q}
              onChange={(e) => setFilter(({ q }) => ({ q: e.target.value }))}
              className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {claims.map((claim: any) => {
            const statusMap: Record<string, string> = { pending: 'ko' === language ? '대기' : 'Pending', approved: 'ko' === language ? '승인' : 'Approved', rejected: 'ko' === language ? '거절' : 'Rejected' };
            const status = statusMap[claim.status] || claim.status;
            return (
              <div key={claim.id} className="bg-white dark:bg-gray-800 rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{claim.projectSlug || 'Unknown project'}</span>
                  <span className="text-xs text-gray-500">{claim.claimantUid?.substring(0, 6) || 'unknown'} · {claim.createdAt ? new Date(claim.createdAt).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US') : 'unknown'}</span>
                </div>
                <div className="flex gap-2">
                  {claim.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateClaimStatus(claim.id, 'approved')}
                        className="px-3 py-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        {language === 'ko' ? '승인' : 'Approve'}
                      </button>
                      <button
                        onClick={() => updateClaimStatus(claim.id, 'rejected')}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        {language === 'ko' ? '거절' : 'Reject'}
                      </button>
                    </>
                  )}
                  {claim.status !== 'pending' && <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ko' ? '터미널' : 'Terminal'}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Projects Tab ---
  if (subPage === 'projects') {
    const [searchQ, setSearchQ] = useState<string>('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedOwner, setSelectedOwner] = useState<string>('');
    const [selectedVerification, setSelectedVerification] = useState<string>('');

    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? ADMIN_STRINGS[language].projects.title : ADMIN_STRINGS[language].projects.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? ADMIN_STRINGS[language].projects.subtitle : ADMIN_STRINGS[language].projects.subtitle}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder={language === 'ko' ? '이름, 슬러그, 메이커 검색' : 'Search name, slug, maker'}
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          />
          <select
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          >
            <option value="">플랫폼 전체</option>
            {Object.keys(PLATFORM_LABELS).map((platform) => (
              <option key={platform} value={platform}>
                {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          >
            <option value="">소유자 전체</option>
            {/* owners would come from data */}
          </select>
          <select
            onChange={(e) => setSelectedVerification(e.target.value)}
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          >
            <option value="">검증 상태 전체</option>
            <option value="verified">{language === 'ko' ? '검증 완료' : 'Verified'}</option>
            <option value="pending">{language === 'ko' ? '대기' : 'Pending'}</option>
            <option value="unverified">{language === 'ko' ? '미검증' : 'Unverified'}</option>
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {projects
            .filter(
              (p: any) =>
                (!searchQ || p.makerName?.toLowerCase().includes(searchQ.toLowerCase()) || p.slug?.toLowerCase().includes(searchQ.toLowerCase())) &&
                (!selectedPlatform || p.developmentPlatform === selectedPlatform) &&
                (!selectedVerification || p.verificationStatus === selectedVerification)
            )
            .map((p: any) => {
              const isCurated = p.isCuratedSeed === true;
              return (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                    {isCurated ? (
                      <Star className="text-yellow-500 text-xs" />
                    ) : (
                      <ShieldCheck className="text-indigo-600 text-xs" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{p.makerName || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.slug || 'N/A'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.verificationStatus} · {p.developmentPlatform || 'unknown'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => onOpenDetail?.(p)}
                      className="px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    >
                      {language === 'ko' ? '상세' : 'View'}
                    </button>
                    {role === 'main' && (
                      <button
                        onClick={() => window.confirm(`${language === 'ko' ? '이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' : 'Delete this project? This action cannot be undone.'}`)}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 rounded hover:bg-red-200 dark:hover:bg-red-800 ml-2"
                        disabled={isCurated}
                        title={isCurated ? '기본 카탈로그는 삭제할 수 없습니다' : 'Delete project'}
                      >
                        {language === 'ko' ? '삭제' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          {!projects.length && (
            <p>{language === 'ko' ? ADMIN_STRINGS[language].projects.empty : ADMIN_STRINGS[language].projects.empty}</p>
          )}
        </div>
      </div>
    );
  }

  // --- Points Tab ---
  if (subPage === 'points') {
    const [userPoints, setUserPoints] = useState({ total: 0, event: '', date: '' });
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState<string>('');

    // TODO: Implement pointsLog fetch from Firestore
    // For now, show placeholder
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? ADMIN_STRINGS[language]?.points?.title : ADMIN_STRINGS[language]?.points?.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? '포인트 적립 및 이력 관리 페이지입니다.' : 'Points earning and history management page.'}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder={language === 'ko' ? 'UID 검색' : 'Search UID'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          />
          <select
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          >
            <option value="">전체 사용자</option>
            <option value="top">{language === 'ko' ? '상위 사용자' : 'Top users'}</option>
            <option value="recent">{language === 'ko' ? '최근 적립' : 'Recent activity'}</option>
          </select>
        </div>

        <div className="mt-6">
          <p>{language === 'ko' ? '포인트 시스템은 추후 업데이트됩니다.' : 'Points system will be updated soon.'}</p>
        </div>
      </div>
    );
  }

  // --- Referrals Tab ---
  if (subPage === 'referrals') {
    const myCode = 'WV-AB3CD'; // TODO: fetch from user document
    const referrerCount = 5; // TODO: fetch from user document
    const totalReferralEarned = 150; // TODO: fetch from user document

    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? ADMIN_STRINGS[language]?.referrals?.title : ADMIN_STRINGS[language]?.referrals?.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? ADMIN_STRINGS[language]?.referrals?.subtitle : ADMIN_STRINGS[language]?.referrals?.subtitle}</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <div className="text-4xl font-bold">{myCode}</div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{language === 'ko' ? '내 추천 코드' : 'My referral code'}</p>
          <button
            onClick={() => navigator.clipboard?.writeText(myCode)}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 dark:hover:bg-indigo-500 text-sm"
            title="Copy code"
          >
            {language === 'ko' ? '복사' : 'Copy'}
          </button>
          <p className="mt-4 text-sm">
            {language === 'ko' ? '추천인: ' : 'Referrer: '}{referrerCount}명 · {language === 'ko' ? 'Earned' : 'Earned'}: {totalReferralEarned}포인트
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3>{language === 'ko' ? '추천 링크' : 'Referral Link'}</h3>
            <input
              type="text"
              value={`https://vibe.vercel.app?ref=${myCode}`}
              readOnly
              className="bg-gray-100 dark:bg-gray-700 border rounded px-3 py-2 copy-code text-sm w-full"
              
            />
            <button
              onClick={() => navigator.clipboard?.writeText(`https://vibe.vercel.app?ref=${myCode}`)}
              className="mt-2 px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-200"
              title="Copy link"
            >
              {language === 'ko' ? '복사' : 'Copy'}
            </button>
          </div>
          <div>
            <h3>{language === 'ko' ? '통계' : 'Statistics'}</h3>
            <div className="space-y-3">
              <p>{language === 'ko' ? '피추천인 수: ' : 'Referrals: '}{referrerCount}명</p>
              <p>{language === 'ko' ? '총 적립 포인트: ' : 'Total earned: '}{totalReferralEarned}포인트</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p>{language === 'ko' ? '추가 기능은 추후 업데이트됩니다.' : 'Additional features will be updated soon.'}</p>
        </div>
      </div>
    );
  }

  // --- Redemptions Tab ---
  if (subPage === 'redemptions') {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">{language === 'ko' ? (ADMIN_STRINGS[language].redemptions?.title || 'Redemption') : (ADMIN_STRINGS[language].redemptions?.title || 'Redemption')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{language === 'ko' ? (ADMIN_STRINGS[language].redemptions?.subtitle || '환급 신청 내역 및 관리') : 'Redemption requests and management'}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder={language === 'ko' ? 'UID 검색' : 'Search UID'}
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          />
          <select
            className="bg-white dark:bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 w-full"
          >
            <option value="">환급 유형</option>
            <option value="featured">{language === 'ko' ? '페처링' : 'Featured'}</option>
            <option value="boost">{language === 'ko' ? '부스트' : 'Boost'}</option>
            <option value="badge">{language === 'ko' ? '배지' : 'Badge'}</option>
          </select>
        </div>

        <div className="mt-6">
          <p>{language === 'ko' ? '환급 신청 내역 및 관리는 추후 업데이트됩니다.' : 'Redemption requests and management will be updated soon.'}</p>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}