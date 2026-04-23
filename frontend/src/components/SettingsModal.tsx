import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n';
import { useAuthStore } from '../store/useAuthStore';
import { saveApiKey, deleteApiKey } from '../api/auth';

const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic', defaultModel: 'claude-sonnet-4-6' },
  { id: 'openai',    label: 'OpenAI',    defaultModel: 'gpt-4o' },
  { id: 'qwen',      label: 'Qwen',      defaultModel: 'qwen-plus' },
  { id: 'doubao',    label: 'Doubao',    defaultModel: 'doubao-1.5-pro-32k-250115' },
  { id: 'glm',       label: 'GLM',       defaultModel: 'glm-4-flash' },
  { id: 'gemini',    label: 'Gemini',    defaultModel: 'gemini-2.0-flash' },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuthStore();
  const [provider, setProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setProvider(user.ai_provider || 'anthropic');
      setApiKey('');
      setModel(user.ai_model || '');
      setMessage('');
    }
  }, [open, user]);

  if (!open) return null;

  const currentDefault = PROVIDERS.find(p => p.id === provider)?.defaultModel || '';

  const handleSave = async () => {
    const keyToSave = apiKey.trim();
    if (!keyToSave && !user?.has_api_key) {
      setMessage(t('settings.enterApiKey'));
      return;
    }
    setSaving(true);
    try {
      if (keyToSave) {
        await saveApiKey(provider, keyToSave, model.trim());
      } else {
        // Only updating provider/model — re-save with a placeholder flow
        // User must enter a new key or keep existing
        await saveApiKey(provider, '', model.trim());
      }
      await refreshUser();
      setApiKey('');
      setMessage(t('settings.saved'));
    } catch (err: any) {
      setMessage(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async () => {
    setSaving(true);
    try {
      await deleteApiKey();
      await refreshUser();
      setMessage('API Key 已删除');
    } catch (err: any) {
      setMessage(err.message || '删除失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-6 border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('settings.title')}</h2>

        {/* Language selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">{t('settings.language')}</label>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  i18n.language === lang.code
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/[0.15]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">{t('settings.selectProvider')}</label>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id);
                  setModel('');
                  setMessage('');
                }}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  provider === p.id
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/[0.15]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm text-gray-400">{t('settings.apiKey')}</label>
          {user?.has_api_key && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400">{t('settings.configured')}: ****</span>
              <button
                onClick={handleDeleteKey}
                disabled={saving}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
              >
                删除 Key
              </button>
            </div>
          )}
          <input
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setMessage(''); }}
            placeholder={user?.has_api_key ? t('settings.newKeyPlaceholder') : t('settings.enterKey')}
            className="w-full px-3 py-2 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        {/* Model input */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm text-gray-400">{t('settings.modelName')} <span className="text-gray-600">({t('settings.optional')})</span></label>
          <input
            type="text"
            value={model}
            onChange={(e) => { setModel(e.target.value); setMessage(''); }}
            placeholder={currentDefault}
            className="w-full px-3 py-2 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <p className="text-xs text-gray-600">{t('settings.defaultModel')}: {currentDefault}</p>
        </div>

        {message && (
          <div className={`text-xs mb-3 ${message === t('settings.saved') ? 'text-emerald-400' : 'text-rose-400'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {t('settings.close')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? '保存中...' : t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
