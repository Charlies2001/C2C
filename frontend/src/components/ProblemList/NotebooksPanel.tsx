import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { listNotebooks, createNotebook, type NotebookSummary } from '../../api/notebooks';

const COLOR_MAP: Record<string, { bg: string; ring: string; chip: string }> = {
  violet:  { bg: 'from-violet-500/25 via-violet-500/8 to-transparent',   ring: 'border-violet-500/30 hover:border-violet-400/60',   chip: 'bg-violet-500/15 text-violet-300' },
  cyan:    { bg: 'from-cyan-500/25 via-cyan-500/8 to-transparent',       ring: 'border-cyan-500/30 hover:border-cyan-400/60',       chip: 'bg-cyan-500/15 text-cyan-300' },
  emerald: { bg: 'from-emerald-500/25 via-emerald-500/8 to-transparent', ring: 'border-emerald-500/30 hover:border-emerald-400/60', chip: 'bg-emerald-500/15 text-emerald-300' },
  amber:   { bg: 'from-amber-500/25 via-amber-500/8 to-transparent',     ring: 'border-amber-500/30 hover:border-amber-400/60',     chip: 'bg-amber-500/15 text-amber-300' },
  rose:    { bg: 'from-rose-500/25 via-rose-500/8 to-transparent',       ring: 'border-rose-500/30 hover:border-rose-400/60',       chip: 'bg-rose-500/15 text-rose-300' },
};

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return '刚刚';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} 天前`;
  return fmtDate(iso);
}

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
      <div className="rounded-2xl border border-white/[0.06] bg-gray-900/40 p-6 text-center text-sm text-gray-500">
        登录后可创建笔记本
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/50 to-gray-950/30 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-100">我的笔记本</h3>
          <p className="text-xs text-gray-500 mt-0.5">把题目按主题归档，写下你的思路与解法</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-3 py-1.5 text-xs bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-lg transition-all"
        >
          + 新建笔记本
        </button>
      </div>

      {creating && (
        <div className="mb-4 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
            placeholder="例如：「DP 复习」「字节面试题」"
            className="flex-1 px-3 py-2 text-sm bg-gray-950/60 border border-white/[0.06] rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
          />
          <button onClick={handleCreate} className="px-3 py-2 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg">创建</button>
          <button onClick={() => { setCreating(false); setNewName(''); }} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-300">取消</button>
        </div>
      )}

      {loading && notebooks.length === 0 && <div className="text-xs text-gray-600">加载中…</div>}
      {!loading && notebooks.length === 0 && !creating && (
        <div className="text-sm text-gray-500 py-12 text-center border border-dashed border-white/[0.06] rounded-xl">
          还没有笔记本，点击「+ 新建笔记本」开始你的第一本
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {notebooks.map((nb) => {
          const palette = COLOR_MAP[nb.color] || COLOR_MAP.violet;
          return (
            <Link
              key={nb.id}
              to={`/notebooks/${nb.id}`}
              className={`group block rounded-2xl border bg-gradient-to-br ${palette.bg} ${palette.ring} p-4 min-h-[150px] flex flex-col transition-all hover:scale-[1.015]`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-base text-gray-100 font-semibold truncate group-hover:text-white transition-colors">
                  {nb.name}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${palette.chip} ml-2 shrink-0 font-medium`}>
                  {nb.item_count} 题
                </span>
              </div>
              {nb.description ? (
                <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">{nb.description}</div>
              ) : (
                <div className="text-xs text-gray-600 italic flex-1">还没有描述</div>
              )}
              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-gray-500">
                <span title={fmtDate(nb.created_at)}>
                  创建于 {fmtDate(nb.created_at)}
                </span>
                <span title={fmtDate(nb.updated_at)}>
                  更新 {relativeTime(nb.updated_at)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
