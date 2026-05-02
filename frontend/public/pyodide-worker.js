// Dedicated Web Worker that hosts a Pyodide runtime.
// Main thread can hard-kill us via worker.terminate() when user code runs forever.
//
// Protocol (all messages have an `id` for request/reply correlation):
//   ←  { type: 'init', id, url }                        first message; loads Pyodide
//   →  { type: 'ready', id }                            init complete
//   →  { type: 'init_error', id, error }                init failed
//   ←  { type: 'run',  id, code, helperCode }           run user code
//   →  { type: 'result', id, stdout, stderr, error }    execution finished
//
// We deliberately DO NOT enforce a timeout in here — the main thread terminates us.
// That guarantees `while True: pass` cannot keep us alive past the limit.

let pyodide = null;
let initPromise = null;

self.onmessage = async (e) => {
  const m = e.data;

  if (m.type === 'init') {
    if (!initPromise) {
      initPromise = (async () => {
        self.importScripts(`${m.url}pyodide.js`);
        pyodide = await self.loadPyodide({ indexURL: m.url });
      })();
    }
    try {
      await initPromise;
      self.postMessage({ type: 'ready', id: m.id });
    } catch (err) {
      self.postMessage({ type: 'init_error', id: m.id, error: String(err && err.message || err) });
    }
    return;
  }

  if (m.type === 'run') {
    if (!pyodide) {
      self.postMessage({
        type: 'result', id: m.id,
        stdout: '', stderr: '', error: 'Pyodide not ready',
      });
      return;
    }

    // Reset stdout/stderr capture for this run.
    pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

    const fullCode = m.helperCode ? `${m.helperCode}\n${m.code}` : m.code;
    let stdout = '';
    let stderr = '';
    let error = null;
    try {
      pyodide.runPython(fullCode);
      stdout = pyodide.runPython('sys.stdout.getvalue()');
      stderr = pyodide.runPython('sys.stderr.getvalue()');
    } catch (err) {
      try { stdout = pyodide.runPython('sys.stdout.getvalue()'); } catch (_) {}
      error = (err && err.message) || String(err);
    }
    self.postMessage({
      type: 'result', id: m.id,
      stdout: typeof stdout === 'string' ? stdout.replace(/\n$/, '') : '',
      stderr: typeof stderr === 'string' ? stderr : '',
      error,
    });
  }
};
