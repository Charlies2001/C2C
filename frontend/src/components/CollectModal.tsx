import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
  problemId: number;
}

export default function CollectModal({ open, onClose, problemId }: Props) {
  const { t } = useTranslation();
  const collections = useStore((s) => s.collections);
  const addProblemToCollection = useStore((s) => s.addProblemToCollection);
  const removeProblemFromCollection = useStore((s) => s.removeProblemFromCollection);
  const createCollection = useStore((s) => s.createCollection);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');

  if (!open) return null;

  const handleToggle = (collectionId: string, checked: boolean) => {
    if (checked) {
      addProblemToCollection(collectionId, problemId);
    } else {
      removeProblemFromCollection(collectionId, problemId);
    }
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const c = createCollection(name);
    addProblemToCollection(c.id, problemId);
    setNewName('');
    setShowNewInput(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-sm p-5 border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-100 mb-4">{t('collect.title')}</h2>

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {collections.length === 0 && !showNewInput && (
            <p className="text-sm text-gray-500 py-2">{t('collect.empty')}</p>
          )}
          {collections.map((c) => {
            const checked = c.problemIds.includes(problemId);
            return (
              <label
                key={c.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleToggle(c.id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-950/60 text-violet-500 focus:ring-violet-500/30 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-200 flex-1">{c.name}</span>
                <span className="text-xs text-gray-500">{t('collect.problemCount', { count: c.problemIds.length })}</span>
              </label>
            );
          })}
        </div>

        {showNewInput ? (
          <div className="mt-3 flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setShowNewInput(false);
                  setNewName('');
                }
              }}
              placeholder={t('collect.placeholder')}
              className="flex-1 px-3 py-1.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl transition-all"
            >
              {t('collect.create')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="mt-3 w-full text-left px-3 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-white/[0.04] rounded-xl transition-colors"
          >
            {t('collect.newCollection')}
          </button>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl transition-all"
          >
            {t('collect.done')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
