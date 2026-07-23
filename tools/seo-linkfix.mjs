// SEO link fixes: (1) add a Reviews link to every footer that lacks one (kills the
// reviews.html orphan), (2) inject a "Keep reading" related-posts block into each
// blog post so posts cross-link (were only 1-2 inbound). Idempotent.
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

// blog post order; each links the next 3 (wrapping) -> 3 inbound sibling links each
const POSTS = [
  ['tree-fell-on-house-who-pays', 'Tree Fell on Your House: Who Pays and What to Do First'],
  ['large-hazardous-tree-removal-cost', 'Large and Hazardous Tree Removal: Cranes, Costs, and When You Need a Pro'],
  ['leaning-tree-warning-signs', 'Is That Tree Going to Fall? Leaning Trees and Warning Signs'],
  ['roof-insurance-claim-storm-damage', 'Will Insurance Replace Your Roof After Storm Damage?'],
  ['roof-tarping-guide', 'Roof Tarping After a Storm: Cost, How Long It Lasts, and Who to Call'],
  ['tree-removal-cost-georgia', 'How Much Does Tree Removal Cost in Georgia?'],
  ['attic-ventilation-signs', 'Attic Ventilation: Signs Your Roof Cannot Breathe'],
  ['new-roof-cost-guide', 'What a New Roof Really Costs (and What Drives the Price)'],
  ['water-stains-on-ceiling', 'Water Stains on the Ceiling: Roof Leak or Something Else?'],
  ['hail-damage-roof-signs', 'What Hail Damage Looks Like on a Roof'],
  ['roof-flashing-leaks', 'Roof Flashing: Where Most Leaks Actually Start'],
  ['stump-grinding-vs-stump-removal', 'Stump Grinding vs. Stump Removal: Which One Do You Need?'],
];
const relatedFor = slug => {
  const i = POSTS.findIndex(p => p[0] === slug);
  return [1, 2, 3].map(k => POSTS[(i + k) % POSTS.length]);
};

let footerFixed = 0, blogFixed = 0;
for (const f of htmlFiles()) {
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  let html = readFileSync(f, 'utf8');
  let changed = false;

  // (1) reviews link in footer Contact column
  if (!/>Read our Google reviews<\/a>/.test(html)) {
    const n = html.replace(/(\s*)(<li><a href="([^"]*)contact">Request a free estimate<\/a><\/li>)/,
      (_, ws, li, pre) => `${ws}<li><a href="${pre}reviews">Read our Google reviews</a></li>${ws}${li}`);
    if (n !== html) { html = n; changed = true; footerFixed++; }
  }

  // (2) related-posts block in blog posts
  const isPost = rel.startsWith('blog/') && rel !== 'blog/index.html';
  if (isPost && !/data-related/.test(html)) {
    const slug = rel.replace(/^blog\//, '').replace(/\.html$/, '');
    const rl = relatedFor(slug);
    const block = `
    <section>
      <div class="container" style="max-width:820px;">
        <div class="section-head">
          <span class="kicker">Keep Reading</span>
          <h2>More from the <strong>blog</strong>.</h2>
        </div>
        <ul class="prose" data-related style="display:grid; gap:12px;">
          ${rl.map(([s, t]) => `<li><a href="${s}">${t.replace(/&/g, '&amp;')}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </section>
  </main>`;
    const n = html.replace(/\n?\s*<\/main>/, block);
    if (n !== html) { html = n; changed = true; blogFixed++; }
  }

  if (changed) writeFileSync(f, html);
}
console.log(`footer reviews link added to ${footerFixed} pages; related block added to ${blogFixed} blog posts`);
