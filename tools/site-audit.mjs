// Broad site health audit: performance, a11y, technical hygiene, consistency.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const ROOT = '/home/adminsynergycloud/client-elite-catastrophe';
const SKIP = new Set(['data', 'docs', 'tools', '.git', 'node_modules']);
function walk(dir, ext, out = []) {
  for (const n of readdirSync(dir)) { const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!SKIP.has(n)) walk(p, ext, out); }
    else if (n.endsWith(ext)) out.push(p); }
  return out;
}
const rel = f => relative(ROOT, f).replace(/\\/g, '/');
const htmls = walk(ROOT, '.html').filter(f => !f.includes('/assets/'));

console.log('===== PERFORMANCE: image assets =====');
const imgs = readdirSync(join(ROOT, 'assets/img')).filter(n => /\.(jpg|jpeg|png)$/i.test(n));
let heavy = 0;
for (const n of imgs) {
  const kb = statSync(join(ROOT, 'assets/img', n)).size / 1024;
  if (kb > 200) { heavy++; console.log(`  ${kb.toFixed(0).padStart(5)}KB  ${n}${kb > 400 ? '  <-- HEAVY' : ''}`); }
}
console.log(`  ${imgs.length} images, ${heavy} over 200KB`);

console.log('\n===== PERFORMANCE / CLS: <img> attributes =====');
let noLazy = 0, noDims = 0, noAlt = 0, totalImg = 0;
for (const f of htmls) {
  const h = readFileSync(f, 'utf8');
  for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
    totalImg++;
    const t = m[0];
    if (!/loading=/.test(t)) noLazy++;
    if (!/width=/.test(t) || !/height=/.test(t)) noDims++;
    if (!/alt=/.test(t)) noAlt++;
  }
}
console.log(`  ${totalImg} <img> total | no loading=lazy: ${noLazy} | missing width/height: ${noDims} | missing alt: ${noAlt}`);

console.log('\n===== ACCESSIBILITY =====');
let noLang = 0, skipLink = 0, h1bad = 0, headingSkips = 0;
for (const f of htmls) {
  const h = readFileSync(f, 'utf8');
  if (!/<html[^>]*\blang=/.test(h)) noLang++;
  if (/skip.*content|#main|sr-only.*skip/i.test(h)) skipLink++;
  const h1 = (h.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) { h1bad++; }
  // heading order: collect levels in body, flag a jump >1
  const body = (h.match(/<body[\s\S]*<\/body>/i) || [''])[0];
  const levels = [...body.matchAll(/<h([1-6])[\s>]/gi)].map(m => +m[1]);
  let prev = 0, skip = false;
  for (const l of levels) { if (prev && l > prev + 1) skip = true; prev = l; }
  if (skip) headingSkips++;
}
console.log(`  missing lang: ${noLang} | pages w/ skip-link: ${skipLink}/${htmls.length} | pages w/ h1!=1: ${h1bad} | pages w/ heading-level skips: ${headingSkips}`);

console.log('\n===== TECHNICAL HYGIENE =====');
let dupId = 0, emptyHref = 0, twImg = 0, breadcrumbLd = 0;
for (const f of htmls) {
  const h = readFileSync(f, 'utf8');
  const ids = [...h.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) { dupId++; }
  if (/href="#"|href=""/.test(h)) emptyHref++;
  if (/name="twitter:image"/.test(h)) twImg++;
  if (/"@type":\s*"BreadcrumbList"/.test(h)) breadcrumbLd++;
}
console.log(`  pages w/ duplicate id: ${dupId} | empty/# href: ${emptyHref} | pages w/ twitter:image: ${twImg}/${htmls.length} | pages w/ BreadcrumbList schema: ${breadcrumbLd}/${htmls.length}`);

console.log('\n===== CONSISTENCY / STALE DATA =====');
let oldPhone = 0, rev76 = 0;
for (const f of htmls) {
  const h = readFileSync(f, 'utf8');
  if (/706[^0-9]{0,3}676[^0-9]{0,3}7364|\(706\)/.test(h)) { oldPhone++; console.log(`  OLD PHONE in ${rel(f)}`); }
  if (/\b76\b\s*(google\s*)?reviews|across 76/i.test(h)) { rev76++; console.log(`  "76 reviews" in ${rel(f)} (badge shows 77)`); }
}
console.log(`  old-phone refs: ${oldPhone} | stale "76 reviews": ${rev76}`);

console.log('\n===== FONT LOADING =====');
const home = readFileSync(join(ROOT, 'index.html'), 'utf8');
console.log(`  preconnect googleapis: ${/preconnect.*googleapis/.test(home)} | font-display swap: ${/display=swap/.test(home)} | preload font: ${/rel="preload".*font/.test(home)}`);
