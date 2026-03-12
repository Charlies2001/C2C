import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ProblemListItem } from '../../types/problem';
import { useStore } from '../../store/useStore';

const difficultyConfig: Record<string, { color: string; dot: string }> = {
  Easy: { color: 'text-emerald-400 bg-emerald-400/10', dot: 'bg-emerald-400' },
  Medium: { color: 'text-amber-400 bg-amber-400/10', dot: 'bg-amber-400' },
  Hard: { color: 'text-rose-400 bg-rose-400/10', dot: 'bg-rose-400' },
};

interface Props {
  problem: ProblemListItem;
  onDelete?: (id: number) => void;
}

export default function ProblemCard({ problem, onDelete }: Props) {
  const { t } = useTranslation();
  const config = difficultyConfig[problem.difficulty] || { color: 'text-gray-400', dot: 'bg-gray-400' };
  const collections = useStore((s) => s.collections);
  const isBookmarked = collections.some((c) => c.problemIds.includes(problem.id));
  const [confirming, setConfirming] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onDelete?.(problem.id);
    setConfirming(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  };

  return (
    <Link
      to={`/problem/${problem.id}`}
      className="block bg-gray-900/60 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4 hover:-translate-y-0.5 transition-all duration-300 group card-gradient-border card-glow relative"
    >
      {/* Delete button — top-right, visible on hover */}
      {onDelete && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {confirming ? (
            <>
              <button
                onClick={handleDelete}
                className="px-2 py-0.5 text-[11px] rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition-colors"
              >
                {t('problemList.deleteConfirm')}
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-0.5 text-[11px] rounded-md bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
              >
                {t('problemList.deleteCancel')}
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="p-1 rounded-md bg-white/5 text-gray-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title={t('problemList.delete')}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">#{problem.id}</span>
          {isBookmarked && (
            <svg className="w-3.5 h-3.5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${config.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {problem.difficulty}
        </span>
      </div>
      <h3 className="text-white font-medium group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-colors">
        {problem.title}
      </h3>
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-violet-400/50" />
        {problem.category}
      </div>
    </Link>
  );
}
