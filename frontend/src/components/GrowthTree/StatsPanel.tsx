import { useTranslation } from 'react-i18next';
import type { SolvedRecord } from '../../types/problem';
import TreeSVG from './TreeSVG';
import { getTreeStageInfo, getDifficultyStats } from './treeUtils';

interface StatsPanelProps {
  records: SolvedRecord[];
}

export default function StatsPanel({ records }: StatsPanelProps) {
  const { t } = useTranslation();
  const info = getTreeStageInfo(records.length);
  const stats = getDifficultyStats(records);
  const progress = info.nextThreshold
    ? ((records.length - info.threshold) / (info.nextThreshold - info.threshold)) * 100
    : 100;
  const recent = [...records].sort((a, b) => b.solvedAt - a.solvedAt).slice(0, 5);

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl p-4 z-50 animate-slide-up">
      {/* Tree + stage */}
      <div className="flex flex-col items-center mb-4">
        <TreeSVG stage={info.stage} size="lg" />
        <span className="text-sm font-medium text-gray-200 mt-2">{info.label}</span>
        <span className="text-xs text-gray-500">
          {t('stats.solved', { count: records.length })}
          {info.nextThreshold && ` / ${t('stats.nextStage', { count: info.nextThreshold })}`}
        </span>
      </div>

      {/* Progress bar */}
      {info.nextThreshold && (
        <div className="mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Difficulty distribution */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">{t('stats.distribution')}</div>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-400">Easy {stats.Easy}</span>
          <span className="text-amber-400">Medium {stats.Medium}</span>
          <span className="text-rose-400">Hard {stats.Hard}</span>
        </div>
      </div>

      {/* Recent records */}
      {recent.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2">{t('stats.recent')}</div>
          <div className="space-y-1">
            {recent.map((r) => (
              <div key={r.problemId} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate mr-2">{r.title}</span>
                <span className={
                  r.difficulty === 'Easy' ? 'text-emerald-400' :
                  r.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                }>
                  {r.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
