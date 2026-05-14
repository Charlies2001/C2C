import { authFetch } from './auth';

const BASE_URL = '/api/submissions';

export interface SubmissionRecord {
  id: number;
  problem_id: number;
  passed_count: number;
  total_count: number;
  all_passed: boolean;
  code: string | null;
  submitted_at: string;
}

export async function createSubmission(payload: {
  problem_id: number;
  passed_count: number;
  total_count: number;
  code: string;
}): Promise<SubmissionRecord> {
  const res = await authFetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record submission');
  return res.json();
}

export async function listSubmissions(
  problemId: number,
  limit: number = 50,
): Promise<SubmissionRecord[]> {
  const res = await authFetch(`${BASE_URL}?problem_id=${problemId}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
}
