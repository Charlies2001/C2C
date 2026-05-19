import i18n from '../i18n';
import type { Problem, ProblemListItem } from '../types/problem';
import { authFetch } from './auth';

const BASE_URL = '/api';

export async function fetchProblems(params?: {
  difficulty?: string;
  category?: string;
}): Promise<ProblemListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params?.category) searchParams.set('category', params.category);
  const query = searchParams.toString();
  // authFetch attaches the Bearer token when logged in and is a no-op
  // (plain fetch) for guests. Without it, the server can never tell who's
  // listing — every logged-in user's private problems would be filtered out.
  const res = await authFetch(`${BASE_URL}/problems/${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch problems');
  return res.json();
}

export async function fetchProblem(id: number): Promise<Problem> {
  const res = await authFetch(`${BASE_URL}/problems/${id}`);
  if (!res.ok) throw new Error('Failed to fetch problem');
  return res.json();
}

export async function generateProblem(description: string): Promise<{
  success: boolean;
  problem?: Omit<Problem, 'id'>;
  error?: string;
}> {
  const res = await authFetch(`${BASE_URL}/ai/generate-problem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, language: i18n.language }),
  });
  if (!res.ok) throw new Error('Failed to generate problem');
  return res.json();
}

export async function fetchReferenceSolution(payload: {
  description: string;
  starter_code: string;
  helper_code: string;
}): Promise<{ success: boolean; code?: string; error?: string }> {
  const res = await authFetch(`${BASE_URL}/ai/reference-solution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to fetch reference solution');
  return res.json();
}

export async function deleteProblem(id: number): Promise<void> {
  const res = await authFetch(`${BASE_URL}/problems/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete problem');
}

export async function fixTestCase(payload: {
  problem_id: number;
  index: number;
  expected: string;
}): Promise<Problem> {
  const res = await authFetch(`${BASE_URL}/problems/${payload.problem_id}/test-cases`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index: payload.index, expected: payload.expected }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to fix test case');
  }
  return res.json();
}

export async function createProblem(problem: Omit<Problem, 'id'>): Promise<Problem> {
  const res = await authFetch(`${BASE_URL}/problems/`, {
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
