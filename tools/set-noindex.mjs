// Toggle a demo-wide noindex based on data/site.json "noindex" flag.
// When true, every page (except 404, which manages its own) gets
// <meta name="robots" content="noindex, nofollow"> so the github.io demo does not
// get indexed and clash with the real domain at cutover. Set noindex:false and
// re-run at cutover to strip it. Idempotent.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf8'));
const ON = site.noindex === true;
const TAG = '  <meta name="robots" content="noindex, nofollow">\n';
const SKIP = new Set(['data', 'docs', 'tools', '.git', 'node_modules', 'assets']);
function htmlFiles(dir = ROOT, out = []) {
  for (const n of readdirSync(dir)) { const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!SKIP.has(n)) htmlFiles(p, out); }
    else if (n.endsWith('.html')) out.push(p); }
  return out;
}

let added = 0, removed = 0;
for (const f of htmlFiles()) {
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  if (rel === '404.html') continue; // keeps its own noindex
  let html = readFileSync(f, 'utf8');
  const has = html.includes('content="noindex, nofollow"');
  if (ON && !has) {
    const n = html.replace(/(<meta name="viewport"[^>]*>\n)/, `$1${TAG}`);
    if (n !== html) { writeFileSync(f, n); added++; }
  } else if (!ON && has) {
    const n = html.replace(new RegExp(TAG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '');
    if (n !== html) { writeFileSync(f, n); removed++; }
  }
}
console.log(`noindex ${ON ? 'ON' : 'OFF'}: added ${added}, removed ${removed} (404 excluded)`);
