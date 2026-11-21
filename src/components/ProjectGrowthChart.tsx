import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Star } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AppLanguage, CatalogProject } from '../types/vibeatlas';
import { UI_STRINGS } from '../data/i18n';
import { formatCompactCount } from '../lib/catalogEngine';
import {
  buildHistoricalGrowthSeries,
  recordStarSnapshot,
  type StarGrowthPoint,
} from '../lib/starHistory';

interface ProjectGrowthChartProps {
  project: CatalogProject;
  language: AppLanguage;
  isSyncing: boolean;
  onSyncSingleGithub: (project: CatalogProject) => void;
}

type ChartSeriesTab = 'stars' | 'internal';

interface CustomTooltipPayloadItem {
  dataKey?: string;
  value?: number;
  payload?: StarGrowthPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<CustomTooltipPayloadItem>;
  mode: ChartSeriesTab;
  starsLabel: string;
  likesLabel: string;
  bookmarksLabel: string;
}

function ChartTooltip({
  active,
  payload,
  mode,
  starsLabel,
  likesLabel,
  bookmarksLabel,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="font-mono font-semibold text-slate-900 dark:text-white">{point.date}</p>
      {mode === 'stars' ? (
        <p className="mt-1 font-mono tabular-nums text-amber-700 dark:text-amber-400">
          {starsLabel}: ★ {point.githubStars.toLocaleString()}
          {point.githubStarsDelta > 0 ? ` (+${point.githubStarsDelta.toLocaleString()})` : ''}
        </p>
      ) : (
        <div className="mt-1 space-y-0.5 font-mono tabular-nums">
          <p className="text-blue-700 dark:text-blue-400">
            {bookmarksLabel}: {point.internalBookmarks.toLocaleString()}
          </p>
          <p className="text-rose-700 dark:text-rose-400">
            {likesLabel}: {point.internalLikes.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export function ProjectGrowthChart({
  project,
  language,
  isSyncing,
  onSyncSingleGithub,
}: ProjectGrowthChartProps) {
  const [chartTab, setChartTab] = useState<ChartSeriesTab>('stars');
  const copy = UI_STRINGS[language].detail;
  const cardCopy = UI_STRINGS[language].card;

  useEffect(() => {
    if (project.githubRepo && project.lastSyncedAt && project.githubStars > 0) {
      recordStarSnapshot(project.githubRepo, project.lastSyncedAt, project.githubStars);
    }
  }, [project.githubRepo, project.lastSyncedAt, project.githubStars]);

  const series = useMemo(() => buildHistoricalGrowthSeries(project), [project]);

  const isUnsyncedGithub = Boolean(
    project.githubRepo && !project.lastSyncedAt && project.githubStars === 0
  );
  const allStarsZero = series.points.every((pt) => pt.githubStars === 0);

  return (
    <section
      aria-labelledby="detail-growth-chart-heading"
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="detail-growth-chart-heading"
            className="text-sm font-bold text-slate-900 dark:text-white"
          >
            {copy.historyChartTitle}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {copy.historyChartSubtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={copy.historyChartTitle}
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950"
        >
          <button
            type="button"
            role="tab"
            aria-selected={chartTab === 'stars'}
            onClick={() => setChartTab('stars')}
            className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              chartTab === 'stars'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {copy.chartTabStars}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={chartTab === 'internal'}
            onClick={() => setChartTab('internal')}
            className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              chartTab === 'internal'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {copy.chartTabInternal}
          </button>
        </div>
      </div>

      {/* Contextual Star Snapshot Summary or Sync CTA */}
      {chartTab === 'stars' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/60">
          {isUnsyncedGithub ? (
            <>
              <span className="text-slate-600 dark:text-slate-300">
                {copy.chartUnsyncedStarsHint}
              </span>
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => onSyncSingleGithub(project)}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? copy.syncing : copy.syncGithubNow}</span>
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Star className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                <span>{copy.chartLiveTotalLabel}:</span>
                <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                  {project.githubStars.toLocaleString()}
                </strong>
              </span>
              {series.totalDelta14d > 0 ? (
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                  {copy.chartDeltaLabel}: +{series.totalDelta14d.toLocaleString()}
                </span>
              ) : series.isBaselineSnapshot ? (
                <span className="text-slate-500 dark:text-slate-400">{copy.chartBaselineNote}</span>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* Recharts Container */}
      <div className="mt-4 h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height={224}>
          {chartTab === 'stars' ? (
            <AreaChart
              data={series.points}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="vibeatlasStarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(148, 163, 184, 0.25)"
              />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                minTickGap={18}
              />
              <YAxis
                width={48}
                domain={allStarsZero ? [0, 100] : [0, 'auto']}
                tickFormatter={formatCompactCount}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    mode="stars"
                    starsLabel={cardCopy.githubStars}
                    likesLabel={cardCopy.internalLikes}
                    bookmarksLabel={cardCopy.internalBookmarks}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="githubStars"
                name={cardCopy.githubStars}
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray={series.isBaselineSnapshot ? '5 4' : undefined}
                fill="url(#vibeatlasStarGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <AreaChart
              data={series.points}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="vibeatlasBmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="vibeatlasLikeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(148, 163, 184, 0.25)"
              />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                minTickGap={18}
              />
              <YAxis
                width={48}
                tickFormatter={formatCompactCount}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    mode="internal"
                    starsLabel={cardCopy.githubStars}
                    likesLabel={cardCopy.internalLikes}
                    bookmarksLabel={cardCopy.internalBookmarks}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="internalBookmarks"
                name={cardCopy.internalBookmarks}
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#vibeatlasBmGrad)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="internalLikes"
                name={cardCopy.internalLikes}
                stroke="#e11d48"
                strokeWidth={2}
                fill="url(#vibeatlasLikeGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span>{series.points[0]?.date}</span>
        {chartTab === 'stars' ? (
          <span className="inline-flex items-center gap-1.5 font-sans">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-600" aria-hidden="true" />
            <span>{cardCopy.githubStars}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-3 font-sans">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
              <span>{cardCopy.internalBookmarks}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-600" aria-hidden="true" />
              <span>{cardCopy.internalLikes}</span>
            </span>
          </span>
        )}
        <span>{series.points[series.points.length - 1]?.date}</span>
      </div>
    </section>
  );
}
