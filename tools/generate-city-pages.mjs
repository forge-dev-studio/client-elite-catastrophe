// Generate service-areas/<slug>/index.html from data/cities.json.
// City pages are TREE-FIRST by spec: tree services only, exactly one storm
// sentence (comes from the hand-written narrative), no roofing links.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf8'));
const cities = JSON.parse(readFileSync(join(ROOT, 'data', 'cities.json'), 'utf8'));
const BASE = site.baseUrl.replace(/\/$/, '');

// geographically sane neighbor pairs for the sidebar
const NEIGHBORS = {
  rome: ['lindale', 'cedartown'],
  lindale: ['rome', 'cedartown'],
  cedartown: ['rockmart', 'rome'],
  rockmart: ['cedartown', 'cartersville'],
  calhoun: ['adairsville', 'rome'],
  summerville: ['rome', 'lindale'],
  adairsville: ['calhoun', 'cartersville'],
  cartersville: ['adairsville', 'rockmart'],
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const byslug = Object.fromEntries(cities.map(c => [c.slug, c]));

for (const c of cities) {
  const url = `${BASE}/service-areas/${c.slug}/`;
  const title = `${c.name}, GA Tree Service & Tree Removal | Elite Catastrophe`;
  const desc = `Tree removal, trimming, and stump grinding in ${c.name}, Georgia. Elite Catastrophe serves ${c.county} homeowners with careful tree work and 24/7 storm response.`;
  const paragraphs = c.narrative.split(/\n\n+/).map(p => `<p>${esc(p.trim())}</p>`).join('\n          ');
  const neighbors = NEIGHBORS[c.slug].map(s => byslug[s]).filter(Boolean);

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Tree Services in ${c.name}, GA`,
    serviceType: 'Tree Service',
    provider: { '@id': `${BASE}/#business` },
    areaServed: { '@type': 'City', name: `${c.name}, GA` },
    url,
  }, null, 2);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${BASE}/assets/img/logo.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../assets/css/styles.css">
  <script type="application/ld+json">
${jsonld}
  </script>
</head>
<body>

  <div class="ribbon"><span class="pulse-dot"></span>Storm damage? We answer 24/7: <a href="tel:+17066767364">(706) 676-7364</a></div>

  <header class="header">
    <div class="container header-inner">
      <a href="../../" class="logo" aria-label="Elite Catastrophe home"><span class="l1">ELITE</span><span class="l2">Catastrophe</span></a>
      <nav class="nav" aria-label="Main">
        <a href="../../services/tree-removal">Tree Removal</a>
        <a href="../../services/">All Services</a>
        <a href="../">Service Areas</a>
        <a href="../../blog/">Blog</a>
        <a href="../../about">About</a>
      </nav>
      <a href="../../contact" class="btn btn-primary">Free Estimate</a>
      <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </header>
  <nav class="mobile-nav" aria-label="Mobile">
    <a href="../../services/tree-removal">Tree Removal</a>
    <a href="../../services/">All Services</a>
    <a href="../">Service Areas</a>
    <a href="../../blog/">Blog</a>
    <a href="../../about">About</a>
    <a href="../../contact">Free Estimate</a>
    <a href="tel:+17066767364">(706) 676-7364</a>
  </nav>
  <div class="mobile-overlay"></div>

  <main>
    <section class="page-hero">
      <div class="container">
        <p class="breadcrumbs"><a href="../../">Home</a> / <a href="../">Service Areas</a> / ${esc(c.name)}</p>
        <span class="kicker">${esc(c.county)}</span>
        <h1>Tree Service in ${esc(c.name)}, Georgia</h1>
      </div>
    </section>

    <div class="container content-grid">
      <div class="prose">
        ${paragraphs}
        <h2>Tree services we bring to ${esc(c.name)}</h2>
        <ul>
          <li><a href="../../services/tree-removal">Tree removal</a>, from single problem trees to full takedowns</li>
          <li><a href="../../services/tree-trimming">Tree trimming and pruning</a> for health, clearance, and storm prep</li>
          <li><a href="../../services/stump-grinding">Stump grinding and removal</a> to finish the job properly</li>
          <li><a href="../../services/emergency-tree-service">24/7 emergency tree service</a> when it cannot wait</li>
        </ul>
        <p>Every estimate is free, and you will get a straight answer about what the job takes. Call <a href="tel:+17066767364">(706) 676-7364</a> or <a href="../../contact">request an estimate online</a>.</p>
      </div>
      <aside class="sidebar">
        <div class="side-card">
          <h3>Nearby service areas</h3>
          <ul>
            ${neighbors.map(n => `<li><a href="../${n.slug}/">${esc(n.name)}, GA</a></li>`).join('\n            ')}
            <li><a href="../">All service areas</a></li>
          </ul>
        </div>
        <div class="side-card cta">
          <h3>Talk to the crew</h3>
          <p>Free estimates in ${esc(c.name)} and across ${esc(c.county)}. Storm emergencies answered around the clock.</p>
          <a href="tel:+17066767364" class="btn btn-light">(706) 676-7364</a>
        </div>
      </aside>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <span class="logo"><span class="l1">ELITE</span><span class="l2">Catastrophe</span></span>
          <p class="tagline">Family-owned tree service and storm response, serving Rome & Northwest Georgia.</p>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li><a href="../../services/tree-removal">Tree Removal</a></li>
            <li><a href="../../services/tree-trimming">Trimming & Pruning</a></li>
            <li><a href="../../services/stump-grinding">Stump Grinding</a></li>
            <li><a href="../../services/emergency-tree-service">Emergency Tree Service</a></li>
            <li><a href="../../services/storm-damage-restoration">Storm Restoration</a></li>
            <li><a href="../../services/roof-tarping">Roof Tarping</a></li>
          </ul>
        </div>
        <div>
          <h4>Service Areas</h4>
          <ul>
            <li><a href="../rome/">Rome</a></li>
            <li><a href="../lindale/">Lindale</a></li>
            <li><a href="../cedartown/">Cedartown</a></li>
            <li><a href="../rockmart/">Rockmart</a></li>
            <li><a href="../calhoun/">Calhoun</a></li>
            <li><a href="../">All areas</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:+17066767364">(706) 676-7364</a></li>
            <li>Serving Rome & Northwest Georgia</li>
            <li>Available 24/7 for storm emergencies</li>
            <li><a href="../../contact">Request a free estimate</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Elite Catastrophe. All rights reserved.</span>
        <span>Site by <a href="https://synergytelecom.org" rel="noopener">Synergy Telecom</a></span>
      </div>
    </div>
  </footer>

  <script src="../../assets/js/main.js"></script>
</body>
</html>
`;

  mkdirSync(join(ROOT, 'service-areas', c.slug), { recursive: true });
  writeFileSync(join(ROOT, 'service-areas', c.slug, 'index.html'), html);
  console.log(`generated service-areas/${c.slug}/index.html`);
}
console.log(`done: ${cities.length} city pages`);
