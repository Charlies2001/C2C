import { useMemo } from 'react';
import { useStore } from '../../store/useStore';

// GitHub-style daily activity heatmap based on solvedRecords (localStorage).
// Shows last 26 weeks (~6 months) of activity.

const WEEKS = 26;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayLocal(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function colorForCount(n: number): string {
  if (n === 0) return 'bg-white/[0.04]';
  if (n === 1) return 'bg-emerald-700/60';
  if (n === 2) return 'bg-emerald-500/70';
  if (n <= 4) return 'bg-emerald-400/80';
  return 'bg-emerald-300';
}

export default function ActivityCalendar() {
  const records = useStore((s) => s.solvedRecords);

  const { cells, monthLabels, total, longestStreak, currentStreak } = useMemo(() => {
    // Bucket records by local day
    const counts = new Map<number, number>();
    for (const r of records) {
      const day = startOfDayLocal(r.solvedAt);
      counts.set(day, (counts.get(day) || 0) + 1);
    }

    // Anchor on this week's Sunday so columns are weekly.
    const today = startOfDayLocal(Date.now());
    const todayDow = new Date(today).getDay(); // 0=Sun
    const lastSunday = today - todayDow * DAY_MS;
    const startSunday = lastSunday - (WEEKS - 1) * 7 * DAY_MS;

    const cells: { date: number; count: number; inFuture: boolean }[][] = [];
    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const week: { date: number; count: number; inFuture: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = startSunday + (w * 7 + d) * DAY_MS;
        week.push({ date: day, count: counts.get(day) || 0, inFuture: day > today });
      }
      const firstOfWeek = new Date(week[0].date);
      if (firstOfWeek.getMonth() !== lastMonth) {
        monthLabels.push({ col: w, label: `${firstOfWeek.getMonth() + 1}月` });
        lastMonth = firstOfWeek.getMonth();
      }
      cells.push(week);
    }

    // Streak math
    let longestStreak = 0;
    let runStreak = 0;
    let currentStreak = 0;
    const flat: number[] = [];
    for (const week of cells) for (const c of week) if (!c.inFuture) flat.push(c.count);
    for (const n of flat) {
      if (n > 0) { runStreak++; longestStreak = Math.max(longestStreak, runStreak); }
      else runStreak = 0;
    }
    // Current streak: walk back from today through past
    for (let i = flat.length - 1; i >= 0; i--) {
      if (flat[i] > 0) currentStreak++;
      else break;
    }

    return { cells, monthLabels, total: records.length, longestStreak, currentStreak };
  }, [records]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/50 to-gray-950/30 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">刷题记录</h3>
        <div className="text-xs text-gray-500">
          共 <span className="text-gray-300">{total}</span> 题 · 当前连续 <span className="text-emerald-400">{currentStreak}</span> 天 · 最长 <span className="text-gray-300">{longestStreak}</span> 天
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        {/* Month labels */}
        <div className="flex pl-6 mb-1 select-none">
          {Array.from({ length: WEEKS }).map((_, w) => {
            const label = monthLabels.find((m) => m.col === w)?.label || '';
            return (
              <div key={w} className="text-[9px] text-gray-600 w-3 mr-0.5 text-left">
                {label}
              </div>
            );
          })}
        </div>

        <div className="flex items-start">
          {/* Day-of-week labels (Mon, Wed, Fri visible) */}
          <div className="flex flex-col mr-1 text-[9px] text-gray-600 select-none">
            {['', '一', '', '三', '', '五', ''].map((d, i) => (
              <div key={i} className="h-3 mb-0.5 leading-3">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex">
            {cells.map((week, w) => (
              <div key={w} className="flex flex-col mr-0.5">
                {week.map((cell, d) => (
                  <div
                    key={d}
                    title={cell.inFuture ? '' : `${fmtDate(cell.date)} · ${cell.count} 题`}
                    className={`w-3 h-3 mb-0.5 rounded-[3px] transition-colors ${
                      cell.inFuture ? 'bg-transparent' : colorForCount(cell.count)
                    } hover:ring-1 hover:ring-violet-400/40`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 ml-6 text-[10px] text-gray-500">
          <span>少</span>
          <div className="w-3 h-3 rounded-[3px] bg-white/[0.04]" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-700/60" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-500/70" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-400/80" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-300" />
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
