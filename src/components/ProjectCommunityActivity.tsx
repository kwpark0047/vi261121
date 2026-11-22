import { Bookmark, Flag, Heart, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { AppLanguage, ProjectActivityRecord } from '../types/vibeatlas';
import { UI_STRINGS } from '../data/i18n';

const KIND_ICON: Record<ProjectActivityRecord['kind'], typeof Heart> = {
  like: Heart,
  bookmark: Bookmark,
  report: Flag,
  claim: ShieldCheck,
};

type StatusKey =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'open'
  | 'reviewed'
  | 'resolved';

const STATUS_ORDER: Record<string, StatusKey> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  open: 'open',
  reviewed: 'reviewed',
  resolved: 'resolved',
};

function formatStamp(iso: string): string {
  if (!iso) return '—';
  return iso.length >= 16 ? iso.slice(0, 16).replace('T', ' ') : iso;
}

interface ProjectCommunityActivityProps {
  language: AppLanguage;
  activities: readonly ProjectActivityRecord[];
  loading: boolean;
  error?: string | null;
}

export function ProjectCommunityActivity({
  language,
  activities,
  loading,
  error = null,
}: ProjectCommunityActivityProps) {
  const copy = UI_STRINGS[language].projectActivity;

  if (loading && activities.length === 0) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">{copy.loading}</p>
    );
  }

  if (error) {
    return (
      <p
        role="status"
        className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400"
      >
        <TriangleAlert className="h-3.5 w-3.5" />
        <span>{copy.error}</span>
      </p>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">{copy.empty}</p>
    );
  }

  return (
    <ul className="space-y-2">
      {activities.map((activity) => {
        const Icon = KIND_ICON[activity.kind] ?? Heart;
        const statusKey = activity.status ? STATUS_ORDER[activity.status] : undefined;
        return (
          <li
            key={activity.id}
            className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">
              {activity.actorLabel ?? copy.unknown}
            </span>
            <span className="text-slate-500 dark:text-slate-400">{copy[activity.kind]}</span>
            {activity.note && (
              <span
                className="min-w-0 flex-1 truncate text-slate-500 dark:text-slate-400"
                title={activity.note}
              >
                · {activity.note}
              </span>
            )}
            {statusKey && (
              <span className="text-slate-500 dark:text-slate-400">
                · {copy[statusKey]}
                {activity.method ? ` · ${activity.method}` : ''}
              </span>
            )}
            <span className="ml-auto font-mono tabular-nums text-slate-400 dark:text-slate-500">
              {formatStamp(activity.createdAtIso)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
