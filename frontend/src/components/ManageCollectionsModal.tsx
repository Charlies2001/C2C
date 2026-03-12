import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ManageCollectionsModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const collections = useStore((s) => s.collections);
  const createCollection = useStore((s) => s.createCollection);
  const deleteCollection = useStore((s) => s.deleteCollection);
  const renameCollection = useStore((s) => s.renameCollection);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');

  if (!open) return null;

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setDeletingId(null);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      renameCollection(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createCollection(name);
    setNewName('');
    setShowNewInput(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-5 border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-100 mb-4">{t('manageCollections.title')}</h2>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {collections.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">{t('manageCollections.empty')}</p>
          )}
          {collections.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={saveEdit}
                  className="flex-1 px-2 py-0.5 bg-gray-950/60 border border-violet-500/50 rounded-lg text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
              ) : (
                <span className="flex-1 text-sm text-gray-200">{c.name}</span>
              )}
              <span className="text-xs text-gray-500 shrink-0">{t('manageCollections.problemCount', { count: c.problemIds.length })}</span>

              {deletingId === c.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      deleteCollection(c.id);
                      setDeletingId(null);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded transition-colors"
                  >
                    {t('manageCollections.confirm')}
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-xs text-gray-500 hover:text-gray-300 px-1.5 py-0.5 rounded transition-colors"
                  >
                    {t('manageCollections.cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId !== c.id && (
                    <button
                      onClick={() => startEdit(c.id, c.name)}
                      className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors"
                      title={t('manageCollections.rename')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingId(c.id)}
                    className="p-1 text-gray-500 hover:text-rose-400 rounded transition-colors"
                    title={t('manageCollections.delete')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
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
              placeholder={t('manageCollections.placeholder')}
              className="flex-1 px-3 py-1.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl transition-all"
            >
              {t('manageCollections.create')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="mt-3 w-full text-left px-3 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-white/[0.04] rounded-xl transition-colors"
          >
            {t('manageCollections.newCollection')}
          </button>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {t('manageCollections.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
