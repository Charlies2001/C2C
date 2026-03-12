import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { getTreeStageInfo } from './treeUtils';
import TreeSVG from './TreeSVG';
import StatsPanel from './StatsPanel';

export default function GrowthTree() {
  const { t } = useTranslation();
  const solvedRecords = useStore((s) => s.solvedRecords);
  const treeJustGrew = useStore((s) => s.treeJustGrew);
  const dismissTreeGrowth = useStore((s) => s.dismissTreeGrowth);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const info = getTreeStageInfo(solvedRecords.length);

  // Auto-dismiss growth animation
  useEffect(() => {
    if (!treeJustGrew) return;
    const timer = setTimeout(dismissTreeGrowth, 2000);
    return () => clearTimeout(timer);
  }, [treeJustGrew, dismissTreeGrowth]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all hover:bg-white/[0.06] ${
          treeJustGrew ? 'tree-grow levelup-glow' : ''
        }`}
        title={t('tree.tooltip', { label: info.label, count: solvedRecords.length })}
      >
        <TreeSVG stage={info.stage} size="sm" />
        <span className="text-xs text-gray-400">{solvedRecords.length}</span>
      </button>

      {open && <StatsPanel records={solvedRecords} />}
    </div>
  );
}
