import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';

interface Props {
  problemId: number;
}

function formatRelativeTime(iso: string, lang: string): string {
  try {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return '';
    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) {
      return lang.startsWith('zh') ? '刚刚' : lang.startsWith('ja') ? 'たった今' : lang.startsWith('ko') ? '방금' : 'just now';
    }
    const min = Math.floor(sec / 60);
    if (min < 60) {
      return lang.startsWith('zh') ? `${min} 分钟前`
        : lang.startsWith('ja') ? `${min} 分前`
        : lang.startsWith('ko') ? `${min}분 전`
        : `${min}m ago`;
    }
    const hr = Math.floor(min / 60);
    if (hr < 24) {
      return lang.startsWith('zh') ? `${hr} 小时前`
        : lang.startsWith('ja') ? `${hr} 時間前`
        : lang.startsWith('ko') ? `${hr}시간 전`
        : `${hr}h ago`;
    }
    const day = Math.floor(hr / 24);
    if (day < 30) {
      return lang.startsWith('zh') ? `${day} 天前`
        : lang.startsWith('ja') ? `${day} 日前`
        : lang.startsWith('ko') ? `${day}일 전`
        : `${day}d ago`;
    }
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function SubmissionsPanel({ problemId }: Props) {
  const { t, i18n } = useTranslation();
  const submissions = useStore((s) => s.submissionsByProblem[problemId] || []);
  const isLoading = useStore((s) => s.isSubmissionsLoading);
  const [collapsed, setCollapsed] = useState(false);

  const stats = useMemo(() => {
    const allPassed = submissions.filter((s) => s.all_passed).length;
    return { total: submissions.length, allPassed };
  }, [submissions]);

  if (submissions.length === 0 && !isLoading) return null;

  return (
    <div className="border-t border-white/[0.06] px-4 py-3">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium group-hover:text-gray-300 transition-colors">
          {t('submissions.title')}{' '}
          <span className="text-gray-600 normal-case tracking-normal">
            ({stats.allPassed}/{stats.total} {t('submissions.acceptedShort')})
          </span>
        </span>
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
          {collapsed ? '▼' : '▲'}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-1.5 max-h-72 overflow-auto">
          {submissions.length === 0 && isLoading && (
            <div className="text-xs text-gray-500 px-2 py-1">{t('submissions.loading')}</div>
          )}
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${
                s.all_passed
                  ? 'border-emerald-600/30 bg-emerald-900/10'
                  : 'border-rose-600/20 bg-rose-900/10'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {s.all_passed ? (
                  <span
                    className="text-emerald-400 text-sm shrink-0"
                    title={t('submissions.accepted')}
                    aria-label={t('submissions.accepted')}
                  >
                    ✓
                  </span>
                ) : (
                  <span
                    className="text-rose-400 text-xs shrink-0 font-mono"
                    title={t('submissions.partial')}
                  >
                    {s.passed_count}/{s.total_count}
                  </span>
                )}
                <span className={`text-xs truncate ${s.all_passed ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {s.all_passed ? t('submissions.accepted') : t('submissions.failedRow', { passed: s.passed_count, total: s.total_count })}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                {formatRelativeTime(s.submitted_at, i18n.language)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
