import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { listNotebooks, createNotebook, type NotebookSummary } from '../../api/notebooks';

const COLOR_MAP: Record<string, string> = {
  violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
};

export default function NotebooksPanel() {
  const { user } = useAuthStore();
  const [notebooks, setNotebooks] = useState<NotebookSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const reload = () => {
    if (!user) return;
    setLoading(true);
    listNotebooks().then(setNotebooks).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(reload, [user]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const nb = await createNotebook(name);
      setNotebooks((prev) => [nb, ...prev]);
      setNewName('');
      setCreating(false);
    } catch { /* noop */ }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-4 text-center text-sm text-gray-500">
        登录后可创建笔记本
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/50 to-gray-950/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">我的笔记本</h3>
        <button
          onClick={() => setCreating(true)}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          + 新建
        </button>
      </div>

      {creating && (
        <div className="mb-3 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
            placeholder="笔记本名称"
            className="flex-1 px-3 py-1.5 text-sm bg-gray-950/60 border border-white/[0.06] rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
          />
          <button onClick={handleCreate} className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg">创建</button>
          <button onClick={() => { setCreating(false); setNewName(''); }} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300">取消</button>
        </div>
      )}

      {loading && notebooks.length === 0 && <div className="text-xs text-gray-600">加载中…</div>}
      {!loading && notebooks.length === 0 && !creating && (
        <div className="text-xs text-gray-500 py-6 text-center">还没有笔记本，点击「+ 新建」开始</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {notebooks.map((nb) => (
          <Link
            key={nb.id}
            to={`/notebooks/${nb.id}`}
            className={`block rounded-xl border bg-gradient-to-br p-3 transition-all hover:scale-[1.01] ${
              COLOR_MAP[nb.color] || COLOR_MAP.violet
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-100 font-medium truncate">{nb.name}</div>
              <span className="text-[10px] text-gray-500 ml-2">{nb.item_count} 题</span>
            </div>
            {nb.description && <div className="text-[11px] text-gray-500 truncate">{nb.description}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
