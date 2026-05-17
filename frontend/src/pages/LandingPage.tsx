import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RELEASES_URL = 'https://github.com/Charlies2001/C2C-coding-coach/releases/latest';
const GITHUB_URL = 'https://github.com/Charlies2001/C2C-coding-coach';

interface ProviderLink {
  name: string;
  url: string;
  tip: string;
}

const OVERSEAS_PROVIDERS: ProviderLink[] = [
  { name: 'Claude (Anthropic)', url: 'https://console.anthropic.com/settings/keys', tip: '新账号有免费额度' },
  { name: 'GPT (OpenAI)', url: 'https://platform.openai.com/api-keys', tip: '需先充值 ≥ $5' },
  { name: 'Gemini (Google)', url: 'https://aistudio.google.com/apikey', tip: '免费额度最大方' },
];

const DOMESTIC_PROVIDERS: ProviderLink[] = [
  { name: '通义千问 (阿里百炼)', url: 'https://bailian.console.aliyun.com/', tip: '新用户送免费 tokens，需实名' },
  { name: '智谱 GLM', url: 'https://open.bigmodel.cn/usercenter/apikeys', tip: '新用户有免费额度' },
  { name: '豆包 (火山方舟)', url: 'https://console.volcengine.com/ark', tip: '模型名填 Endpoint ID' },
];

const FEATURE_ICONS = [
  // bulb (AI doesn't give answer — guide thinking)
  <path key="i1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
  // book stack (per-problem lesson)
  <path key="i2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  // eye (AI sees your code)
  <path key="i3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
  // wrench (one-click fix)
  <path key="i4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
];

export default function LandingPage() {
  const { t } = useTranslation();
  const [keysExpanded, setKeysExpanded] = useState(false);

  const features = [0, 1, 2, 3].map((i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`landing.feature${i + 1}Title`),
    desc: t(`landing.feature${i + 1}Desc`),
  }));

  const renderProvider = (p: ProviderLink) => (
    <a
      key={p.url}
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-xl border border-white/[0.06] bg-gray-900/40 hover:border-violet-500/40 hover:bg-gray-900/70 transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-gray-100">{p.name}</span>
        <span className="text-xs text-violet-400">↗</span>
      </div>
      <p className="text-xs text-gray-500">{p.tip}</p>
    </a>
  );

  return (
    <div className="w-full">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-48px)] flex items-center justify-center overflow-hidden">
        <div className="landing-glow landing-glow-1" />
        <div className="landing-glow landing-glow-2" />
        <div className="landing-glow landing-glow-3" />

        <div className="relative z-10 text-center px-6 animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">{t('landing.heroTitle1')}</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              {t('landing.heroTitle2')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            {t('landing.heroSubtitle')}
            <br className="hidden sm:inline" />
            {t('landing.heroSubtitle2')}
          </p>
          <p className="text-sm text-gray-500 mb-10">{t('landing.heroTagline')}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-2xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
            >
              {t('landing.startPractice')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.19.91-.25 1.89-.38 2.86-.39.97.01 1.95.13 2.86.39 2.18-1.5 3.14-1.19 3.14-1.19.63 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.81-.01 3.19 0 .31.21.67.8.55 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              {t('landing.viewSource')}
            </a>
          </div>
        </div>
      </section>

      {/* ─── Why C2C / Features ────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
            {t('landing.whyC2C')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-gradient-border card-glow rounded-2xl bg-gray-900/60 backdrop-blur-sm p-6 animate-fade-in-up"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 leading-snug">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Three Steps ──────────────────────────────────────── */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">
            {t('landing.howStartTitle')}
          </h2>
          <p className="text-center text-gray-500 mb-12">{t('landing.howStartSubtitle')}</p>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-5 p-6 rounded-2xl border border-white/[0.06] bg-gray-900/40 backdrop-blur-sm">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 text-violet-300 font-bold text-lg flex items-center justify-center">
                1
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1.5">{t('landing.step1Title')}</h3>
                <p className="text-gray-400 text-sm mb-3">{t('landing.step1Desc')}</p>
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {t('landing.step1Cta')} →
                </a>
              </div>
            </div>

            {/* Step 2 — collapsible providers */}
            <div className="flex gap-5 p-6 rounded-2xl border border-white/[0.06] bg-gray-900/40 backdrop-blur-sm">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 text-violet-300 font-bold text-lg flex items-center justify-center">
                2
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1.5">{t('landing.step2Title')}</h3>
                <p className="text-gray-400 text-sm mb-3">{t('landing.step2Desc')}</p>

                <button
                  onClick={() => setKeysExpanded((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  aria-expanded={keysExpanded}
                >
                  <span>{keysExpanded ? t('landing.step2Collapse') : t('landing.step2Expand')}</span>
                  <span className={`transition-transform ${keysExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {keysExpanded && (
                  <div className="mt-4 space-y-5 animate-fade-in-up">
                    <div>
                      <div className="text-sm text-gray-300 mb-2 font-medium">
                        {t('landing.step2Overseas')}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {OVERSEAS_PROVIDERS.map(renderProvider)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300 mb-2 font-medium">
                        {t('landing.step2Domestic')}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {DOMESTIC_PROVIDERS.map(renderProvider)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-violet-500/40 pl-3">
                      {t('landing.step2Hint')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5 p-6 rounded-2xl border border-white/[0.06] bg-gray-900/40 backdrop-blur-sm">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 text-violet-300 font-bold text-lg flex items-center justify-center">
                3
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1.5">{t('landing.step3Title')}</h3>
                <p className="text-gray-400 text-sm">{t('landing.step3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ──────────────────────────────────────── */}
      <section className="relative py-20 px-6 text-center">
        <p className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('landing.readyTitle')}</p>
        <p className="text-gray-400 mb-8">{t('landing.readySubtitle')}</p>
        <Link
          to="/problems"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-2xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
        >
          {t('landing.startPractice')}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="relative border-t border-white/[0.06] py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link to="/privacy" className="hover:text-gray-300 transition-colors">隐私政策</Link>
          <Link to="/terms" className="hover:text-gray-300 transition-colors">服务条款</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" className="hover:text-gray-300 transition-colors">GitHub</a>
          <span className="text-gray-600">MIT License · BYOK · Open Source</span>
        </div>
      </footer>
    </div>
  );
}
