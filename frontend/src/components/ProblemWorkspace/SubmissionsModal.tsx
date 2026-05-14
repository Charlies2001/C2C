import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStore } from '../../store/useStore';
import type { SubmissionRecord } from '../../api/submissions';

interface Props {
  open: boolean;
  onClose: () => void;
  problemId: number;
}

// Stable empty ref so the selector doesn't return a new [] every render.
const EMPTY: SubmissionRecord[] = [];

function formatRelativeTime(iso: string, lang: string): string {
  try {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return '';
    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    const zh = lang.startsWith('zh');
    const ja = lang.startsWith('ja');
    const ko = lang.startsWith('ko');
    if (sec < 60) return zh ? '刚刚' : ja ? 'たった今' : ko ? '방금' : 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return zh ? `${min} 分钟前` : ja ? `${min} 分前` : ko ? `${min}분 전` : `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return zh ? `${hr} 小时前` : ja ? `${hr} 時間前` : ko ? `${hr}시간 전` : `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return zh ? `${day} 天前` : ja ? `${day} 日前` : ko ? `${day}일 전` : `${day}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function SubmissionsModal({ open, onClose, problemId }: Props) {
  const { t, i18n } = useTranslation();
  const submissions = useStore((s) => s.submissionsByProblem[problemId] ?? EMPTY);
  const isLoading = useStore((s) => s.isSubmissionsLoading);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Reset expanded set when the modal closes or the problem changes.
  useEffect(() => {
    if (!open) setExpanded(new Set());
  }, [open, problemId]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const allPassed = submissions.filter((s) => s.all_passed).length;

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            {t('submissions.title')}
            <span className="text-xs text-gray-500 font-normal">
              {t('submissions.summary', { passed: allPassed, total: submissions.length })}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {submissions.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              {isLoading ? t('submissions.loading') : t('submissions.empty')}
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => {
                const isOpen = expanded.has(s.id);
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl border overflow-hidden transition-colors ${
                      s.all_passed
                        ? 'border-emerald-600/30 bg-emerald-900/10'
                        : 'border-rose-600/30 bg-rose-900/10'
                    }`}
                  >
                    <button
                      onClick={() => toggle(s.id)}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {s.all_passed ? (
                          <span className="text-emerald-400 text-base shrink-0" title={t('submissions.accepted')}>
                            ✓
                          </span>
                        ) : (
                          <span className="text-rose-400 text-xs shrink-0 font-mono w-8 text-center">
                            {s.passed_count}/{s.total_count}
                          </span>
                        )}
                        <span className={`text-sm truncate ${s.all_passed ? 'text-emerald-300' : 'text-gray-300'}`}>
                          {s.all_passed
                            ? t('submissions.accepted')
                            : t('submissions.failedRow', { passed: s.passed_count, total: s.total_count })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-gray-500">
                          {formatRelativeTime(s.submitted_at, i18n.language)}
                        </span>
                        <span className="text-xs text-gray-500">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/[0.04]">
                        {s.code ? (
                          <SyntaxHighlighter
                            language="python"
                            style={oneDark}
                            customStyle={{
                              margin: 0,
                              background: 'transparent',
                              fontSize: '12.5px',
                              padding: '12px 14px',
                              maxHeight: '50vh',
                            }}
                          >
                            {s.code}
                          </SyntaxHighlighter>
                        ) : (
                          <div className="px-3 py-3 text-xs text-gray-500 italic">
                            {t('submissions.noCode')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
