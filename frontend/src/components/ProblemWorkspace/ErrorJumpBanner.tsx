import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { getSectionTitlesForDifficulty } from '../../utils/sectionTitles';

interface ErrorJumpBannerProps {
  onGoToTeaching: () => void;
}

export default function ErrorJumpBanner({ onGoToTeaching }: ErrorJumpBannerProps) {
  const { t } = useTranslation();
  const errorJumpTarget = useStore((s) => s.errorJumpTarget);
  const dismissErrorJump = useStore((s) => s.dismissErrorJump);
  const setCurrentSection = useStore((s) => s.setCurrentSection);
  const teachingSections = useStore((s) => s.teachingSections);
  const difficulty = useStore((s) => s.currentProblem?.difficulty || 'Medium');

  const sectionTitles = useMemo(() => getSectionTitlesForDifficulty(difficulty), [difficulty]);

  // 15-second auto-dismiss
  useEffect(() => {
    if (!errorJumpTarget) return;
    const timer = setTimeout(dismissErrorJump, 15000);
    return () => clearTimeout(timer);
  }, [errorJumpTarget, dismissErrorJump]);

  if (!errorJumpTarget) return null;

  const { sectionIndex, errorType } = errorJumpTarget;
  const sectionKey = sectionTitles[sectionIndex];
  if (!sectionKey) return null;

  const sectionTitle = t(`sectionTitles.${sectionKey}`);

  // Only show if the teaching section has been generated (has content)
  const hasContent = teachingSections[sectionIndex]?.content;

  const handleJump = () => {
    setCurrentSection(sectionIndex);
    onGoToTeaching();
    dismissErrorJump();
  };

  return (
    <div className="border-t border-white/[0.06] px-4 py-2.5 bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">&#9889;</span>
          <span className="text-sm text-gray-300">
            {t('errorJump.encountered')} <span className="text-amber-300 font-medium">{errorType || t('errorJump.error')}</span>?
            {hasContent
              ? ` ${t('errorJump.reviewSection', { section: sectionTitle })}`
              : ` ${t('errorJump.learnSection', { section: sectionTitle })}`
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleJump}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white transition-all"
          >
            {t('errorJump.goCheck')} &rarr;
          </button>
          <button
            onClick={dismissErrorJump}
            className="px-2 py-1 text-xs rounded-lg text-gray-400 hover:text-gray-200 transition-all"
          >
            &#10005;
          </button>
        </div>
      </div>
    </div>
  );
}
