import { authFetch } from './auth';

export interface ProblemNote {
  problem_id: number;
  content: string;
  updated_at: string | null;
}

export async function fetchNote(problemId: number): Promise<ProblemNote> {
  const res = await authFetch(`/api/notes/${problemId}`);
  if (!res.ok) throw new Error('获取笔记失败');
  return res.json();
}

export async function saveNote(problemId: number, content: string): Promise<ProblemNote> {
  const res = await authFetch(`/api/notes/${problemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || '保存笔记失败');
  }
  return res.json();
}
