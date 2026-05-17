import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const detail = await requestPasswordReset(email);
      setMessage(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            找回密码
          </h1>
          <p className="text-xs text-gray-500 mt-2 px-4 leading-relaxed">
            输入注册时的邮箱。如果该邮箱已注册，我们会发送重置链接，15 分钟内有效。
          </p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
          {message ? (
            <div className="space-y-4">
              <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 text-sm text-emerald-200 leading-relaxed">
                {message}
              </div>
              <Link
                to="/auth"
                className="block text-center text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                ← 返回登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">邮箱</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
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
                disabled={loading || !email}
                className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发送中…' : '发送重置链接'}
              </button>

              <div className="text-center">
                <Link to="/auth" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  ← 返回登录
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
