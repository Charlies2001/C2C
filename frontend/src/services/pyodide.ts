import i18n from '../i18n';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

let pyodide: any = null;
let loading = false;
let loadPromise: Promise<any> | null = null;

export async function initPyodide(): Promise<any> {
  if (pyodide) return pyodide;
  if (loadPromise) return loadPromise;

  loading = true;
  loadPromise = (async () => {
    // Load the script if not already loaded
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide'));
        document.head.appendChild(script);
      });
    }
    pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/',
    });
    loading = false;
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
