import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const init = useAuthStore((s) => s.init);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      // resetPassword saved tokens; re-init store to pick up the new user.
      await init();
      navigate('/problems');
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置失败');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-gray-400 mb-4">链接无效或已损坏。</p>
          <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300">
            重新申请重置链接
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            设置新密码
          </h1>
          <p className="text-xs text-gray-500 mt-2">至少 6 位</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">新密码</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="w-full px-3 py-2.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">再次输入</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="再输一次"
                className="w-full px-3 py-2.5 bg-gray-950/60 border border-white/[0.06] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '提交中…' : '设置新密码并登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
