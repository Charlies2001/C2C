import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Banner shown after successful password reset — comes from
  // ResetPasswordPage via router state, dismissed when user starts typing.
  const justReset = (location.state as { passwordReset?: boolean } | null)?.passwordReset === true;
  const [showResetBanner, setShowResetBanner] = useState(justReset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!nickname.trim()) { setError('请输入昵称'); setLoading(false); return; }
        await register(email, password, nickname);
      }
      navigate('/problems');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            C2C
          </h1>
          <p className="text-gray-500 text-sm mt-1">Coding to Creating</p>
          <p className="text-gray-600 text-[11px] mt-0.5 tracking-wide">by shiningwood · 烁楠</p>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed px-4">
            {isLogin
              ? '欢迎回来。登录后即可使用 AI 助教、教学、提示等功能。'
              : '注册解锁 AI 教学 / 助教 / 提示，多设备同步笔记和刷题记录。'}
          </p>
        </div>

        {showResetBanner && (
          <div className="mb-4 px-4 py-3 bg-emerald-900/20 border border-emerald-700/30 rounded-xl text-sm text-emerald-200 leading-relaxed">
            ✓ 密码已重置，请用新密码登录。
          </div>
        )}

        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
          {/* Tab switcher */}
          <div role="tablist" aria-label="登录或注册" className="flex mb-6 bg-gray-800/50 rounded-xl p-1">
            <button
              role="tab"
              type="button"
              aria-selected={isLogin}
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                isLogin
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              登录
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={!isLogin}
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                !isLogin
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                  placeholder="你的昵称"
                  maxLength={100}
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                邮箱 <span className="text-gray-600 text-xs ml-1">用于登录和后续找回密码</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (showResetBanner) setShowResetBanner(false); }}
                required
                className="w-full px-3 py-2.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                placeholder={isLogin ? '输入密码' : '至少 6 位'}
              />
            </div>

            {error && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>

            {isLogin && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-violet-300 transition-colors">
                  忘记密码？
                </Link>
              </div>
            )}
          </form>

          {!isLogin && (
            <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
              注册即同意我们以最小化方式存储邮箱、加密密码（bcrypt）和你后续可选填的
              API Key（Fernet 加密）。前端任何位置都看不到这些明文。
            </p>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/problems" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            先以游客模式逛逛 →
          </Link>
        </div>
      </div>
    </div>
  );
}
