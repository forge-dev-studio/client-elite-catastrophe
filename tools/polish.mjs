// Perf + a11y + technical polish (idempotent, all pages):
//  1. loading="lazy" on below-fold imgs; loading="eager" on above-fold hero/article-hero
//  2. twitter:image = og:image
//  3. footer column headings h4 -> h3 (fixes content-h2 -> footer-h4 heading-level skip)
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
let lazy = 0, tw = 0, foot = 0;
for (const f of htmlFiles()) {
  let h = readFileSync(f, 'utf8'); const before = h;

  // 1. loading on <img> (skip if already set)
  h = h.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, (m, attrs, off, str) => {
    const ctx = str.slice(Math.max(0, off - 220), off);
    const eager = /hero-media|article-hero/.test(ctx);
    lazy++;
    return `<img loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''}${attrs}>`;
  });

  // 2. twitter:image from og:image
  if (!/name="twitter:image"/.test(h)) {
    const og = (h.match(/property="og:image"\s+content="([^"]+)"/) || [])[1];
    if (og) { h = h.replace(/(<meta name="twitter:card"[^>]*>)/, `$1\n  <meta name="twitter:image" content="${og}">`); tw++; }
  }

  // 3. footer h4 -> h3 (only inside <footer>)
  h = h.replace(/<footer[\s\S]*?<\/footer>/i, blk => {
    if (/<h4[\s>]/.test(blk)) foot++;
    return blk.replace(/<h4>/g, '<h3>').replace(/<\/h4>/g, '</h3>');
  });

  if (h !== before) writeFileSync(f, h);
}
console.log(`polish: loading set on ${lazy} imgs | twitter:image added to ${tw} pages | footer h4->h3 in ${foot} pages`);
