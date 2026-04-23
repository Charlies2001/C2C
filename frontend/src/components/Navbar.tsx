import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SettingsModal from './SettingsModal';
import ProfileSetupModal from './ProfileSetupModal';
import GrowthTree from './GrowthTree/GrowthTree';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const userProfile = useStore((s) => s.userProfile);
  const loadTreeProgress = useStore((s) => s.loadTreeProgress);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    loadTreeProgress();
  }, [loadTreeProgress]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav
        className={`h-12 backdrop-blur-xl flex items-center px-4 shrink-0 transition-colors ${
          isLanding
            ? 'bg-transparent'
            : 'bg-gray-950/80 border-b border-white/[0.06]'
        }`}
      >
        <Link to="/" className="flex items-baseline gap-2 hover:opacity-80 transition-opacity">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            C2C
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">Coding to Creating</span>
        </Link>

        <div className="ml-6 flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm transition-colors ${
              isLanding ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/problems"
            className={`text-sm transition-colors ${
              location.pathname === '/problems' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t('nav.problems')}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <GrowthTree />

          {user ? (
            <>
              <button
                onClick={() => setShowProfile(true)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                title={t('nav.preferences')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                title={t('nav.settings')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-gray-500 hidden md:inline">{user.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                title="退出登录"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 4.293a1 1 0 010 1.414L13.414 10l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0zM10 9a1 1 0 100 2h5a1 1 0 100-2h-5z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition-all"
            >
              登录
            </Link>
          )}
        </div>
      </nav>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <ProfileSetupModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        initialProfile={userProfile}
      />
    </>
  );
}
