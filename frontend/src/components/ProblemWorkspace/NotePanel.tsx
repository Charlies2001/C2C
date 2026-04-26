import { useEffect, useRef, useState } from 'react';
import { fetchNote, saveNote } from '../../api/notes';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  problemId: number;
}

const SAVE_DEBOUNCE_MS = 800;

export default function NotePanel({ problemId }: Props) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!user || !problemId) return;
    let ignore = false;
    setLoaded(false);
    fetchNote(problemId)
      .then((n) => {
        if (ignore) return;
        setContent(n.content);
        lastSavedRef.current = n.content;
        setSavedAt(n.updated_at);
        setLoaded(true);
      })
      .catch(() => { if (!ignore) setLoaded(true); });
    return () => { ignore = true; };
  }, [problemId, user]);

  // Debounced auto-save on edit
  useEffect(() => {
    if (!loaded || !user) return;
    if (content === lastSavedRef.current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setSaving(true);
      setError('');
      try {
        const updated = await saveNote(problemId, content);
        lastSavedRef.current = content;
        setSavedAt(updated.updated_at);
      } catch (e: any) {
        setError(e.message || '保存失败');
      } finally {
        setSaving(false);
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [content, problemId, loaded, user]);

  if (!user) {
    return (
      <div className="mt-4 px-3 py-2 text-xs text-gray-500 border border-white/[0.06] rounded-xl">
        登录后可记笔记
      </div>
    );
  }

  return (
    <div className="mt-4 border border-white/[0.06] rounded-xl bg-gray-950/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-gray-400 hover:bg-white/[0.02] transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>我的笔记</span>
          {saving && <span className="text-[10px] text-violet-400">保存中…</span>}
          {!saving && savedAt && content === lastSavedRef.current && (
            <span className="text-[10px] text-gray-600">已保存</span>
          )}
          {error && <span className="text-[10px] text-rose-400">{error}</span>}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      {!collapsed && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={loaded ? '在这里写下你的思路、错误、优化点…（自动保存）' : '加载中…'}
          disabled={!loaded}
          className="w-full min-h-[160px] max-h-[400px] px-3 py-2 bg-transparent text-sm text-gray-200 placeholder-gray-600 border-t border-white/[0.04] focus:outline-none resize-y"
        />
      )}
    </div>
  );
}
