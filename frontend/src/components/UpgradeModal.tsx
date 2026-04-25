import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  type CheckoutResponse,
  type OrderStatus,
  type PaymentProvider,
  type Plan,
  createCheckout,
  fetchOrder,
  fetchPaymentProviders,
  fetchPlans,
} from '../api/billing';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpgradeModal({ open, onClose, onSuccess }: Props) {
  const { refreshUser } = useAuthStore();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'alipay' | 'wechat' | ''>('');
  const [order, setOrder] = useState<CheckoutResponse | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    if (!open) return;
    setError('');
    setOrder(null);
    setOrderStatus('pending');
    Promise.all([fetchPaymentProviders(), fetchPlans()])
      .then(([provs, pls]) => {
        setProviders(provs);
        setPlans(pls);
        const firstAvailable = provs.find((p) => p.available);
        if (firstAvailable) setSelectedProvider(firstAvailable.id);
      })
      .catch((e) => setError(e.message));
  }, [open]);

  // Poll order status while pending
  useEffect(() => {
    if (!order || orderStatus !== 'pending') return;
    const timer = setInterval(async () => {
      try {
        const fresh = await fetchOrder(order.order_no);
        setOrderStatus(fresh.status);
        if (fresh.status === 'paid') {
          await refreshUser();
          onSuccess?.();
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [order, orderStatus, refreshUser, onSuccess]);

  if (!open) return null;

  const monthlyPlan = plans.find((p) => p.id === 'monthly');
  const priceYuan = monthlyPlan ? (monthlyPlan.price_cents / 100).toFixed(2) : '—';

  const handleCheckout = async () => {
    if (!selectedProvider) return;
    setLoading(true);
    setError('');
    try {
      const result = await createCheckout(selectedProvider);
      setOrder(result);
      setOrderStatus('pending');
    } catch (e: any) {
      setError(e.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-6 border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-100 mb-1">升级到月订阅</h2>
        <p className="text-xs text-gray-500 mb-5">¥{priceYuan} / 月 · 无限次 AI 提示与教学</p>

        {!order && (
          <>
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">选择支付方式</label>
              <div className="flex flex-col gap-2">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    disabled={!p.available}
                    onClick={() => setSelectedProvider(p.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                      selectedProvider === p.id
                        ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                        : 'border-white/[0.08] text-gray-300 hover:border-white/[0.15]'
                    } ${!p.available ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span>{p.name}</span>
                    {!p.available && <span className="text-[10px] text-gray-500">未启用</span>}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="text-xs text-rose-400 mb-3">{error}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                取消
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || !selectedProvider || !providers.find((p) => p.id === selectedProvider)?.available}
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? '创建订单中...' : '生成支付二维码'}
              </button>
            </div>
          </>
        )}

        {order && orderStatus === 'pending' && (
          <div className="text-center">
            <div className="bg-white p-4 inline-block rounded-xl mb-3">
              <QRCodeSVG value={order.qr_code_url} size={200} level="M" />
            </div>
            <p className="text-sm text-gray-300 mb-1">
              使用{order.provider === 'alipay' ? '支付宝' : '微信'}扫码支付
            </p>
            <p className="text-xs text-gray-500 mb-3">订单号 {order.order_no.slice(0, 16)}…</p>
            <p className="text-xs text-amber-400 mb-4">支付完成后页面会自动刷新</p>
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
              稍后再说
            </button>
          </div>
        )}

        {order && orderStatus === 'paid' && (
          <div className="text-center py-4">
            <div className="text-emerald-400 text-4xl mb-2">✓</div>
            <p className="text-base text-gray-100 mb-1">支付成功</p>
            <p className="text-xs text-gray-500 mb-4">订阅已激活，感谢支持！</p>
            <button onClick={onClose} className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl">
              开始使用
            </button>
          </div>
        )}

        {order && (orderStatus === 'expired' || orderStatus === 'failed') && (
          <div className="text-center py-4">
            <div className="text-rose-400 text-4xl mb-2">✗</div>
            <p className="text-sm text-gray-200 mb-1">
              {orderStatus === 'expired' ? '订单已过期' : '支付失败'}
            </p>
            <p className="text-xs text-gray-500 mb-4">请重新创建订单</p>
            <button
              onClick={() => { setOrder(null); setOrderStatus('pending'); }}
              className="px-4 py-1.5 text-sm bg-violet-600 text-white rounded-xl"
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
