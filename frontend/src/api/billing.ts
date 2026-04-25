import { authFetch } from './auth';

const BASE = '/api/billing';

export type BillingStatus = 'trial' | 'active' | 'expired';

export interface BillingMe {
  status: BillingStatus;
  plan: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  entitled: boolean;
}

export interface PaymentProvider {
  id: 'alipay' | 'wechat';
  name: string;
  available: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price_cents: number;
  duration_days: number;
  features: string[];
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface CheckoutResponse {
  order_no: string;
  provider: 'alipay' | 'wechat';
  plan: string;
  amount_cents: number;
  qr_code_url: string;
  expires_at: string;
}

export interface OrderResponse {
  order_no: string;
  provider: 'alipay' | 'wechat';
  plan: string;
  amount_cents: number;
  status: OrderStatus;
  qr_code_url: string | null;
  paid_at: string | null;
  expires_at: string | null;
}

export async function fetchBillingMe(): Promise<BillingMe> {
  const res = await authFetch(`${BASE}/me`);
  if (!res.ok) throw new Error('获取订阅状态失败');
  return res.json();
}

export async function fetchPlans(): Promise<Plan[]> {
  const res = await authFetch(`${BASE}/plans`);
  if (!res.ok) throw new Error('获取套餐失败');
  return res.json();
}

export async function fetchPaymentProviders(): Promise<PaymentProvider[]> {
  const res = await authFetch(`${BASE}/providers`);
  if (!res.ok) throw new Error('获取支付渠道失败');
  return res.json();
}

export async function createCheckout(provider: 'alipay' | 'wechat', plan = 'monthly'): Promise<CheckoutResponse> {
  const res = await authFetch(`${BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, plan }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || '创建订单失败');
  }
  return res.json();
}

export async function fetchOrder(orderNo: string): Promise<OrderResponse> {
  const res = await authFetch(`${BASE}/orders/${orderNo}`);
  if (!res.ok) throw new Error('获取订单失败');
  return res.json();
}
