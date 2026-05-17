import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Modal that appears when a guest tries to invoke a feature that requires
 * an account (AI helpers, notebooks, anything that touches encrypted
 * server-side data). Triggered via `useAuthStore().requireLogin(message)`.
 *
 * Mounted once at the AppShell level so it's available from any page.
 */
export default function LoginGate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showLoginGate = useAuthStore((s) => s.showLoginGate);
  const loginGateMessage = useAuthStore((s) => s.loginGateMessage);
  const closeLoginGate = useAuthStore((s) => s.closeLoginGate);

  // Close on Escape — standard modal behavior.
  useEffect(() => {
    if (!showLoginGate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginGate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLoginGate, closeLoginGate]);

  if (!showLoginGate) return null;

  const goAuth = () => {
    closeLoginGate();
    navigate('/auth');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeLoginGate}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-gate-title"
        className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/[0.08] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 mb-3">
            <span className="text-2xl" aria-hidden="true">🔓</span>
          </div>
          <h3 id="login-gate-title" className="text-lg font-semibold text-white mb-1.5">
            {t('loginGate.title')}
          </h3>
          <p className="text-sm text-gray-400">
            {loginGateMessage || t('loginGate.defaultMessage')}
          </p>
        </div>

        <ul className="text-xs text-gray-400 space-y-1.5 mb-5 px-3">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">✓</span>
            <span>{t('loginGate.benefit1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">✓</span>
            <span>{t('loginGate.benefit2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">✓</span>
            <span>{t('loginGate.benefit3')}</span>
          </li>
        </ul>

        <div className="flex gap-2">
          <button
            onClick={goAuth}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl transition-colors"
          >
            {t('loginGate.goLogin')}
          </button>
          <button
            onClick={closeLoginGate}
            className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 border border-white/10 hover:border-white/20 rounded-xl transition-colors"
          >
            {t('loginGate.later')}
          </button>
        </div>
      </div>
    </div>
  );
}
