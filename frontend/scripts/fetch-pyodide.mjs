// Download Pyodide runtime to public/pyodide/ so the app can run fully offline.
// Usage: `npm run fetch-pyodide` — idempotent, skips existing files.
//
// We only download the core files needed to bootstrap and run pure-Python user
// code. Optional packages (numpy, pandas, etc.) are loaded lazily by Pyodide
// from the same indexURL, so users WILL still need internet for those.
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYODIDE_VERSION = '0.27.5';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'pyodide');

const CORE_FILES = [
  'pyodide.js',
  'pyodide.mjs',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
  'package.json',
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(destPath);
          return download(res.headers.location, destPath).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (err) => {
        file.close();
        try { fs.unlinkSync(destPath); } catch { /* ignore */ }
        reject(err);
      });
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Pyodide ${PYODIDE_VERSION} → ${OUT_DIR}`);
  for (const name of CORE_FILES) {
    const dest = path.join(OUT_DIR, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log(`  ✓ ${name} (cached)`);
      continue;
    }
    process.stdout.write(`  ↓ ${name} ... `);
    try {
      await download(BASE + name, dest);
      const sz = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
      console.log(`${sz} MB`);
    } catch (e) {
      console.log(`FAILED (${e.message})`);
      process.exitCode = 1;
    }
  }
  console.log('Done.');
}

main();
