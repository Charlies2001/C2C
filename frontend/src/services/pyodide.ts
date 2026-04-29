import i18n from '../i18n';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

// Pyodide source — overridable at build time so the desktop bundle can ship its own
// copy and run fully offline. Defaults to the public CDN for web/dev builds.
// To use a local copy: run `npm run fetch-pyodide` then build with
// VITE_PYODIDE_URL=/pyodide/ to load from same-origin.
const PYODIDE_URL = (
  import.meta.env.VITE_PYODIDE_URL ||
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/'
).replace(/\/?$/, '/');

let pyodide: any = null;
let loadPromise: Promise<any> | null = null;

export async function initPyodide(): Promise<any> {
  if (pyodide) return pyodide;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${PYODIDE_URL}pyodide.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide'));
        document.head.appendChild(script);
      });
    }
    pyodide = await window.loadPyodide({ indexURL: PYODIDE_URL });
    return pyodide;
  })();

  return loadPromise;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
}

export async function runPythonCode(
  code: string,
  helperCode: string = '',
  timeoutMs: number = 10000
): Promise<ExecutionResult> {
  const py = await initPyodide();

  // Reset stdout/stderr capture
  py.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

  const fullCode = helperCode ? `${helperCode}\n${code}` : code;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        stdout: '',
        stderr: '',
        error: i18n.t('execution.timeout'),
      });
    }, timeoutMs);

    try {
      py.runPython(fullCode);
      clearTimeout(timer);
      const stdout = py.runPython('sys.stdout.getvalue()') as string;
      const stderr = py.runPython('sys.stderr.getvalue()') as string;
      resolve({ stdout: stdout.trimEnd(), stderr, error: null });
    } catch (err: any) {
      clearTimeout(timer);
      const stdout = py.runPython('sys.stdout.getvalue()') as string;
      resolve({
        stdout: stdout.trimEnd(),
        stderr: '',
        error: err.message || String(err),
      });
    }
  });
}
