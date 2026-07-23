// Add the SVG favicon link to every page that lacks one (depth-aware). Idempotent.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['data', 'docs', 'tools', '.git', 'node_modules', 'assets']);
function htmlFiles(dir = ROOT, out = []) {
  for (const n of readdirSync(dir)) { const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!SKIP.has(n)) htmlFiles(p, out); }
    else if (n.endsWith('.html')) out.push(p); }
  return out;
}
let n = 0;
for (const f of htmlFiles()) {
  let html = readFileSync(f, 'utf8');
  if (/rel=["']icon["']/.test(html)) continue;
  const m = html.match(/href="([^"]*)assets\/css\/styles\.css"/);
  const pre = m ? m[1] : '';
  const link = `\n  <link rel="icon" href="${pre}assets/img/favicon.svg" type="image/svg+xml">`;
  const out = html.replace(/(<meta name="twitter:card"[^>]*>)/, `$1${link}`);
  if (out !== html) { writeFileSync(f, out); n++; }
}
console.log(`favicon link added to ${n} pages`);
