import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  type NotebookDetail,
  type NotebookItem,
  deleteItem,
  deleteNotebook,
  getNotebook,
  updateItem,
  updateNotebook,
} from '../api/notebooks';
import AddProblemToNotebookModal from '../components/AddProblemToNotebookModal';

const DEBOUNCE_MS = 800;

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  Hard: 'text-rose-400 bg-rose-400/10',
};

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = fmtDate(iso);
  return `${date} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function NotebookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nb, setNb] = useState<NotebookDetail | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!id) return;
    try {
      const fresh = await getNotebook(Number(id));
      setNb(fresh);
    } catch (e: any) {
      setError(e.message || '加载失败');
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  const existingProblemIds = useMemo(() => {
    return new Set((nb?.items || []).map((i) => i.problem_id));
  }, [nb]);

  const handleRename = async () => {
    if (!nb || !draftName.trim() || draftName === nb.name) {
      setEditingName(false);
      return;
    }
    try {
      await updateNotebook(nb.id, { name: draftName.trim() });
      setNb({ ...nb, name: draftName.trim() });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEditingName(false);
    }
  };

  const handleDeleteNotebook = async () => {
    if (!nb) return;
    if (!confirm(`确定删除笔记本「${nb.name}」吗？此操作不可恢复。`)) return;
    try {
      await deleteNotebook(nb.id);
      navigate('/problems');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!nb) return;
    if (!confirm('从笔记本中移除该题目？')) return;
    try {
      await deleteItem(nb.id, itemId);
      setNb({ ...nb, items: nb.items.filter((i) => i.id !== itemId) });
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!nb) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        {error ? <div className="text-rose-400">{error}</div> : <div className="text-gray-500">加载中…</div>}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-baseline justify-between mb-1">
        <Link to="/problems" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← 返回题库</Link>
        <button onClick={handleDeleteNotebook} className="text-xs text-rose-400/70 hover:text-rose-300 transition-colors">删除笔记本</button>
      </div>
      <div className="flex items-center gap-3 mb-1">
        {editingName ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
            className="text-2xl font-bold bg-transparent border-b border-violet-500/50 text-white focus:outline-none"
          />
        ) : (
          <h1
            className="text-2xl font-bold text-white cursor-text"
            onClick={() => { setDraftName(nb.name); setEditingName(true); }}
            title="点击重命名"
          >
            {nb.name}
          </h1>
        )}
        <span className="text-xs text-gray-500">{nb.items.length} 题</span>
      </div>
      {nb.description && <p className="text-sm text-gray-500 mb-2">{nb.description}</p>}
      <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-4">
        {nb.created_at && <span>创建于 {fmtDate(nb.created_at)}</span>}
        {nb.updated_at && nb.updated_at !== nb.created_at && (
          <>
            <span className="text-gray-700">·</span>
            <span>最近更新 {fmtDateTime(nb.updated_at)}</span>
          </>
        )}
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 text-xs bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-lg transition-all"
        >
          + 添加题目
        </button>
      </div>

      {error && <div className="text-xs text-rose-400 mb-3">{error}</div>}

      <div className="space-y-4">
        {nb.items.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/[0.06] rounded-xl">
            空白笔记本——点「添加题目」选择题库中的题目
          </div>
        )}
        {nb.items.map((item) => (
          <NotebookItemCard
            key={item.id}
            notebookId={nb.id}
            item={item}
            onLocalUpdate={(updated) => setNb({ ...nb, items: nb.items.map((i) => i.id === updated.id ? updated : i) })}
            onRemove={() => handleRemoveItem(item.id)}
          />
        ))}
      </div>

      <AddProblemToNotebookModal
        open={showAdd}
        notebookId={nb.id}
        existingProblemIds={existingProblemIds}
        onClose={() => setShowAdd(false)}
        onAdded={reload}
      />
    </div>
  );

  function NotebookItemCard({
    notebookId,
    item,
    onLocalUpdate,
    onRemove,
  }: {
    notebookId: number;
    item: NotebookItem;
    onLocalUpdate: (i: NotebookItem) => void;
    onRemove: () => void;
  }) {
    const [note, setNote] = useState(item.note);
    const [code, setCode] = useState(item.answer_code);
    const [includeAns, setIncludeAns] = useState(item.include_answer);
    const noteTimer = useRef<number | null>(null);
    const codeTimer = useRef<number | null>(null);
    const ansTimer = useRef<number | null>(null);

    // Debounced auto-save for note
    useEffect(() => {
      if (note === item.note) return;
      if (noteTimer.current) window.clearTimeout(noteTimer.current);
      noteTimer.current = window.setTimeout(async () => {
        const updated = await updateItem(notebookId, item.id, { note });
        onLocalUpdate(updated);
      }, DEBOUNCE_MS);
      return () => { if (noteTimer.current) window.clearTimeout(noteTimer.current); };
    }, [note]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (code === item.answer_code) return;
      if (codeTimer.current) window.clearTimeout(codeTimer.current);
      codeTimer.current = window.setTimeout(async () => {
        const updated = await updateItem(notebookId, item.id, { answer_code: code });
        onLocalUpdate(updated);
      }, DEBOUNCE_MS);
      return () => { if (codeTimer.current) window.clearTimeout(codeTimer.current); };
    }, [code]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (includeAns === item.include_answer) return;
      if (ansTimer.current) window.clearTimeout(ansTimer.current);
      ansTimer.current = window.setTimeout(async () => {
        const updated = await updateItem(notebookId, item.id, { include_answer: includeAns });
        onLocalUpdate(updated);
      }, 200);
      return () => { if (ansTimer.current) window.clearTimeout(ansTimer.current); };
    }, [includeAns]);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div className="border border-white/[0.06] rounded-2xl bg-gradient-to-br from-gray-900/40 to-gray-950/20 p-4">
        <div className="flex items-center justify-between mb-1">
          <Link to={`/problem/${item.problem_id}`} className="flex items-center gap-2 group">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${DIFFICULTY_COLOR[item.problem_difficulty] || 'text-gray-400'}`}>
              {item.problem_difficulty}
            </span>
            <span className="text-base text-gray-100 group-hover:text-violet-300 transition-colors font-medium">
              {item.problem_title}
            </span>
            <span className="text-[10px] text-gray-600">{item.problem_category}</span>
          </Link>
          <button onClick={onRemove} className="text-[11px] text-gray-500 hover:text-rose-400 transition-colors">移除</button>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-600 mb-3">
          {item.created_at && <span title={fmtDateTime(item.created_at)}>添加于 {fmtDate(item.created_at)}</span>}
          {item.updated_at && item.updated_at !== item.created_at && (
            <>
              <span className="text-gray-700">·</span>
              <span title={fmtDateTime(item.updated_at)}>编辑于 {fmtDateTime(item.updated_at)}</span>
            </>
          )}
        </div>

        <div>
          <div className="text-[11px] text-gray-500 mb-1">笔记</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="思路、踩坑、复习要点…"
            className="w-full min-h-[80px] px-3 py-2 bg-gray-950/40 border border-white/[0.04] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/40 resize-y"
          />
        </div>

        <div className="mt-3">
          <label className="flex items-center justify-between mb-1 text-[11px] text-gray-500">
            <span>答案 / 解法代码</span>
            <span className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={includeAns}
                onChange={(e) => setIncludeAns(e.target.checked)}
                className="accent-violet-500"
              />
              <span>显示</span>
            </span>
          </label>
          {includeAns && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={'class Solution(object):\n    def f(self, ...):\n        pass'}
              className="w-full min-h-[120px] px-3 py-2 bg-gray-950/60 border border-white/[0.04] rounded-lg text-xs text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/40 resize-y"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    );
  }
}
