import i18n from '../i18n';
import type { UserProfile } from '../types/problem';

export interface ProviderConfig {
  provider: string;
  api_key: string;
  model: string;
}

const PROVIDER_DEFAULTS: Record<string, { defaultModel: string }> = {
  anthropic: { defaultModel: 'claude-sonnet-4-6' },
  openai:    { defaultModel: 'gpt-4o' },
  qwen:      { defaultModel: 'qwen-plus' },
  doubao:    { defaultModel: 'doubao-1.5-pro-32k-250115' },
  glm:       { defaultModel: 'glm-4-flash' },
  gemini:    { defaultModel: 'gemini-2.0-flash' },
};

export function getProviderConfig(): ProviderConfig | null {
  try {
    const stored = localStorage.getItem('ai_provider_settings');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && parsed.provider && parsed.apiKey) {
      return {
        provider: parsed.provider,
        api_key: parsed.apiKey,
        model: parsed.model || PROVIDER_DEFAULTS[parsed.provider]?.defaultModel || '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

function getUserProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem('user_profile');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && parsed.version === 1 && parsed.profile) {
      return parsed.profile;
    }
    return null;
  } catch {
    return null;
  }
}

export async function streamHint(
  problemContext: {
    title: string;
    description: string;
    code: string;
    output: string;
    testResults: string;
  },
  previousHints: { level: number; content: string }[],
  onLevel: (level: number) => void,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const res = await fetch('/api/ai/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_context: problemContext,
        previous_hints: previousHints,
        user_profile: getUserProfile(),
        provider_config: getProviderConfig(),
      }),
    });
    if (!res.ok) {
      onError(i18n.t('error.aiUnavailable'));
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) { onError(i18n.t('error.cannotReadResponse')); return; }
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.level) onLevel(parsed.level);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) onError(parsed.error);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    onError(i18n.t('error.networkError'));
  }
}

export async function streamTeaching(
  problemContext: {
    title: string;
    description: string;
    code: string;
    output: string;
    testResults: string;
  },
  onSection: (section: number, title: string) => void,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  try {
    const res = await fetch('/api/ai/teaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_context: problemContext,
        provider_config: getProviderConfig(),
      }),
      signal,
    });
    if (!res.ok) {
      onError(i18n.t('error.aiUnavailable'));
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) { onError(i18n.t('error.cannotReadResponse')); return; }
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.section && parsed.title) onSection(parsed.section, parsed.title);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) onError(parsed.error);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    onError(i18n.t('error.networkError'));
  }
}

export async function fetchTeachingSections(): Promise<{ index: number; title: string }[]> {
  const res = await fetch('/api/ai/teaching-sections');
  return res.json();
}

export async function fetchTeachingSectionsForDifficulty(
  difficulty: string
): Promise<{ index: number; title: string }[]> {
  const res = await fetch(`/api/ai/teaching-sections/${encodeURIComponent(difficulty)}`);
  return res.json();
}

export async function streamTeachingSection(
  problemContext: {
    title: string;
    description: string;
    code: string;
    output: string;
    testResults: string;
    difficulty?: string;
    starterCode?: string;
  },
  sectionIndex: number,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
  previousSections?: { title: string; content: string }[]
) {
  try {
    const res = await fetch('/api/ai/teaching-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_context: problemContext,
        section_index: sectionIndex,
        previous_sections: previousSections || [],
        user_profile: getUserProfile(),
        provider_config: getProviderConfig(),
      }),
      signal,
    });
    if (!res.ok) {
      onError(i18n.t('error.aiUnavailable'));
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) { onError(i18n.t('error.cannotReadResponse')); return; }
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) onError(parsed.error);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    onError(i18n.t('error.networkError'));
  }
}

export async function streamAIChat(
  messages: { role: string; content: string }[],
  problemContext: {
    title: string;
    description: string;
    code: string;
    output: string;
    testResults: string;
  },
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        problem_context: problemContext,
        user_profile: getUserProfile(),
        provider_config: getProviderConfig(),
      }),
    });
    if (!res.ok) {
      onError(i18n.t('error.aiUnavailable'));
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) { onError(i18n.t('error.cannotReadResponse')); return; }
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) onError(parsed.error);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    onError(i18n.t('error.networkError'));
  }
}
