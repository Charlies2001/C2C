import { useEffect, useMemo, useState } from 'react';
import { fetchProblems, fetchProblem } from '../api/problems';
import { addItem } from '../api/notebooks';
import type { ProblemListItem } from '../types/problem';

interface Props {
  open: boolean;
  notebookId: number;
  existingProblemIds: Set<number>;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddProblemToNotebookModal({ open, notebookId, existingProblemIds, onClose, onAdded }: Props) {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [includeAnswer, setIncludeAnswer] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSearch(''); setSelectedId(null); setIncludeAnswer(true); setError('');
    fetchProblems({}).then(setProblems).catch(() => {});
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems
      .filter((p) => !existingProblemIds.has(p.id))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }, [problems, search, existingProblemIds]);

  const handleAdd = async () => {
    if (selectedId == null) return;
    setBusy(true);
    setError('');
    try {
      let answerCode = '';
      if (includeAnswer) {
        // Pre-populate with the problem's starter_code so user has scaffold to edit
        const full = await fetchProblem(selectedId);
        answerCode = full.starter_code || '';
      }
      await addItem(notebookId, {
        problem_id: selectedId,
        include_answer: includeAnswer,
        answer_code: answerCode,
        note: '',
      });
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message || '添加失败');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-lg p-6 border border-white/[0.06] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-100 mb-3">添加题目到笔记本</h2>

        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索题目（标题或 slug）"
          className="px-3 py-2 mb-3 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
        />

        <div className="flex-1 overflow-y-auto border border-white/[0.06] rounded-xl divide-y divide-white/[0.04] mb-3">
          {filtered.length === 0 && (
            <div className="text-xs text-gray-500 py-8 text-center">没有匹配的题目</div>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                selectedId === p.id ? 'bg-violet-500/15' : 'hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="radio"
                readOnly
                checked={selectedId === p.id}
                className="accent-violet-500"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">{p.title}</div>
                <div className="text-[10px] text-gray-500">{p.difficulty} · {p.category}</div>
              </div>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 mb-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={includeAnswer}
            onChange={(e) => setIncludeAnswer(e.target.checked)}
            className="accent-violet-500"
          />
          带答案（预填起始代码，之后可在笔记本中自由编辑）
        </label>

        {error && <div className="text-xs text-rose-400 mb-2">{error}</div>}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200">取消</button>
          <button
            onClick={handleAdd}
            disabled={busy || selectedId == null}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl disabled:opacity-50"
          >
            {busy ? '添加中…' : '添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
