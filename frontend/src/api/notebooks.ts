import { authFetch } from './auth';

export interface NotebookSummary {
  id: number;
  name: string;
  description: string;
  color: string;
  item_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotebookItem {
  id: number;
  problem_id: number;
  problem_title: string;
  problem_slug: string;
  problem_difficulty: string;
  problem_category: string;
  note: string;
  answer_code: string;
  include_answer: boolean;
  position: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotebookDetail {
  id: number;
  name: string;
  description: string;
  color: string;
  items: NotebookItem[];
  created_at: string | null;
  updated_at: string | null;
}

const BASE = '/api/notebooks';

export async function listNotebooks(): Promise<NotebookSummary[]> {
  const res = await authFetch(`${BASE}/`);
  if (!res.ok) throw new Error('获取笔记本失败');
  return res.json();
}

export async function createNotebook(name: string, description = '', color = 'violet'): Promise<NotebookSummary> {
  const res = await authFetch(`${BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, color }),
  });
  if (!res.ok) throw new Error('创建笔记本失败');
  return res.json();
}

export async function getNotebook(id: number): Promise<NotebookDetail> {
  const res = await authFetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('获取笔记本失败');
  return res.json();
}

export async function updateNotebook(
  id: number,
  patch: { name?: string; description?: string; color?: string }
): Promise<NotebookSummary> {
  const res = await authFetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('更新笔记本失败');
  return res.json();
}

export async function deleteNotebook(id: number): Promise<void> {
  const res = await authFetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除笔记本失败');
}

export async function addItem(
  notebookId: number,
  payload: { problem_id: number; include_answer: boolean; answer_code?: string; note?: string }
): Promise<NotebookItem> {
  const res = await authFetch(`${BASE}/${notebookId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || '添加题目失败');
  }
  return res.json();
}

export async function updateItem(
  notebookId: number,
  itemId: number,
  patch: { note?: string; answer_code?: string; include_answer?: boolean; position?: number }
): Promise<NotebookItem> {
  const res = await authFetch(`${BASE}/${notebookId}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('更新条目失败');
  return res.json();
}

export async function deleteItem(notebookId: number, itemId: number): Promise<void> {
  const res = await authFetch(`${BASE}/${notebookId}/items/${itemId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除条目失败');
}
