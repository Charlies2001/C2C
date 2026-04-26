import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateProblem, createProblem } from '../api/problems';
import type { TestCase } from '../types/problem';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type Stage = 'input' | 'preview';

interface ProblemDraft {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  starter_code: string;
  helper_code: string;
  test_cases: TestCase[];
}

// Default starter follows LeetCode "class Solution" style — no imports.
const STARTER_TEMPLATE = `class Solution(object):
    def methodName(self, arg1, arg2):
        """
        :type arg1: List[int]
        :type arg2: int
        :rtype: int
        """
        pass
`;

const EMPTY_DRAFT: ProblemDraft = {
  title: '',
  slug: '',
  difficulty: 'Easy',
  category: '',
  description: '',
  starter_code: STARTER_TEMPLATE,
  helper_code: '',
  test_cases: [{ input: '', expected: '' }],
};

export default function CreateProblemModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>('input');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<ProblemDraft>({ ...EMPTY_DRAFT });

  if (!open) return null;

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await generateProblem(description.trim());
      if (res.success && res.problem) {
        setDraft(res.problem as ProblemDraft);
        setStage('preview');
      } else {
        setError(res.error || t('createProblem.generateFailed'));
      }
    } catch {
      setError(t('createProblem.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.slug.trim()) {
      setError(t('createProblem.titleSlugRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createProblem(draft);
      onCreated();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('createProblem.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStage('input');
    setDescription('');
    setDraft({ ...EMPTY_DRAFT });
    setError('');
    setLoading(false);
    setSaving(false);
    onClose();
  };

  const updateDraft = (field: keyof ProblemDraft, value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    setDraft((d) => {
      const tc = [...d.test_cases];
      tc[index] = { ...tc[index], [field]: value };
      return { ...d, test_cases: tc };
    });
  };

  const addTestCase = () => {
    setDraft((d) => ({ ...d, test_cases: [...d.test_cases, { input: '', expected: '' }] }));
  };

  const removeTestCase = (index: number) => {
    if (draft.test_cases.length <= 1) return;
    setDraft((d) => ({ ...d, test_cases: d.test_cases.filter((_, i) => i !== index) }));
  };

  const inputClasses =
    'w-full px-3 py-2 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors';
  const labelClasses = 'block text-sm text-gray-300 mb-1';
  const textareaClasses = `${inputClasses} resize-y font-mono`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {stage === 'input' ? t('createProblem.uploadTitle') : t('createProblem.previewTitle')}
        </h2>

        {/* Input stage */}
        {stage === 'input' && (
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>{t('createProblem.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('createProblem.placeholder')}
                rows={4}
                className={textareaClasses}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('createProblem.aiHint')}
              </p>
            </div>

            {error && <div className="text-xs text-rose-400">{error}</div>}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                {t('createProblem.cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t('createProblem.generating')}
                  </>
                ) : (
                  t('createProblem.generate')
                )}
              </button>
            </div>
          </div>
        )}

        {/* Preview stage */}
        {stage === 'preview' && (
          <div className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>{t('createProblem.title')}</label>
                <input
                  value={draft.title}
                  onChange={(e) => updateDraft('title', e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>{t('createProblem.slug')}</label>
                <input
                  value={draft.slug}
                  onChange={(e) => updateDraft('slug', e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Difficulty & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>{t('createProblem.difficulty')}</label>
                <select
                  value={draft.difficulty}
                  onChange={(e) => updateDraft('difficulty', e.target.value)}
                  className={inputClasses}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>{t('createProblem.category')}</label>
                <input
                  value={draft.category}
                  onChange={(e) => updateDraft('category', e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClasses}>{t('createProblem.descMd')}</label>
              <textarea
                value={draft.description}
                onChange={(e) => updateDraft('description', e.target.value)}
                rows={6}
                className={textareaClasses}
              />
            </div>

            {/* Starter Code */}
            <div>
              <label className={labelClasses}>{t('createProblem.starterCode')}</label>
              <textarea
                value={draft.starter_code}
                onChange={(e) => updateDraft('starter_code', e.target.value)}
                rows={3}
                className={textareaClasses}
              />
            </div>

            {/* Helper Code */}
            <div>
              <label className={labelClasses}>{t('createProblem.helperCode')}</label>
              <textarea
                value={draft.helper_code}
                onChange={(e) => updateDraft('helper_code', e.target.value)}
                rows={3}
                className={textareaClasses}
              />
            </div>

            {/* Test Cases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">{t('createProblem.testCases')}</label>
                <button
                  onClick={addTestCase}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {t('createProblem.addTestCase')}
                </button>
              </div>
              <div className="space-y-3">
                {draft.test_cases.map((tc, i) => (
                  <div key={i} className="p-3 bg-gray-950/40 rounded-xl border border-white/[0.04] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t('createProblem.testCase', { num: i + 1 })}</span>
                      {draft.test_cases.length > 1 && (
                        <button
                          onClick={() => removeTestCase(i)}
                          className="text-xs text-rose-400/70 hover:text-rose-400 transition-colors"
                        >
                          {t('createProblem.deleteCase')}
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">{t('createProblem.inputLabel')}</label>
                      <textarea
                        value={tc.input}
                        onChange={(e) => updateTestCase(i, 'input', e.target.value)}
                        rows={2}
                        className={`${textareaClasses} text-xs`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">{t('createProblem.expectedLabel')}</label>
                      <input
                        value={tc.expected}
                        onChange={(e) => updateTestCase(i, 'expected', e.target.value)}
                        className={`${inputClasses} text-xs`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-xs text-rose-400">{error}</div>}

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setStage('input');
                  setError('');
                }}
                className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                {t('createProblem.backToEdit')}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {t('createProblem.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                >
                  {saving ? t('createProblem.saving') : t('createProblem.saveProblem')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
