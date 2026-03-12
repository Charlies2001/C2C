import i18n from '../i18n';
import type { Problem, ProblemListItem } from '../types/problem';

const BASE_URL = '/api';

export async function fetchProblems(params?: {
  difficulty?: string;
  category?: string;
}): Promise<ProblemListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params?.category) searchParams.set('category', params.category);
  const query = searchParams.toString();
  const res = await fetch(`${BASE_URL}/problems/${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch problems');
  return res.json();
}

export async function fetchProblem(id: number): Promise<Problem> {
  const res = await fetch(`${BASE_URL}/problems/${id}`);
  if (!res.ok) throw new Error('Failed to fetch problem');
  return res.json();
}

export async function generateProblem(description: string): Promise<{
  success: boolean;
  problem?: Omit<Problem, 'id'>;
  error?: string;
}> {
  // Import inline to avoid circular deps
  const { getProviderConfig } = await import('./ai');
  const res = await fetch(`${BASE_URL}/ai/generate-problem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, provider_config: getProviderConfig(), language: i18n.language }),
  });
  if (!res.ok) throw new Error('Failed to generate problem');
  return res.json();
}

export async function deleteProblem(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/problems/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete problem');
}

export async function createProblem(problem: Omit<Problem, 'id'>): Promise<Problem> {
  const res = await fetch(`${BASE_URL}/problems/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(problem),
  });
  if (res.status === 409) {
    const data = await res.json();
    throw new Error(data.detail || i18n.t('apiProblems.slugExists'));
  }
  if (!res.ok) throw new Error('Failed to create problem');
  return res.json();
}
