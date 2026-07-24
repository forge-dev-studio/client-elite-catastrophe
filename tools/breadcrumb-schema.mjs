// Inject BreadcrumbList JSON-LD built from each page's visible .breadcrumbs trail.
// Enhances SERP rich results (breadcrumb trail). Idempotent.
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
  let h = readFileSync(f, 'utf8');
  if (/"@type":\s*"BreadcrumbList"/.test(h)) continue;
  const bc = h.match(/class="breadcrumbs"[^>]*>([\s\S]*?)<\/(?:p|nav)>/i);
  if (!bc) continue;
  const canonical = (h.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
  if (!canonical) continue;
  const inner = bc[1];
  const links = [...inner.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], name: m[2].replace(/<[^>]+>/g, '').trim() }));
  const tail = inner.split(/<\/a>/).pop().replace(/<[^>]+>/g, '').replace(/[\/\s]+/g, ' ').trim();
  const items = [];
  let pos = 1;
  for (const l of links) {
    let url; try { url = new URL(l.href, canonical).href; } catch { url = canonical; }
    items.push({ '@type': 'ListItem', position: pos++, name: l.name, item: url });
  }
  if (tail) items.push({ '@type': 'ListItem', position: pos++, name: tail, item: canonical });
  if (items.length < 2) continue;
  const ld = '  <script type="application/ld+json">\n' +
    JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }, null, 2) +
    '\n  </script>\n';
  h = h.replace(/<\/head>/, ld + '</head>');
  writeFileSync(f, h); n++;
}
console.log(`BreadcrumbList schema injected into ${n} pages`);
