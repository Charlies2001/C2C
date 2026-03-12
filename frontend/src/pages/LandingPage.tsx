import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: t('landing.feature1Title'),
      desc: t('landing.feature1Desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('landing.feature2Title'),
      desc: t('landing.feature2Desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: t('landing.feature3Title'),
      desc: t('landing.feature3Desc'),
    },
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-48px)] flex items-center justify-center overflow-hidden">
        {/* Background glows */}
        <div className="landing-glow landing-glow-1" />
        <div className="landing-glow landing-glow-2" />
        <div className="landing-glow landing-glow-3" />

        <div className="relative z-10 text-center px-6 animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              {t('landing.heroTitle1')}
            </span>
            <br />
            <span className="text-white">{t('landing.heroTitle2')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            {t('landing.heroSubtitle')}
            <br className="hidden sm:inline" />
            {t('landing.heroSubtitle2')}
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-2xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            {t('landing.startPractice')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            {t('landing.whyC2C')}
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-xl mx-auto">
            {t('landing.whySubtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-gradient-border card-glow rounded-2xl bg-gray-900/60 backdrop-blur-sm p-8 text-center animate-fade-in-up"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-400 mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20 px-6 text-center">
        <p className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {t('landing.readyTitle')}
        </p>
        <p className="text-gray-400 mb-8">
          {t('landing.readySubtitle')}
        </p>
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
    </div>
  );
}
