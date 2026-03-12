import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { streamTeachingSection } from '../../api/ai';
import CodeBlock from './CodeBlock';
import GuidedCoding from './GuidedCoding';
import { getSectionTitlesForDifficulty, getSectionZhTitle } from '../../utils/sectionTitles';

// ─── Generating wait screen ───

const STAGE_MESSAGE_KEYS = [
  'blackboard.stage1',
  'blackboard.stage2',
  'blackboard.stage3',
  'blackboard.stage4',
  'blackboard.stage5',
];

const FUN_TIP_KEYS = [
  'blackboard.funTip1',
  'blackboard.funTip2',
  'blackboard.funTip3',
  'blackboard.funTip4',
  'blackboard.funTip5',
  'blackboard.funTip6',
  'blackboard.funTip7',
  'blackboard.funTip8',
  'blackboard.funTip9',
  'blackboard.funTip10',
  'blackboard.funTip11',
  'blackboard.funTip12',
];

function GeneratingWaitScreen({ title }: { title: string }) {
  const { t } = useTranslation();
  const [stageIdx, setStageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * FUN_TIP_KEYS.length));

  useEffect(() => {
    setStageIdx(0);
    setTipIdx(Math.floor(Math.random() * FUN_TIP_KEYS.length));
  }, [title]);

  // Progress through stages
  useEffect(() => {
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev < STAGE_MESSAGE_KEYS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Rotate tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % FUN_TIP_KEYS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Animated dots */}
      <div className="flex gap-1.5 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
            style={{
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Stage message */}
      <p className="text-gray-300 text-base mb-2 transition-opacity duration-500">
        {t(STAGE_MESSAGE_KEYS[stageIdx])}
      </p>
      <p className="text-gray-500 text-sm mb-8">
        {t('blackboard.preparingFor', { title })}
      </p>

      {/* Fun tip */}
      <div className="max-w-sm px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <p className="text-xs text-gray-500 mb-1">{t('blackboard.didYouKnow')}</p>
        <p className="text-sm text-gray-400 transition-opacity duration-500">{t(FUN_TIP_KEYS[tipIdx])}</p>
      </div>
    </div>
  );
}

// ─── Color palettes (cycled via modulo for any chapter count) ───

const SECTION_COLORS = [
  'from-pink-400 to-rose-400',
  'from-violet-400 to-purple-400',
  'from-blue-400 to-cyan-400',
  'from-emerald-400 to-teal-400',
  'from-amber-400 to-orange-400',
  'from-fuchsia-400 to-pink-400',
  'from-red-400 to-rose-400',
];

const SECTION_DOT_COLORS = [
  'bg-pink-400',
  'bg-violet-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-fuchsia-400',
  'bg-red-400',
];

/* Custom components so tables render with proper styling + CodeBlock for syntax highlighting */
const markdownComponents: Record<string, React.ComponentType<any>> = {
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <table className="w-full my-4 border-collapse rounded-lg overflow-hidden" {...props} />
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-pink-500/15" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-3 py-2 text-left text-sm font-semibold text-pink-200 border border-pink-500/20" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3 py-2 text-sm text-gray-300 border border-white/10" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="even:bg-white/[0.03]" {...props} />
  ),
  code: CodeBlock,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      className="my-4 rounded-xl max-w-full h-auto border border-white/10 shadow-lg"
      loading="lazy"
    />
  ),
};

const PROSE_CLASSES = `prose prose-invert prose-sm max-w-none
  prose-headings:text-pink-200 prose-headings:font-semibold
  prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-4
  prose-h3:text-base prose-h3:mb-2
  prose-p:text-gray-300 prose-p:leading-relaxed
  prose-code:text-pink-300 prose-code:bg-pink-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
  prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0 prose-pre:shadow-none
  prose-li:text-gray-300 prose-li:marker:text-pink-400
  prose-strong:text-pink-200`;

const remarkPlugins = [remarkGfm];

export default function Blackboard({ onGoToCoding }: { onGoToCoding: () => void }) {
  const { t } = useTranslation();
  const currentProblem = useStore((s) => s.currentProblem);
  const teachingSections = useStore((s) => s.teachingSections);
  const currentSection = useStore((s) => s.currentSection);
  const isTeachingLoading = useStore((s) => s.isTeachingLoading);
  const setCurrentSection = useStore((s) => s.setCurrentSection);
  const setIsTeachingLoading = useStore((s) => s.setIsTeachingLoading);
  const clearTeaching = useStore((s) => s.clearTeaching);
  const initTeachingSections = useStore((s) => s.initTeachingSections);

  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [generatingIndex, setGeneratingIndex] = useState(-1);
  const accRef = useRef('');
  const doneIndexRef = useRef(0);

  // Collapsible sections
  const [collapsedMap, setCollapsedMap] = useState<Record<number, boolean>>({});

  // Dynamic section titles based on difficulty
  const difficulty = currentProblem?.difficulty || 'Medium';

  const sectionTitles = useMemo(() => getSectionTitlesForDifficulty(difficulty), [difficulty]);

  const getContext = useCallback(() => {
    if (!currentProblem) return null;
    return {
      title: currentProblem.title,
      description: currentProblem.description,
      code: currentProblem.starter_code,
      output: '',
      testResults: '',
      difficulty: currentProblem.difficulty,
      starterCode: currentProblem.starter_code,
    };
  }, [currentProblem]);

  // Collect previous sections for context chaining
  // Send Chinese titles to backend
  const getPreviousSections = useCallback(
    (upToIndex: number) => {
      const result: { title: string; content: string }[] = [];
      for (let i = 0; i < upToIndex; i++) {
        const sec = teachingSections[i];
        if (sec && sec.content) {
          result.push({ title: getSectionZhTitle(sec.title), content: sec.content });
        }
      }
      return result;
    },
    [teachingSections]
  );

  const generateSection = useCallback(
    (index: number) => {
      const context = getContext();
      if (!context) return;

      const abort = new AbortController();
      abortRef.current = abort;

      accRef.current = '';
      setGeneratingIndex(index);
      setIsTeachingLoading(true);
      setCurrentSection(index);
      doneIndexRef.current = index;

      const previousSections = getPreviousSections(index);

      streamTeachingSection(
        context,
        index,
        (chunk) => {
          accRef.current += chunk;
        },
        () => {
          useStore.getState().updateSectionContent(doneIndexRef.current, accRef.current);
          setGeneratingIndex(-1);
          useStore.getState().setIsTeachingLoading(false);
          useStore.getState().saveTeaching();
        },
        (error) => {
          useStore.getState().updateSectionContent(index, accRef.current);
          console.error(`Teaching section ${index} error:`, error);
          setGeneratingIndex(-1);
          useStore.getState().setIsTeachingLoading(false);
        },
        abort.signal,
        previousSections
      );
    },
    [getContext, setIsTeachingLoading, setCurrentSection, getPreviousSections]
  );

  // Regenerate current section
  const handleRegenerate = useCallback(() => {
    if (generatingIndex !== -1) return;
    useStore.getState().updateSectionContent(currentSection, '');
    generateSection(currentSection);
  }, [currentSection, generatingIndex, generateSection]);

  // Initialize sections on mount (no auto-generation)
  useEffect(() => {
    if (!currentProblem) return;
    if (teachingSections.length > 0 && teachingSections.some((s) => s.content)) return;

    // Use English keys as internal section titles
    initTeachingSections(sectionTitles, difficulty);

    return () => {
      abortRef.current?.abort();
      clearTeaching();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem?.id]);

  // Scroll to top when section changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  const activeSection = teachingSections[currentSection];
  const isCurrentStreaming = generatingIndex === currentSection;

  const displayContent = activeSection?.content || '';

  const completedCount = teachingSections.filter((s) => s.content.length > 0).length;
  const totalSections = sectionTitles.length;

  // Toggle collapse
  const toggleCollapse = useCallback(
    (index: number) => {
      if (generatingIndex === index) return;
      setCollapsedMap((prev) => ({ ...prev, [index]: !prev[index] }));
    },
    [generatingIndex]
  );

  // Memoize markdown for completed sections
  const renderedMarkdown = useMemo(() => {
    if (isCurrentStreaming || !displayContent) return null;
    return (
      <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
        {displayContent}
      </ReactMarkdown>
    );
  }, [displayContent, isCurrentStreaming]);

  // Progress info
  const progressPercent = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;
  const isGenerating = generatingIndex !== -1;
  const generatingTitle = isGenerating
    ? t(`sectionTitles.${teachingSections[generatingIndex]?.title}`, { defaultValue: teachingSections[generatingIndex]?.title || '' })
    : '';

  // Get display title for a section key
  const getSectionDisplayTitle = (key: string) => t(`sectionTitles.${key}`, { defaultValue: key });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-pink-200/20 bg-gradient-to-r from-pink-500/10 to-violet-500/10">
        <h2 className="text-lg font-bold bg-gradient-to-r from-pink-300 to-violet-300 bg-clip-text text-transparent">
          {currentProblem?.title
            ? t('blackboard.titleWithName', { name: currentProblem.title })
            : t('blackboard.title')}
        </h2>
      </div>

      {/* Progress bar */}
      {teachingSections.length > 0 && (
        <div className="px-4 py-1.5 bg-gray-900/60 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">
              {isGenerating
                ? t('blackboard.generatingChapter', { current: generatingIndex + 1, total: totalSections, title: generatingTitle })
                : t('blackboard.chaptersComplete', { completed: completedCount, total: totalSections })}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chapter navigation */}
        <div className="w-48 shrink-0 border-r border-pink-200/10 bg-gray-900/40 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {teachingSections.map((sec, i) => {
              const hasContent = sec.content.length > 0;
              const isGeneratingThis = generatingIndex === i;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentSection(i)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-sm transition-all ${
                    currentSection === i
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      isGeneratingThis
                        ? SECTION_DOT_COLORS[i % SECTION_DOT_COLORS.length] + ' animate-pulse'
                        : hasContent
                          ? SECTION_DOT_COLORS[i % SECTION_DOT_COLORS.length] +
                            (currentSection === i ? '' : ' opacity-60')
                          : 'bg-gray-700'
                    }`}
                  />
                  <span className="truncate">{getSectionDisplayTitle(sec.title)}</span>
                </button>
              );
            })}
          </div>

          {teachingSections.length === 0 && isTeachingLoading && (
            <div className="text-center text-gray-500 text-sm mt-8">
              <div className="teaching-loading-dot mx-auto mb-3" />
              {t('blackboard.aiPreparing')}
            </div>
          )}

          {/* Section progress dots */}
          {teachingSections.length > 0 && (
            <div className="flex justify-center gap-1.5 mt-6 pt-4 border-t border-white/5">
              {teachingSections.map((sec, i) => {
                const hasContent = sec.content.length > 0;
                const isGeneratingThis = generatingIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentSection(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isGeneratingThis
                        ? SECTION_DOT_COLORS[i % SECTION_DOT_COLORS.length] +
                          ' animate-pulse scale-125'
                        : currentSection === i
                          ? SECTION_DOT_COLORS[i % SECTION_DOT_COLORS.length] + ' scale-125'
                          : hasContent
                            ? SECTION_DOT_COLORS[i % SECTION_DOT_COLORS.length] + ' opacity-40'
                            : 'bg-gray-600'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
            {activeSection ? (
              <div>
                {/* Clickable title for collapse + Regenerate button */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => toggleCollapse(currentSection)}
                    className="flex items-center gap-2 group/title"
                    disabled={isCurrentStreaming}
                  >
                    <span
                      className={`text-xs text-gray-500 transition-transform ${
                        collapsedMap[currentSection] ? '' : 'rotate-90'
                      }`}
                    >
                      ▶
                    </span>
                    <h3
                      className={`text-xl font-bold bg-gradient-to-r ${SECTION_COLORS[currentSection % SECTION_COLORS.length]} bg-clip-text text-transparent`}
                    >
                      {getSectionDisplayTitle(activeSection.title)}
                    </h3>
                  </button>

                  {/* Regenerate */}
                  {activeSection.content && generatingIndex === -1 && (
                    <button
                      onClick={handleRegenerate}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white/5 text-gray-400
                        hover:bg-white/10 hover:text-gray-200 transition-all flex items-center gap-1"
                      title={t('blackboard.regenerateTitle')}
                    >
                      {t('blackboard.regenerate')}
                    </button>
                  )}
                </div>

                {/* Collapsible content */}
                {!collapsedMap[currentSection] && (
                  <div className="teaching-blackboard rounded-2xl p-6 shadow-xl border border-white/[0.06]">
                    {activeSection.title === 'practice' ? (
                      <GuidedCoding content={displayContent} isStreaming={isCurrentStreaming} />
                    ) : isCurrentStreaming ? (
                      <GeneratingWaitScreen title={getSectionDisplayTitle(activeSection.title)} />
                    ) : displayContent ? (
                      <div className={PROSE_CLASSES}>
                        {renderedMarkdown}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-gray-500 mb-4">{t('blackboard.noContent')}</p>
                        <button
                          onClick={() => generateSection(currentSection)}
                          disabled={generatingIndex !== -1}
                          className="px-6 py-3 text-sm rounded-xl bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-200 hover:from-pink-500/30 hover:to-violet-500/30 border border-pink-400/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <span>▶</span> {t('blackboard.startGenerate')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {collapsedMap[currentSection] && (
                  <div className="text-gray-500 text-sm italic px-2">{t('blackboard.collapsed')}</div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                {isTeachingLoading ? (
                  <div className="text-center">
                    <div className="teaching-loading-dot mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">{t('blackboard.aiTeacherPreparing')}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {t('blackboard.aiTeacherHint')}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center">
                    <p className="text-lg">{t('blackboard.noTeaching')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="px-6 py-3 border-t border-pink-200/10 bg-gray-900/40 flex items-center justify-between">
            <div className="flex gap-2">
              {currentSection > 0 && (
                <button
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="px-4 py-2 text-sm rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  {t('blackboard.prevChapter')}
                </button>
              )}
              {currentSection < totalSections - 1 && (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-200 hover:from-pink-500/30 hover:to-violet-500/30 transition-all"
                >
                  {t('blackboard.nextChapter')}
                </button>
              )}
            </div>

            <button
              onClick={onGoToCoding}
              className="px-5 py-2 text-sm rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-medium shadow-lg shadow-pink-500/20 transition-all"
            >
              {t('blackboard.goToCoding')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
