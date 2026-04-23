import { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { streamHint } from '../../api/ai';

const hintMarkdownComponents: Record<string, React.ComponentType<any>> = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      className="my-2 rounded-lg max-w-full h-auto border border-white/10"
      loading="lazy"
    />
  ),
};

const LEVEL_KEYS: Record<number, { nameKey: string; color: string }> = {
  1: { nameKey: 'hint.level1', color: 'from-blue-500 to-cyan-500' },
  2: { nameKey: 'hint.level2', color: 'from-violet-500 to-blue-500' },
  3: { nameKey: 'hint.level3', color: 'from-purple-500 to-violet-500' },
  4: { nameKey: 'hint.level4', color: 'from-rose-500 to-purple-500' },
};

export default function HintPanel() {
  const { t } = useTranslation();
  const {
    hints, showHintNudge, isHintLoading,
    dismissHintNudge, addHint, updateLastHint, setLastHintLevel, setIsHintLoading,
    currentProblem, code, output, hasAllLevels, clearHints, saveHints,
  } = useStore();

  const allLevelsCovered = hasAllLevels();

  const handleRequestHint = useCallback(() => {
    if (!currentProblem || isHintLoading || allLevelsCovered) return;

    dismissHintNudge();
    setIsHintLoading(true);
    addHint(0);

    const problemContext = {
      title: currentProblem.title,
      description: currentProblem.description,
      code,
      output,
      testResults: '',
    };

    const previousHints = hints
      .filter((h) => h.content)
      .map((h) => ({ level: h.level, content: h.content }));

    let accumulated = '';
    streamHint(
      problemContext,
      previousHints,
      (level) => {
        setLastHintLevel(level);
      },
      (chunk) => {
        accumulated += chunk;
        updateLastHint(accumulated);
      },
      () => {
        setIsHintLoading(false);
        saveHints();
      },
      (error) => {
        updateLastHint(`${t('hint.error')}: ${error}`);
        setIsHintLoading(false);
      }
    );
  }, [currentProblem, isHintLoading, allLevelsCovered, hints, code, output,
      dismissHintNudge, setIsHintLoading, addHint, updateLastHint, setLastHintLevel, saveHints, t]);

  return (
    <>
      {/* Hint cards - displayed below problem description */}
      {hints.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {t('hint.title')}
            </div>
            <button
              onClick={clearHints}
              disabled={isHintLoading}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50"
            >
              {t('hint.clearAll')}
            </button>
          </div>
          {hints.map((hint, index) => {
            const levelConfig = LEVEL_KEYS[hint.level];
            const levelName = levelConfig ? t(levelConfig.nameKey) : t('hint.analyzing');
            const levelColor = levelConfig?.color || 'from-gray-500 to-gray-400';
            return (
              <div
                key={index}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden"
              >
                <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-2">
                  {hint.level > 0 ? (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${levelColor} text-white`}
                    >
                      Lv.{hint.level}
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-600 text-gray-300">
                      ...
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{levelName}</span>
                </div>
                <div className="px-3 py-2 prose prose-invert prose-sm max-w-none
                  prose-p:text-gray-300 prose-p:text-sm prose-p:leading-relaxed prose-p:my-1
                  prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-950/60 prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-lg prose-pre:text-xs
                  prose-li:text-gray-300 prose-li:text-sm
                  prose-strong:text-white
                ">
                  {hint.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={hintMarkdownComponents}>{hint.content}</ReactMarkdown>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-1">
                      <span className="inline-block w-4 h-4 border-2 border-violet-500/50 border-t-violet-400 rounded-full animate-spin" />
                      {t('hint.generating')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nudge bar */}
      {showHintNudge && !allLevelsCovered && (
        <div className="border-t border-white/[0.06] px-4 py-2.5 bg-gradient-to-r from-violet-900/20 to-cyan-900/20 backdrop-blur-sm animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 text-lg">💡</span>
              <span className="text-sm text-gray-300">
                {t('hint.nudge')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRequestHint}
                disabled={isHintLoading}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition-all disabled:opacity-50"
              >
                {t('hint.getHint')}
              </button>
              <button
                onClick={dismissHintNudge}
                className="px-3 py-1 text-xs rounded-lg border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-all"
              >
                {t('hint.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
