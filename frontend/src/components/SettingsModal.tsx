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

// 每个 provider 的 Key 获取指南，展示在 provider 选择下方
const PROVIDER_GUIDES: Record<string, {
  name: string;
  url: string;
  region: '海外' | '中国' | '全球';
  steps: string[];
  tips?: string;
}> = {
  anthropic: {
    name: 'Anthropic Console',
    url: 'https://console.anthropic.com/settings/keys',
    region: '海外',
    steps: [
      '注册 / 登录 Anthropic Console（需海外手机号 + 信用卡）',
      '进入 Settings → API Keys，点击 Create Key',
      '复制以 sk-ant-api03- 开头的 Key 粘贴到下方',
    ],
    tips: '新账号通常赠送少量免费额度；超出后按 token 计费。中国大陆需科学上网。',
  },
  openai: {
    name: 'OpenAI Platform',
    url: 'https://platform.openai.com/api-keys',
    region: '海外',
    steps: [
      '注册 / 登录 OpenAI Platform（需海外手机号）',
      '左侧菜单 API keys → Create new secret key',
      '复制 sk- 开头的 Key 粘贴到下方',
    ],
    tips: '需先在 Billing 页面充值（最低 5 美元），否则调用会 429。中国大陆访问需代理。',
  },
  qwen: {
    name: '阿里云百炼',
    url: 'https://bailian.console.aliyun.com/',
    region: '中国',
    steps: [
      '使用阿里云账号登录百炼控制台',
      '左侧 API-KEY 管理 → 创建新 API-KEY',
      '复制 sk- 开头的 Key 粘贴到下方',
    ],
    tips: '通义千问系列模型，国内直连快，新用户有免费 tokens。需实名认证。',
  },
  doubao: {
    name: '火山引擎方舟',
    url: 'https://console.volcengine.com/ark',
    region: '中国',
    steps: [
      '使用火山引擎账号登录方舟控制台',
      'API Key 管理 → 创建 API Key',
      '在「在线推理」中开通豆包模型，记下推理接入点（Endpoint ID）',
      '模型名称填 Endpoint ID（ep-xxxxx 格式），不是模型名',
    ],
    tips: '豆包模型需先在控制台「开通服务」并创建推理接入点。国内直连。',
  },
  glm: {
    name: '智谱 BigModel',
    url: 'https://open.bigmodel.cn/usercenter/apikeys',
    region: '中国',
    steps: [
      '注册 / 登录智谱开放平台',
      '右上角头像 → API keys → 添加新的 API Key',
      '复制 Key 粘贴到下方',
    ],
    tips: 'GLM-4 系列模型，新用户有免费额度。国内直连。',
  },
  gemini: {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/apikey',
    region: '海外',
    steps: [
      '使用 Google 账号登录 AI Studio',
      '点击 Get API key → Create API key',
      '复制 Key 粘贴到下方',
    ],
    tips: '免费额度较慷慨。中国大陆需科学上网。注意 Gemini API 暂不支持部分地区。',
  },
};

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

        {/* Provider key 获取指南 */}
        {PROVIDER_GUIDES[provider] && (
          <div className="mb-4 p-3 bg-gray-950/40 border border-white/[0.04] rounded-xl text-xs text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">如何获取 {PROVIDER_GUIDES[provider].name} 的 API Key</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                PROVIDER_GUIDES[provider].region === '海外'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>{PROVIDER_GUIDES[provider].region}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-500">
              {PROVIDER_GUIDES[provider].steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            {PROVIDER_GUIDES[provider].tips && (
              <p className="text-[11px] text-gray-600 italic">{PROVIDER_GUIDES[provider].tips}</p>
            )}
            <a
              href={PROVIDER_GUIDES[provider].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
            >
              前往 {PROVIDER_GUIDES[provider].name}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

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
