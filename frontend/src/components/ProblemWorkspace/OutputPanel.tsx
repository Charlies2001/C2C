import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../../store/useStore';
import { runPythonCode } from '../../services/pyodide';
import { fetchReferenceSolution, fixTestCase } from '../../api/problems';
import type { TestResult } from '../../types/problem';
import ErrorJumpBanner from './ErrorJumpBanner';
import { getSectionTitlesForDifficulty, findRelevantSectionIndex, extractErrorType } from '../../utils/sectionTitles';

type DisputeStage = 'idle' | 'fetching_ref' | 'running_ref' | 'applying_fix';

interface AutoFixSuggestion {
  index: number;
  oldExpected: string;
  newExpected: string;
}

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
  // Dispute auto-detect state
  const [disputeIndex, setDisputeIndex] = useState<number | null>(null);
  const [disputeStage, setDisputeStage] = useState<DisputeStage>('idle');
  const [autoFix, setAutoFix] = useState<AutoFixSuggestion | null>(null);
  const [disputeError, setDisputeError] = useState<string>('');
  const setCurrentProblem = useStore((s) => s.setCurrentProblem);

  const togglePassedDetail = (idx: number) => {
    setExpandedPassed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const sendDisputeToChat = (r: TestResult, key: 'output.disputePrompt' | 'output.disputeVerifiedTestPrompt' | 'output.disputeUncertainPrompt', extra: Record<string, string> = {}) => {
    const prompt = t(key, {
      num: r.index + 1,
      input: r.input,
      expected: r.expected,
      actual: r.actual,
      ...extra,
    });
    setIsChatOpen(true);
    setPendingChatPrompt(prompt);
  };

  const disputeTestCase = async (r: TestResult) => {
    if (isAILoading || disputeIndex !== null || !currentProblem || !pyodideReady) return;
    setDisputeIndex(r.index);
    setDisputeError('');
    setAutoFix(null);
    setDisputeStage('fetching_ref');
    try {
      const ref = await fetchReferenceSolution({
        description: currentProblem.description,
        starter_code: currentProblem.starter_code,
        helper_code: currentProblem.helper_code,
      });
      if (!ref.success || !ref.code) {
        // Fall back to chat-only dispute.
        sendDisputeToChat(r, 'output.disputePrompt');
        return;
      }

      setDisputeStage('running_ref');
      const refRun = await runPythonCode(
        `${ref.code}\n${r.input}`,
        currentProblem.helper_code || '',
      );
      if (refRun.error) {
        // Reference solution itself errored — can't trust auto-detection, fall back.
        sendDisputeToChat(r, 'output.disputePrompt');
        return;
      }

      const refOutput = (refRun.stdout || '').trim();
      const expected = r.expected.trim();
      const actual = r.actual.trim();

      if (refOutput === expected) {
        // 测试用例本身没问题，学生代码错了。Send verified context to chat.
        sendDisputeToChat(r, 'output.disputeVerifiedTestPrompt', { refOutput });
      } else if (refOutput === actual) {
        // AI 参考解输出 == 学生输出 ≠ expected → expected 大概率错了。Offer one-click fix.
        setAutoFix({ index: r.index, oldExpected: r.expected, newExpected: refRun.stdout || '' });
      } else {
        // Reference disagrees with both — uncertain, let AI in chat reason about it.
        sendDisputeToChat(r, 'output.disputeUncertainPrompt', { refOutput });
      }
    } catch (e) {
      setDisputeError(e instanceof Error ? e.message : String(e));
      sendDisputeToChat(r, 'output.disputePrompt');
    } finally {
      setDisputeStage('idle');
      setDisputeIndex(null);
    }
  };

  const applyAutoFix = async () => {
    if (!autoFix || !currentProblem) return;
    setDisputeStage('applying_fix');
    setDisputeError('');
    try {
      const updated = await fixTestCase({
        problem_id: currentProblem.id,
        index: autoFix.index,
        expected: autoFix.newExpected,
      });
      setCurrentProblem(updated);
      // Mark the suspect test as passing in current testResults (since the case is now correct).
      setTestResults(
        testResults.map((tr) =>
          tr.index === autoFix.index
            ? { ...tr, passed: true, expected: autoFix.newExpected }
            : tr,
        ),
      );
      setAutoFix(null);
    } catch (e) {
      setDisputeError(e instanceof Error ? e.message : String(e));
    } finally {
      setDisputeStage('idle');
    }
  };

  const dismissAutoFix = () => {
    setAutoFix(null);
    setDisputeError('');
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
                {failedResults.map((r) => {
                  const isDetecting = disputeIndex === r.index;
                  const showFix = autoFix?.index === r.index;
                  const stageLabel =
                    disputeStage === 'fetching_ref' ? t('output.disputeStage1')
                    : disputeStage === 'running_ref' ? t('output.disputeStage2')
                    : t('output.disputeRunning');
                  return (
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
                          disabled={isAILoading || disputeIndex !== null || !pyodideReady}
                          title={t('output.disputeHint')}
                          className="ml-auto text-[10px] px-2 py-0.5 rounded-md border border-amber-500/40 bg-amber-900/20 text-amber-300 hover:bg-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          {isDetecting ? (
                            <>
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              {stageLabel}
                            </>
                          ) : (
                            t('output.dispute')
                          )}
                        </button>
                      </div>

                      {showFix && autoFix && (
                        <div className="mb-2 p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-900/20">
                          <div className="text-emerald-300 text-xs font-medium mb-1.5">
                            ✓ {t('output.autoFixVerdict')}
                          </div>
                          <div className="text-[11px] text-gray-400 space-y-1 mb-2">
                            <div>
                              {t('output.autoFixOldExpected')}:
                              <span className="ml-1 font-mono text-rose-300">{autoFix.oldExpected}</span>
                            </div>
                            <div>
                              {t('output.autoFixNewExpected')}:
                              <span className="ml-1 font-mono text-emerald-300">{autoFix.newExpected.trim()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={applyAutoFix}
                              disabled={disputeStage === 'applying_fix'}
                              className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
                            >
                              {disputeStage === 'applying_fix' ? t('output.autoFixApplying') : t('output.autoFixApply')}
                            </button>
                            <button
                              onClick={dismissAutoFix}
                              disabled={disputeStage === 'applying_fix'}
                              className="text-[11px] px-2.5 py-1 rounded-md border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors"
                            >
                              {t('output.autoFixDismiss')}
                            </button>
                            {disputeError && (
                              <span className="text-[10px] text-rose-400 ml-2">{disputeError}</span>
                            )}
                          </div>
                        </div>
                      )}

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
                  );
                })}
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
