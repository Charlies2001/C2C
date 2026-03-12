import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
] as const;

function loadLanguage(): string {
  try {
    const stored = localStorage.getItem('app_language');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.version === 1 && parsed.language) {
        return parsed.language;
      }
    }
  } catch {}
  return 'zh-CN';
}

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS },
    'ja-JP': { translation: jaJP },
    'ko-KR': { translation: koKR },
  },
  lng: loadLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
});

export function changeLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem('app_language', JSON.stringify({ version: 1, language: lang }));
  document.documentElement.lang = lang;
}

// Set initial lang attribute
document.documentElement.lang = i18n.language;

export default i18n;
