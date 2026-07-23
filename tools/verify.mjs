import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf8'));
const BASE = site.baseUrl.replace(/\/$/, '');
const BASE_RE = new RegExp(BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/[^"\'\\s<]*', 'gi');
const SKIP_DIRS = new Set(['data', 'docs', 'tools', '.git', '.github', 'node_modules', 'assets']);
const errors = [];
const fail = (f, msg) => errors.push(`${f}: ${msg}`);

function htmlFiles(dir = ROOT, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(name)) htmlFiles(p, out);
    } else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = htmlFiles();
const titles = new Map();
const descs = new Map();

// Gate 14: forbidden claims. Strict set for Elite-claims territory (core/service/city
// pages); blogs get the narrower self-claim set so honest generic advice
// ("roofs last 20 years", "ask any contractor for proof of insurance") stays legal.
const FORBIDDEN_ALL = [
  [/BBB[-\s]?accredited/i, 'BBB accreditation claim'],
  [/\bGAF\b/, 'GAF certification claim'],
  [/chamber of commerce/i, 'chamber membership claim'],
  [/veteran[-\s]owned|minority[-\s]owned/i, 'ownership-status claim'],
  [/RB\s*Roofing/i, 'RB Roofing reference'],
  [/land[-\s]clearing|lot[-\s]clearing|forestry\s*mulch/i, 'land-clearing (client conflict)'],
  [/205\s*E\.?\s*7th/i, 'private address'],
  [/we\s+(are|'re)\s+(fully\s+)?(licensed|insured)/i, 'self license/insurance claim (blocked until verified)'],
  [/our\s+licensed\b/i, 'self license claim (blocked until verified)'],
  [/licensed\s+(and|&)\s+insured/i, 'license+insurance claim (blocked until verified)'],
];
const FORBIDDEN_STRICT = [
  [/\b\d+\+?\s*years\b/i, 'tenure claim'],
  [/\blicensed\b/i, 'license claim (blocked until verified)'],
  [/\binsured\b/i, 'insurance claim (blocked until COI)'],
];

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const isBlogPost = rel.startsWith('blog/') && rel !== 'blog/index.html';

  // 1. title
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/gi) || [];
  let titleText = '';
  if (titleM.length !== 1) fail(rel, `expected 1 <title>, found ${titleM.length}`);
  else {
    titleText = titleM[0].replace(/<\/?title>/gi, '').trim();
    if (!titleText) fail(rel, 'empty <title>');
    if (titles.has(titleText)) fail(rel, `duplicate title with ${titles.get(titleText)}`);
    else titles.set(titleText, rel);
  }

  // 2. meta description
  const descM = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/gi) || [];
  let descText = '';
  if (descM.length !== 1) fail(rel, `expected 1 meta description, found ${descM.length}`);
  else {
    descText = descM[0].replace(/.*content=["']/i, '').replace(/["'].*/s, '').trim();
    if (!descText) fail(rel, 'empty meta description');
    if (descs.has(descText)) fail(rel, `duplicate meta description with ${descs.get(descText)}`);
    else descs.set(descText, rel);
  }

  // 3. canonical (absolute on the demo base; cutover swaps site.json baseUrl)
  const canAll = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)];
  if (canAll.length === 0) fail(rel, 'missing canonical');
  else if (canAll.length > 1) fail(rel, `expected 1 canonical, found ${canAll.length}`);
  else if (!canAll[0][1].startsWith(BASE + '/')) fail(rel, `canonical not on base: ${canAll[0][1]}`);

  // 12b. absolute site URLs must be extensionless
  for (const um of html.matchAll(BASE_RE)) {
    if (/\.html([?#]|$)/i.test(um[0])) fail(rel, `.html in absolute site URL: ${um[0]}`);
  }

  // 4. OG + twitter
  for (const prop of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image']) {
    if (!new RegExp(`property=["']${prop}["']`, 'i').test(html)) fail(rel, `missing ${prop}`);
  }
  if (!/name=["']twitter:card["']/i.test(html)) fail(rel, 'missing twitter:card');

  // 5. exactly one h1
  const h1 = html.match(/<h1[\s>]/gi) || [];
  if (h1.length !== 1) fail(rel, `expected 1 <h1>, found ${h1.length}`);

  // 6. JSON-LD parses; capture business names for gate 15
  const ld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let faqCount = null;
  for (const [, body] of ld) {
    try {
      const obj = JSON.parse(body.trim());
      const nodes = Array.isArray(obj) ? obj : (obj['@graph'] || [obj]);
      for (const n of nodes) {
        if (n['@type'] === 'FAQPage' && Array.isArray(n.mainEntity)) faqCount = n.mainEntity.length;
        // 15a. business entity name must equal the site name token exactly
        const types = [].concat(n['@type'] || []);
        if (types.includes('HomeAndConstructionBusiness') || types.includes('LocalBusiness')) {
          if (n.name !== site.name) fail(rel, `business schema name "${n.name}" != site token "${site.name}"`);
          if (types.includes('RoofingContractor')) fail(rel, 'RoofingContractor type is forbidden');
        }
        if (types.includes('RoofingContractor')) fail(rel, 'RoofingContractor type is forbidden');
        if (n.aggregateRating) fail(rel, 'aggregateRating blocked until testimonial verification');
      }
    } catch (e) { fail(rel, `invalid JSON-LD: ${e.message}`); }
  }

  // 10. FAQ schema count matches visible questions
  if (faqCount !== null) {
    const visible = (html.match(/class=["'][^"']*faq-question[^"']*["']/gi) || []).length;
    if (visible !== faqCount) fail(rel, `FAQ schema ${faqCount} != visible ${visible}`);
  }

  // 7 + 8 + 12. internal links: resolve, no leading slash, extensionless
  const linkRe = /(href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = linkRe.exec(html))) {
    const attr = m[1].toLowerCase();
    let url = m[2];
    if (/^(https?:|tel:|mailto:|#|data:)/i.test(url)) continue;
    if (url.startsWith('/')) { fail(rel, `leading-slash internal link: ${url}`); continue; }
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (attr === 'href' && /\.html$/i.test(clean)) fail(rel, `.html in internal link: ${url}`);
    const target = resolve(dirname(file), clean);
    let ok = false, st = null;
    try { st = statSync(target); } catch { /* not on disk as-is */ }
    if (st && st.isDirectory()) ok = existsSync(join(target, 'index.html'));
    else if (st) ok = true;
    else if (!/\.[a-z0-9]+$/i.test(clean)) ok = existsSync(target + '.html');
    if (!ok) fail(rel, `broken internal link: ${url}`);
  }

  // 16. contrast guard: bright brand orange (#ff6a00) fails as text on white (2.87:1).
  // The CSS system routes it correctly via tokens; this catches hand-added inline
  // color overrides. Orange as background/fill is fine (buttons take ink text), so
  // only flag it used as an inline text `color`.
  for (const sm of html.matchAll(/style=["'][^"']*color\s*:\s*(#ff6a00|#f60|rgb\(\s*255\s*,\s*106\s*,\s*0)/gi)) {
    fail(rel, `bright orange (#ff6a00) as inline text color fails contrast on white; use --orange-ink #c2410c`);
  }

  // 9. no em/en dashes anywhere in copy
  if (/&mdash;|&ndash;|&#8212;|&#8211;|&#x2014;|&#x2013;/i.test(html)) fail(rel, 'em/en dash entity in HTML');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');
  if (/[—–]/.test(text)) fail(rel, 'em/en dash in visible copy');

  // 14. forbidden claims on visible text + title + meta description
  const scanText = `${text} ${titleText} ${descText}`;
  for (const [re, label] of FORBIDDEN_ALL) {
    if (re.test(scanText)) fail(rel, `forbidden: ${label}`);
  }
  if (!isBlogPost) {
    for (const [re, label] of FORBIDDEN_STRICT) {
      if (re.test(scanText)) fail(rel, `forbidden: ${label}`);
    }
  }

  // 15b. street address never in visible copy (schema-only)
  if (/32\s*Paris\s*Dr/i.test(text)) fail(rel, 'street address in visible copy (schema-only rule)');

  // 11. nav + footer sentinels
  if (!/<nav[\s>]/i.test(html)) fail(rel, 'no <nav>');
  if (!/<footer[\s>]/i.test(html)) fail(rel, 'no <footer>');
}

// 13. sitemap: extensionless locs, one per page, no strays (404 excluded)
const smPath = join(ROOT, 'sitemap.xml');
if (!existsSync(smPath)) errors.push('sitemap.xml: missing');
else {
  const sm = readFileSync(smPath, 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1]);
  const locSet = new Set(locs);
  for (const loc of locs) if (/\.html$/i.test(loc)) errors.push(`sitemap.xml: .html in loc: ${loc}`);
  const expected = new Set();
  for (const file of files) {
    const r = relative(ROOT, file).replace(/\\/g, '/');
    if (r === '404.html') continue;
    const path = r === 'index.html' ? '' : r.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    expected.add(BASE + '/' + path);
  }
  for (const u of expected) if (!locSet.has(u)) errors.push(`sitemap.xml: missing ${u}`);
  for (const u of locs) if (!expected.has(u)) errors.push(`sitemap.xml: stray ${u}`);
}

if (errors.length) {
  console.error(`✗ verify failed (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ verify passed: ${files.length} pages`);
