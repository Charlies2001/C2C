import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store/useStore';
import { runPythonCode } from '../../services/pyodide';
import type { TestResult } from '../../types/problem';
import ErrorJumpBanner from './ErrorJumpBanner';
import { getSectionTitlesForDifficulty, findRelevantSectionIndex, extractErrorType } from '../../utils/sectionTitles';

export default function OutputPanel({ onGoToTeaching }: { onGoToTeaching: () => void }) {
  const { t } = useTranslation();
  const {
    code, output, setOutput, isRunning, setIsRunning,
    currentProblem, testResults, setTestResults, pyodideReady,
    isChatOpen, toggleChat,
    incrementFailures, resetFailures, triggerHintNudge,
    setErrorJumpTarget, markProblemSolved,
    setIsChatOpen, setPendingChatPrompt, isAILoading,
    recordSubmission,
  } = useStore(
    useShallow((s) => ({
      code: s.code,
      output: s.output,
      setOutput: s.setOutput,
      isRunning: s.isRunning,
      setIsRunning: s.setIsRunning,
      currentProblem: s.currentProblem,
      testResults: s.testResults,
      setTestResults: s.setTestResults,
      pyodideReady: s.pyodideReady,
      isChatOpen: s.isChatOpen,
      toggleChat: s.toggleChat,
      incrementFailures: s.incrementFailures,
      resetFailures: s.resetFailures,
      triggerHintNudge: s.triggerHintNudge,
      setErrorJumpTarget: s.setErrorJumpTarget,
      markProblemSolved: s.markProblemSolved,
      setIsChatOpen: s.setIsChatOpen,
      setPendingChatPrompt: s.setPendingChatPrompt,
      isAILoading: s.isAILoading,
      recordSubmission: s.recordSubmission,
    }))
  );

  const [showPassed, setShowPassed] = useState(false);
  const [expandedPassed, setExpandedPassed] = useState<Set<number>>(new Set());

  const togglePassedDetail = (idx: number) => {
    setExpandedPassed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const disputeTestCase = (r: TestResult) => {
    if (isAILoading) return;
    const prompt = t('output.disputePrompt', {
      num: r.index + 1,
      input: r.input,
      expected: r.expected,
      actual: r.actual,
    });
    setIsChatOpen(true);
    setPendingChatPrompt(prompt);
  };

  const difficulty = currentProblem?.difficulty || 'Medium';
  const sectionTitles = useMemo(() => getSectionTitlesForDifficulty(difficulty), [difficulty]);

  const passedResults = useMemo(() => testResults.filter((r) => r.passed), [testResults]);
  const failedResults = useMemo(() => testResults.filter((r) => !r.passed), [testResults]);

  const handleRun = async () => {
    if (!pyodideReady || isRunning) return;
    setIsRunning(true);
    setOutput('');
    const result = await runPythonCode(code, currentProblem?.helper_code || '');
    if (result.error) {
      setOutput(result.error);
      triggerHintNudge();
      const sectionIdx = findRelevantSectionIndex(result.error, sectionTitles);
      if (sectionIdx !== -1) {
        setErrorJumpTarget({ sectionIndex: sectionIdx, errorType: extractErrorType(result.error) || t('output.runError') });
      }
    } else {
      setOutput(result.stdout || t('output.noOutput'));
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!pyodideReady || isRunning || !currentProblem) return;
    setIsRunning(true);
    setOutput('');
    setShowPassed(false);
    const results: TestResult[] = [];

    for (let i = 0; i < currentProblem.test_cases.length; i++) {
      const tc = currentProblem.test_cases[i];
      const fullCode = `${code}\n${tc.input}`;
      const result = await runPythonCode(fullCode, currentProblem.helper_code || '');
      const actual = result.error || result.stdout;
      results.push({
        index: i,
        passed: actual.trim() === tc.expected.trim(),
        input: tc.input,
        expected: tc.expected,
        actual: actual.trim(),
      });
    }

    setTestResults(results);
    const passed = results.filter((r) => r.passed).length;
    setOutput(t('output.testResult', { passed, total: results.length }));
    // Persist this submission to the server (per-problem history).
    // Fire-and-forget — failure is silently swallowed in the store action.
    void recordSubmission(currentProblem.id, passed, results.length);
    if (passed === results.length) {
      resetFailures();
      if (currentProblem) {
        markProblemSolved(currentProblem.id, currentProblem.title, currentProblem.difficulty);
      }
    } else {
      incrementFailures();
      const firstError = results.find((r) => !r.passed);
      if (firstError) {
        const errorText = firstError.actual;
        const sectionIdx = findRelevantSectionIndex(errorText, sectionTitles);
        if (sectionIdx !== -1) {
          setErrorJumpTarget({ sectionIndex: sectionIdx, errorType: extractErrorType(errorText) || t('output.testNotPassed') });
        } else {
          const implIdx = sectionTitles.indexOf('implementation');
          if (implIdx !== -1) {
            setErrorJumpTarget({ sectionIndex: implIdx, errorType: t('output.testNotPassed') });
          }
        }
      }
    }
    setIsRunning(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-gray-900/40">
        <button
          data-run-btn
          onClick={handleRun}
          disabled={!pyodideReady || isRunning}
          className="px-3 py-1 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? t('output.running') : t('output.run')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!pyodideReady || isRunning}
          className="px-3 py-1 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t('output.submit')}
        </button>
        {!pyodideReady && (
          <span className="text-xs text-yellow-400 ml-2">{t('output.pyLoading')}</span>
        )}
        <button
          onClick={onGoToTeaching}
          className="ml-auto px-3 py-1 text-sm rounded-lg bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 text-pink-300 hover:from-pink-500/30 hover:to-violet-500/30 transition-all"
        >
          {t('output.teachingMode')}
        </button>
        <button
          onClick={toggleChat}
          className={`px-3 py-1 text-sm rounded-lg transition-all ${
            isChatOpen
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:from-violet-500 hover:to-cyan-500'
              : 'bg-transparent border border-violet-500/50 text-violet-400 hover:bg-violet-500/10'
          }`}
        >
          {isChatOpen ? t('output.aiClose') : t('output.aiOpen')}
        </button>
      </div>

      <ErrorJumpBanner onGoToTeaching={onGoToTeaching} />

      <div className="flex-1 overflow-auto p-3 font-mono text-sm">
        {output && (
          <pre className="text-gray-300 whitespace-pre-wrap mb-3">{output}</pre>
        )}
        {testResults.length > 0 && (
          <div className="space-y-2">
            {/* Summary bar */}
            <div className={`p-3 rounded-xl border ${
              failedResults.length === 0
                ? 'border-emerald-600/30 bg-emerald-900/20'
                : 'border-rose-600/30 bg-rose-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  failedResults.length === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {failedResults.length === 0 ? '✓' : '✗'} {t('output.passedTotal', { passed: passedResults.length, total: testResults.length })}
                </span>
                {failedResults.length === 0 && (
                  <span className="text-emerald-400 text-xs">{t('output.allPassed')}</span>
                )}
              </div>
            </div>

            {/* Failed tests */}
            {failedResults.length > 0 && (
              <div className="space-y-2">
                {failedResults.map((r) => (
                  <div
                    key={r.index}
                    className="p-2 rounded-xl border border-rose-600/30 bg-rose-900/20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-rose-400">
                        {t('output.testFailed', { num: r.index + 1 })}
                      </span>
                      <button
                        onClick={() => disputeTestCase(r)}
                        disabled={isAILoading}
                        title={t('output.disputeHint')}
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-md border border-amber-500/40 bg-amber-900/20 text-amber-300 hover:bg-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('output.dispute')}
                      </button>
                    </div>
                    <div className="text-xs space-y-1.5 text-gray-400">
                      <div>
                        <div className="text-gray-500 mb-0.5">{t('output.input')}:</div>
                        <pre className="bg-gray-950/40 border border-white/[0.04] rounded-lg px-2 py-1 max-h-32 overflow-auto text-gray-300 whitespace-pre-wrap">{r.input}</pre>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-0.5">{t('output.expected')}:</div>
                        <pre className="bg-gray-950/40 border border-emerald-600/20 rounded-lg px-2 py-1 max-h-32 overflow-auto text-emerald-300 whitespace-pre-wrap">{r.expected}</pre>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-0.5">{t('output.actual')}:</div>
                        <pre className="bg-gray-950/40 border border-rose-600/20 rounded-lg px-2 py-1 max-h-32 overflow-auto text-rose-300 whitespace-pre-wrap">{r.actual}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Passed tests - collapsible */}
            {passedResults.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPassed(!showPassed)}
                  className="w-full p-2 rounded-xl border border-emerald-600/20 bg-emerald-900/10 hover:bg-emerald-900/20 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-emerald-400 text-sm">
                    {t('output.passedCount', { count: passedResults.length })}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {showPassed ? t('output.collapse') : t('output.expand')}
                  </span>
                </button>
                {showPassed && (
                  <div className="mt-2 space-y-1">
                    {passedResults.map((r) => {
                      const isOpen = expandedPassed.has(r.index);
                      return (
                        <div
                          key={r.index}
                          className="rounded-lg border border-emerald-600/20 bg-emerald-900/10 overflow-hidden"
                        >
                          <button
                            onClick={() => togglePassedDetail(r.index)}
                            className="w-full p-2 flex items-center justify-between hover:bg-emerald-900/20 transition-colors text-left"
                          >
                            <span className="text-emerald-400 text-xs">
                              {t('output.testPassed', { num: r.index + 1 })}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {isOpen ? '▲' : '▼'}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="px-2 pb-2 text-xs space-y-1 text-gray-400">
                              <div>
                                <div className="text-gray-500 mb-0.5">{t('output.input')}:</div>
                                <pre className="bg-gray-950/40 border border-white/[0.04] rounded-lg px-2 py-1 max-h-32 overflow-auto text-gray-300 whitespace-pre-wrap">{r.input}</pre>
                              </div>
                              <div>
                                <div className="text-gray-500 mb-0.5">{t('output.expected')}:</div>
                                <pre className="bg-gray-950/40 border border-emerald-600/20 rounded-lg px-2 py-1 max-h-32 overflow-auto text-emerald-300 whitespace-pre-wrap">{r.expected}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {!output && testResults.length === 0 && (
          <div className="text-gray-600 text-center mt-8">
            {t('output.emptyHint')}
          </div>
        )}
      </div>
    </div>
  );
}
