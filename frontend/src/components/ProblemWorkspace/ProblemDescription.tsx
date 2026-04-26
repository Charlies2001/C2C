import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import HintPanel from './HintPanel';
import NotePanel from './NotePanel';
import BookmarkButton from '../BookmarkButton';

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  Hard: 'text-rose-400 bg-rose-400/10',
};

export default function ProblemDescription() {
  const { t } = useTranslation();
  const problem = useStore((s) => s.currentProblem);

  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        {t('problem.loading')}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[problem.difficulty] || 'text-gray-400'}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-violet-400/50" />
              {problem.category}
            </span>
          </div>
          <BookmarkButton problemId={problem.id} />
        </div>
        <div className="prose prose-invert prose-sm max-w-none prose-violet
          prose-headings:text-white prose-headings:font-semibold
          prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-0
          prose-h3:text-base prose-h3:mb-2
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
          prose-pre:bg-gray-950/60 prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl prose-pre:shadow-lg
          prose-li:text-gray-300 prose-li:marker:text-violet-400
          prose-strong:text-white
        ">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>
        <NotePanel problemId={problem.id} />
        <HintPanel />
      </div>
    </div>
  );
}
