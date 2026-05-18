// Dedicated Web Worker that hosts a Pyodide runtime.
// Main thread can hard-kill us via worker.terminate() when user code runs forever.
//
// Protocol (all messages have an `id` for request/reply correlation):
//   ←  { type: 'init', id, url }                            first message; loads Pyodide
//   →  { type: 'ready', id }                                init complete
//   →  { type: 'init_error', id, error }                    init failed
//   ←  { type: 'prepare', id, code, helperCode }            scan imports + loadPackage (untimed)
//   →  { type: 'prepared', id, loaded, error? }            prepare done; loaded = [pkgs]
//   ←  { type: 'run',  id, code, helperCode }               run user code
//   →  { type: 'result', id, stdout, stderr, error }        execution finished
//
// We deliberately DO NOT enforce a timeout in here — the main thread terminates us.
// That guarantees `while True: pass` cannot keep us alive past the limit.

// ─── Python stdlib (truncated to common ones) ──────────────────────────
// Imports of these are not packages — skip loading.
const STDLIB = new Set([
  '__future__', '_ast', 'abc', 'argparse', 'array', 'ast', 'asyncio', 'base64',
  'bisect', 'builtins', 'cmath', 'collections', 'concurrent', 'contextlib',
  'contextvars', 'copy', 'copyreg', 'csv', 'ctypes', 'dataclasses', 'datetime',
  'decimal', 'difflib', 'dis', 'enum', 'errno', 'fnmatch', 'fractions',
  'functools', 'gc', 'getopt', 'gettext', 'glob', 'graphlib', 'gzip', 'hashlib',
  'heapq', 'hmac', 'html', 'http', 'imaplib', 'importlib', 'inspect', 'io',
  'ipaddress', 'itertools', 'json', 'keyword', 'linecache', 'locale', 'logging',
  'lzma', 'math', 'mimetypes', 'multiprocessing', 'numbers', 'operator', 'os',
  'pathlib', 'pickle', 'platform', 'posix', 'posixpath', 'pprint', 'queue',
  'random', 're', 'reprlib', 'secrets', 'select', 'shutil', 'signal', 'site',
  'smtplib', 'socket', 'sqlite3', 'ssl', 'stat', 'statistics', 'string',
  'struct', 'subprocess', 'sys', 'tarfile', 'tempfile', 'textwrap', 'threading',
  'time', 'timeit', 'token', 'tokenize', 'traceback', 'tracemalloc', 'types',
  'typing', 'unicodedata', 'unittest', 'urllib', 'uuid', 'warnings', 'weakref',
  'xml', 'zipfile', 'zlib',
]);

// import name (left of `import` / `from`) → Pyodide package name.
// Pyodide has ~150 packages; we list the ones most relevant for ML / data /
// algorithm prep. Full list: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
const PYODIDE_PACKAGES = {
  numpy: 'numpy',
  pandas: 'pandas',
  scipy: 'scipy',
  sklearn: 'scikit-learn',
  matplotlib: 'matplotlib',
  sympy: 'sympy',
  networkx: 'networkx',
  PIL: 'Pillow',
  pillow: 'Pillow',
  statsmodels: 'statsmodels',
  nltk: 'nltk',
  bs4: 'beautifulsoup4',
  lxml: 'lxml',
  yaml: 'pyyaml',
  regex: 'regex',
  pydantic: 'pydantic',
  pytz: 'pytz',
  shapely: 'shapely',
  cvxpy: 'cvxpy',
  cython: 'cython',
};

// Helpful messages for popular-but-impossible imports.
// Keys are import names. Values are guidance text shown to the user.
const UNSUPPORTED = {
  torch: 'PyTorch 没有 WebAssembly 编译版本，浏览器内跑不了。深度学习面试题可用 numpy 手撕反向传播、矩阵运算；若必须用 torch，请在本地 Python 环境运行。',
  tensorflow: 'TensorFlow 没有 WebAssembly 编译版本，浏览器内跑不了。numpy / scikit-learn 能覆盖大部分经典 ML 题。',
  keras: 'Keras 依赖 TensorFlow，浏览器内不可用。',
  transformers: 'HuggingFace transformers 依赖 PyTorch/TensorFlow，浏览器内不可用。',
  jax: 'JAX 没有 WASM 编译版本，浏览器内不可用。',
  xgboost: 'XGBoost 在浏览器内不可用。同类 boosting 用 sklearn.ensemble.GradientBoostingClassifier。',
  lightgbm: 'LightGBM 在浏览器内不可用。同类 boosting 用 sklearn.ensemble.GradientBoostingClassifier。',
  requests: 'requests 需要网络 socket 权限，浏览器沙盒中禁用。算法题里把 HTTP 调用替换成函数测试即可。',
  urllib3: '同 requests，浏览器无 socket 权限。',
  httpx: '同 requests，浏览器无 socket 权限。',
  aiohttp: '同 requests，浏览器无 socket 权限。',
  psycopg2: '数据库驱动浏览器内不可用。如果是数据题，把数据用 list/dict 直接初始化。',
  django: 'Django 是 Web 框架，浏览器内不可用。',
  flask: 'Flask 是 Web 框架，浏览器内不可用。',
  fastapi: 'FastAPI 是 Web 框架，浏览器内不可用。',
};

// Match the package portion of `import X`, `import X as Y`, `from X import Y`,
// `from X.Y import Z`. We only take the top-level package name.
const IMPORT_RE = /^\s*(?:from|import)\s+([\w.]+)/gm;

function scanImports(code) {
  const names = new Set();
  IMPORT_RE.lastIndex = 0;
  let m;
  while ((m = IMPORT_RE.exec(code))) {
    names.add(m[1].split('.')[0]);
  }
  return [...names];
}

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

  if (m.type === 'prepare') {
    if (!pyodide) {
      self.postMessage({ type: 'prepared', id: m.id, loaded: [], error: 'Pyodide not ready' });
      return;
    }
    const fullCode = m.helperCode ? `${m.helperCode}\n${m.code}` : m.code;
    const imports = scanImports(fullCode);

    const toLoad = [];
    for (const name of imports) {
      if (STDLIB.has(name)) continue;
      if (PYODIDE_PACKAGES[name]) {
        toLoad.push(PYODIDE_PACKAGES[name]);
      } else if (UNSUPPORTED[name]) {
        self.postMessage({
          type: 'prepared', id: m.id, loaded: [],
          error: `${name} 在浏览器内不可用 — ${UNSUPPORTED[name]}`,
        });
        return;
      }
      // Unknown packages → let Python's normal ModuleNotFoundError surface during exec.
    }

    const unique = [...new Set(toLoad)];
    if (unique.length === 0) {
      self.postMessage({ type: 'prepared', id: m.id, loaded: [] });
      return;
    }

    try {
      await pyodide.loadPackage(unique);
      self.postMessage({ type: 'prepared', id: m.id, loaded: unique });
    } catch (err) {
      self.postMessage({
        type: 'prepared', id: m.id, loaded: [],
        error: `加载包失败 (${unique.join(', ')}): ${(err && err.message) || err}`,
      });
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
