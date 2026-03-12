import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from '../types/problem';
import { useStore } from '../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
  initialProfile?: UserProfile | null;
}

// Internal values stay as Chinese strings (stored + sent to AI)
// Display labels come from i18n
const DIMENSIONS = [
  {
    key: 'experience' as const,
    labelKey: 'profile.experience',
    options: [
      { value: '零基础' as const, labelKey: 'profile.exp.beginner' },
      { value: '初学者' as const, labelKey: 'profile.exp.elementary' },
      { value: '有一定经验' as const, labelKey: 'profile.exp.intermediate' },
      { value: '熟练开发者' as const, labelKey: 'profile.exp.advanced' },
    ],
  },
  {
    key: 'goal' as const,
    labelKey: 'profile.goal',
    options: [
      { value: '面试刷题' as const, labelKey: 'profile.goals.interview' },
      { value: '课程作业' as const, labelKey: 'profile.goals.homework' },
      { value: '兴趣爱好' as const, labelKey: 'profile.goals.hobby' },
      { value: '技能提升' as const, labelKey: 'profile.goals.skill' },
    ],
  },
  {
    key: 'style' as const,
    labelKey: 'profile.style',
    options: [
      { value: '手把手教学' as const, labelKey: 'profile.styles.handhold' },
      { value: '先理论后实践' as const, labelKey: 'profile.styles.theoryFirst' },
      { value: '直接上手试错' as const, labelKey: 'profile.styles.trialError' },
      { value: '看示例学习' as const, labelKey: 'profile.styles.example' },
    ],
  },
  {
    key: 'tone' as const,
    labelKey: 'profile.tone',
    options: [
      { value: '严谨专业' as const, labelKey: 'profile.tones.professional' },
      { value: '轻松有趣' as const, labelKey: 'profile.tones.casual' },
      { value: '温和鼓励' as const, labelKey: 'profile.tones.encouraging' },
    ],
  },
] as const;

export default function ProfileSetupModal({ open, onClose, initialProfile }: Props) {
  const { t } = useTranslation();
  const [selections, setSelections] = useState<Partial<UserProfile>>({});
  const saveProfile = useStore((s) => s.saveProfile);

  useEffect(() => {
    if (open) {
      setSelections(initialProfile ? { ...initialProfile } : {});
    }
  }, [open, initialProfile]);

  if (!open) return null;

  const allSelected =
    selections.experience && selections.goal && selections.style && selections.tone;

  const handleSave = () => {
    if (!allSelected) return;
    saveProfile(selections as UserProfile);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-gray-950 border border-white/[0.08] rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-1">{t('profile.title')}</h2>
        <p className="text-sm text-gray-400 mb-5">
          {t('profile.subtitle')}
        </p>

        <div className="space-y-5">
          {DIMENSIONS.map((dim) => (
            <div key={dim.key}>
              <div className="text-sm font-medium text-gray-300 mb-2">{t(dim.labelKey)}</div>
              <div className="flex flex-wrap gap-2">
                {dim.options.map((opt) => {
                  const selected = selections[dim.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setSelections((prev) => ({ ...prev, [dim.key]: opt.value }))
                      }
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        selected
                          ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border-violet-500/30 text-violet-300'
                          : 'bg-gray-950/60 border-white/[0.06] text-gray-400 hover:border-white/[0.12] hover:text-gray-300'
                      }`}
                    >
                      {t(opt.labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {initialProfile && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              {t('profile.cancel')}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!allSelected}
            className={`px-5 py-1.5 text-sm rounded-xl transition-all ${
              allSelected
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('profile.save')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
