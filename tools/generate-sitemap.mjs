// Generate sitemap.xml: one extensionless absolute <loc> per HTML page (404 excluded).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf8'));
const BASE = site.baseUrl.replace(/\/$/, '');
const SKIP = new Set(['data', 'docs', 'tools', '.git', 'node_modules', 'assets']);

function htmlFiles(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.has(name)) htmlFiles(p, out); }
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const urls = [];
for (const file of htmlFiles()) {
  const r = relative(ROOT, file).replace(/\\/g, '/');
  if (r === '404.html') continue;
  const path = r === 'index.html' ? '' : r.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  urls.push(`${BASE}/${path}`);
}
urls.sort();

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml written: ${urls.length} URLs`);
