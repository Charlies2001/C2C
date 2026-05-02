import i18n from '../i18n';

// Pyodide source — overridable at build time so the desktop bundle can ship its own
// copy and run fully offline. Defaults to the public CDN for web/dev builds.
// To use a local copy: run `npm run fetch-pyodide` then build with
// VITE_PYODIDE_URL=/pyodide/ to load from same-origin.
const PYODIDE_URL = (
  import.meta.env.VITE_PYODIDE_URL ||
  'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/'
).replace(/\/?$/, '/');

// ─── Worker management ───
//
// We host Pyodide in a dedicated Web Worker so the main thread never blocks.
// On execution timeout we terminate the worker and create a fresh one — this
// is the only reliable way to stop `while True: pass`.

let worker: Worker | null = null;
let initPromise: Promise<void> | null = null;
let nextRequestId = 1;
const pendingRequests = new Map<number, (msg: any) => void>();

function spawnWorker(): Worker {
  const w = new Worker('/pyodide-worker.js');
  w.onmessage = (e) => {
    const { id } = e.data;
    const cb = pendingRequests.get(id);
    if (cb) {
      pendingRequests.delete(id);
      cb(e.data);
    }
  };
  w.onerror = (e) => {
    // A worker-level crash invalidates all in-flight requests.
    for (const cb of pendingRequests.values()) {
      cb({ type: 'result', stdout: '', stderr: '', error: e.message || 'Pyodide worker crashed' });
    }
    pendingRequests.clear();
  };
  return w;
}

export async function initPyodide(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    worker = spawnWorker();
    const id = nextRequestId++;
    await new Promise<void>((resolve, reject) => {
      pendingRequests.set(id, (msg) => {
        if (msg.type === 'ready') resolve();
        else reject(new Error(msg.error || 'Failed to load Pyodide'));
      });
      worker!.postMessage({ type: 'init', id, url: PYODIDE_URL });
    });
  })();
  // If init fails we still want a chance to retry next call.
  initPromise.catch(() => { initPromise = null; worker?.terminate(); worker = null; });
  return initPromise;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
}

export async function runPythonCode(
  code: string,
  helperCode: string = '',
  timeoutMs: number = 10000,
): Promise<ExecutionResult> {
  await initPyodide();

  return new Promise<ExecutionResult>((resolve) => {
    const id = nextRequestId++;
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (r: ExecutionResult) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      pendingRequests.delete(id);
      resolve(r);
    };

    pendingRequests.set(id, (msg) => {
      finish({
        stdout: msg.stdout || '',
        stderr: msg.stderr || '',
        error: msg.error ?? null,
      });
    });

    timer = setTimeout(() => {
      // Hard-kill: terminate worker so an infinite loop can't survive,
      // then spawn a fresh one for the next call.
      worker?.terminate();
      worker = null;
      initPromise = null;
      // Other in-flight requests (rare) become void; they'll resolve as timeouts.
      for (const [, cb] of pendingRequests) {
        cb({ type: 'result', stdout: '', stderr: '', error: i18n.t('execution.timeout') });
      }
      pendingRequests.clear();
      finish({ stdout: '', stderr: '', error: i18n.t('execution.timeout') });
    }, timeoutMs);

    try {
      worker!.postMessage({ type: 'run', id, code, helperCode });
    } catch (e: any) {
      finish({ stdout: '', stderr: '', error: e?.message || 'Failed to dispatch to Pyodide worker' });
    }
  });
}
