// Generate the full service-area tree from data/cities.json + data/counties.json:
//   service-areas/index.html                (hub, grouped Home Turf vs Storm Response Range)
//   service-areas/<countySlug>/index.html    (8 county pages)
//   service-areas/<citySlug>/index.html      (29 city pages, tier-aware)
// Chrome kept in sync with the live site: 6-item nav incl "Storm & Roofing",
// vanity display "470-77-STORM" with numeric tel:+14707778676.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf8'));
const cities = JSON.parse(readFileSync(join(ROOT, 'data', 'cities.json'), 'utf8'));
const counties = JSON.parse(readFileSync(join(ROOT, 'data', 'counties.json'), 'utf8'));
const BASE = site.baseUrl.replace(/\/$/, '');
const TEL = 'tel:+14707778676';
const PH = '470-77-STORM';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const byslug = Object.fromEntries(cities.map(c => [c.slug, c]));
const countyBySlug = Object.fromEntries(counties.map(c => [c.slug, c]));

// r = path to site root ('../../' for city/county pages, '../' for hub); hub = link to areas hub
function head(title, desc, url, r, ogType = 'website', jsonld = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${BASE}/assets/img/og-card.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${r}assets/img/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${r}assets/css/styles.css">${jsonld ? `\n  <script type="application/ld+json">\n${jsonld}\n  </script>` : ''}
</head>
<body>

  <div class="ribbon"><span class="pulse-dot"></span>Storm damage? We answer 24/7: <a href="${TEL}">${PH}</a></div>

  <header class="header">
    <div class="container header-inner">
      <a href="${r}" class="logo" aria-label="Elite Catastrophe home"><span class="l1">ELITE</span><span class="l2">Catastrophe</span></a>
      <nav class="nav" aria-label="Main">
        <a href="${r}services/tree-removal">Tree Removal</a>
        <a href="${r}services/">All Services</a>
        <a href="${r}services/storm-roofing">Storm &amp; Roofing</a>
        <a href="${hubLink(r)}">Service Areas</a>
        <a href="${r}blog/">Blog</a>
        <a href="${r}about">About</a>
      </nav>
      <a href="${r}contact" class="btn btn-primary">Free Estimate</a>
      <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </header>
  <nav class="mobile-nav" aria-label="Mobile">
    <a href="${r}services/tree-removal">Tree Removal</a>
    <a href="${r}services/">All Services</a>
    <a href="${r}services/storm-roofing">Storm &amp; Roofing</a>
    <a href="${hubLink(r)}">Service Areas</a>
    <a href="${r}blog/">Blog</a>
    <a href="${r}about">About</a>
    <a href="${r}contact">Free Estimate</a>
    <a href="${TEL}">${PH}</a>
  </nav>
  <div class="mobile-overlay"></div>

  <main>
`;
}
const hubLink = r => r === '../' ? './' : r + 'service-areas/';

function foot(r) {
  return `  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <span class="logo"><span class="l1">ELITE</span><span class="l2">Catastrophe</span></span>
          <p class="tagline">Family-owned tree service and storm response, serving Rome &amp; Northwest Georgia.</p>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li><a href="${r}services/tree-removal">Tree Removal</a></li>
            <li><a href="${r}services/tree-trimming">Trimming &amp; Pruning</a></li>
            <li><a href="${r}services/stump-grinding">Stump Grinding</a></li>
            <li><a href="${r}services/emergency-tree-service">Emergency Tree Service</a></li>
            <li><a href="${r}services/storm-damage-restoration">Storm Restoration</a></li>
            <li><a href="${r}services/roof-tarping">Roof Tarping</a></li>
          </ul>
        </div>
        <div>
          <h4>Service Areas</h4>
          <ul>
            <li><a href="${hubLink(r)}floyd-county/">Floyd County</a></li>
            <li><a href="${hubLink(r)}bartow-county/">Bartow County</a></li>
            <li><a href="${hubLink(r)}cherokee-county/">Cherokee County</a></li>
            <li><a href="${hubLink(r)}cobb-county/">Cobb County</a></li>
            <li><a href="${hubLink(r)}">All counties</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="${TEL}">${PH}</a></li>
            <li>Serving Rome &amp; Northwest Georgia</li>
            <li>Available 24/7 for storm emergencies</li>
            <li><a href="${r}reviews">Read our Google reviews</a></li>
            <li><a href="${r}contact">Request a free estimate</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Elite Catastrophe. All rights reserved.</span>
        <span>Site by <a href="https://synergytelecom.org" rel="noopener">Synergy Telecom</a></span>
      </div>
    </div>
  </footer>

  <script src="${r}assets/js/main.js"></script>
</body>
</html>
`;
}

// ---------- CITY PAGES ----------
for (const c of cities) {
  const r = '../../';
  const co = countyBySlug[c.countySlug];
  const url = `${BASE}/service-areas/${c.slug}/`;
  const storm = c.tier === 'storm';
  const title = storm
    ? `${c.name}, GA Storm Damage & Emergency Tree Service | Elite Catastrophe`
    : `${c.name}, GA Tree Service & Tree Removal | Elite Catastrophe`;
  const desc = storm
    ? `Tree removal, storm damage cleanup, and roof work in ${c.name}, ${c.county}. Elite Catastrophe serves ${c.name} year round, with fast 24/7 storm response.`
    : `Tree removal, trimming, and stump grinding in ${c.name}, Georgia. Elite Catastrophe serves ${c.county} with careful tree work and 24/7 storm response.`;
  const h1 = storm ? `Storm Damage & Emergency Tree Service in ${c.name}, GA` : `Tree Service in ${c.name}, Georgia`;
  const paragraphs = c.narrative.split(/\n\n+/).map(p => `<p>${esc(p.trim())}</p>`).join('\n        ');
  // rotating sibling window: each city links the next 4 in its county (wrapping),
  // so every city (incl. the last one, e.g. Mableton) gets even inbound links
  const _ci = (co.cities || []).indexOf(c.slug);
  const _rot = (co.cities || []).slice(_ci + 1).concat((co.cities || []).slice(0, _ci));
  const siblings = _rot.map(s => byslug[s]).filter(Boolean).slice(0, 4);
  const services = storm
    ? [['emergency-tree-service', '24/7 emergency tree service', 'when a storm drops a tree on your home'],
       ['storm-damage-restoration', 'Storm damage restoration', 'from the tree to the roof it landed on'],
       ['roof-tarping', 'Emergency roof tarping', 'to stop the water until repairs are made'],
       ['tree-removal', 'Tree removal', 'storm-driven or scheduled, any time of year'],
       ['tree-trimming', 'Tree trimming and pruning', 'to keep the canopy off your roof'],
       ['stump-grinding', 'Stump grinding and removal', 'to finish the job clean']]
    : [['tree-removal', 'Tree removal', 'from single problem trees to full takedowns'],
       ['tree-trimming', 'Tree trimming and pruning', 'for health, clearance, and storm prep'],
       ['stump-grinding', 'Stump grinding and removal', 'to finish the job properly'],
       ['emergency-tree-service', '24/7 emergency tree service', 'when it cannot wait']];
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Service',
    name: storm ? `Storm Damage Tree Service in ${c.name}, GA` : `Tree Services in ${c.name}, GA`,
    serviceType: storm ? 'Emergency Tree Service' : 'Tree Service',
    provider: { '@id': `${BASE}/#business` },
    areaServed: { '@type': 'City', name: `${c.name}, GA` }, url,
  }, null, 2);

  const html = head(title, desc, url, r, 'website', jsonld) +
`    <section class="page-hero">
      <div class="container">
        <p class="breadcrumbs"><a href="${r}">Home</a> / <a href="../">Service Areas</a> / <a href="../${co.slug}/">${esc(co.name)}</a> / ${esc(c.name)}</p>
        <span class="kicker">${esc(co.name)}${storm ? ' · Storm Response' : ''}</span>
        <h1>${esc(h1)}</h1>
      </div>
    </section>

    <div class="container content-grid">
      <div class="prose">
        ${paragraphs}
        <h2>${storm ? `What we bring to ${esc(c.name)}` : `Tree services we bring to ${esc(c.name)}`}</h2>
        <ul>
          ${services.map(([slug, label, tail]) => `<li><a href="${r}services/${slug}">${label}</a>, ${tail}</li>`).join('\n          ')}
        </ul>
        ${storm
          ? `<p>Everyday tree work in ${esc(c.name)} is available year round, not only after a storm. When severe weather does hit, we are the crew that answers fast and works structures first.</p>`
          : `<p>Storms hit Northwest Georgia hard, and we handle both sides of the damage. See our <a href="${r}services/storm-roofing">storm and roofing</a> work.</p>`}
        <p>Estimates are free, and you will get a straight answer about what the job takes. Call <a href="${TEL}">${PH}</a> or <a href="${r}contact">request an estimate online</a>.</p>
      </div>
      <aside class="sidebar">
        <div class="side-card">
          <h3>${esc(co.name)}</h3>
          <ul>
            ${siblings.map(n => `<li><a href="../${n.slug}/">${esc(n.name)}, GA</a></li>`).join('\n            ') || `<li>${esc(co.name)} coverage</li>`}
            <li><a href="../${co.slug}/">All of ${esc(co.name)}</a></li>
            <li><a href="../">All service areas</a></li>
          </ul>
        </div>
        <div class="side-card cta">
          <h3>${storm ? 'Storm damage now?' : 'Talk to the crew'}</h3>
          <p>${storm ? `Tree on the house in ${esc(c.name)}? We answer around the clock. Full tree and roof service across ${esc(co.name)}, storm or shine.` : `Free estimates in ${esc(c.name)} and across ${esc(co.name)}. Storm emergencies answered around the clock.`}</p>
          <a href="${TEL}" class="btn btn-light">${PH}</a>
        </div>
      </aside>
    </div>
` + foot(r);

  mkdirSync(join(ROOT, 'service-areas', c.slug), { recursive: true });
  writeFileSync(join(ROOT, 'service-areas', c.slug, 'index.html'), html);
}

// ---------- COUNTY PAGES ----------
for (const co of counties) {
  const r = '../../';
  const url = `${BASE}/service-areas/${co.slug}/`;
  const storm = co.tier === 'storm';
  const pageCities = (co.cities || []).map(s => byslug[s]).filter(Boolean);
  const title = storm
    ? `${co.name}, GA Storm Damage & Tree Service | Elite Catastrophe`
    : `${co.name}, GA Tree Service | Elite Catastrophe`;
  const desc = storm
    ? `Tree service and 24/7 storm response across ${co.name}, Georgia, including ${pageCities.map(c => c.name).slice(0, 3).join(', ')}. Tree and roof work available year round, family-owned, based in Rome.`
    : `Tree removal, trimming, and stump grinding across ${co.name}, Georgia, including ${pageCities.map(c => c.name).slice(0, 3).join(', ')}. Family-owned, based in Rome.`;
  const h1 = storm ? `Tree Service & Storm Response Across ${co.name}` : `Tree Service Across ${co.name}`;
  const paragraphs = co.narrative.split(/\n\n+/).map(p => `<p>${esc(p.trim())}</p>`).join('\n        ');
  const hamletLine = (co.hamlets && co.hamlets.length)
    ? `<p>We also cover the smaller communities of ${co.name}, including ${co.hamlets.join(', ')}. If you are anywhere in the county, call and tell us where you are.</p>` : '';
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Service',
    name: `${storm ? 'Storm Damage Tree Service' : 'Tree Service'} in ${co.name}, GA`,
    serviceType: storm ? 'Emergency Tree Service' : 'Tree Service',
    provider: { '@id': `${BASE}/#business` },
    areaServed: { '@type': 'AdministrativeArea', name: `${co.name}, Georgia` }, url,
  }, null, 2);

  const html = head(title, desc, url, r, 'website', jsonld) +
`    <section class="page-hero">
      <div class="container">
        <p class="breadcrumbs"><a href="${r}">Home</a> / <a href="../">Service Areas</a> / ${esc(co.name)}</p>
        <span class="kicker">${storm ? 'Storm Response Range' : 'Home Turf'}</span>
        <h1>${esc(h1)}</h1>
      </div>
    </section>

    <div class="container content-grid">
      <div class="prose">
        ${paragraphs}
        ${hamletLine}
        <h2>Cities we serve in ${esc(co.name)}</h2>
        <ul>
          ${pageCities.map(c => `<li><a href="../${c.slug}/">${esc(c.name)}, GA</a></li>`).join('\n          ')}
        </ul>
      </div>
      <aside class="sidebar">
        <div class="side-card">
          <h3>Services</h3>
          <ul>
            <li><a href="${r}services/tree-removal">Tree Removal</a></li>
            <li><a href="${r}services/emergency-tree-service">Emergency Tree Service</a></li>
            <li><a href="${r}services/storm-roofing">Storm &amp; Roofing</a></li>
            <li><a href="${r}services/">All services</a></li>
          </ul>
        </div>
        <div class="side-card cta">
          <h3>${storm ? 'Tree or storm work?' : 'Free estimates'}</h3>
          <p>${storm ? `Full tree and roof service across ${esc(co.name)}, available year round, with structures-first storm response when weather hits.` : `Serving ${esc(co.name)} from our Rome base. Call for a straight answer and a free estimate.`}</p>
          <a href="${TEL}" class="btn btn-light">${PH}</a>
        </div>
      </aside>
    </div>
` + foot(r);

  mkdirSync(join(ROOT, 'service-areas', co.slug), { recursive: true });
  writeFileSync(join(ROOT, 'service-areas', co.slug, 'index.html'), html);
}

// ---------- HUB ----------
{
  const r = '../';
  const url = `${BASE}/service-areas/`;
  const groups = [['home', 'Home Turf', 'Northwest Georgia, where we work every week'], ['storm', 'Storm Response Range', 'Metro Atlanta counties we serve for tree and roof work, with fast storm response']];
  const section = tier => {
    const cos = counties.filter(c => c.tier === tier);
    return cos.map(co => {
      const cs = (co.cities || []).map(s => byslug[s]).filter(Boolean);
      return `          <div class="side-card">
            <h3><a href="${co.slug}/">${esc(co.name)}</a></h3>
            <ul>
              ${cs.map(c => `<li><a href="${c.slug}/">${esc(c.name)}</a></li>`).join('\n              ')}
            </ul>
          </div>`;
    }).join('\n');
  };
  const html = head(
    'Service Areas | Tree & Storm Service Across Northwest Georgia & Metro Atlanta | Elite Catastrophe',
    'Elite Catastrophe serves Floyd, Polk, Gordon, Chattooga, and Bartow counties with tree service, and deploys across Cherokee, Cobb, and Paulding for storm response.',
    url, r, 'website',
    JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Elite Catastrophe Service Areas', url, about: { '@id': `${BASE}/#business` } }, null, 2)
  ) +
`    <section class="page-hero">
      <div class="container">
        <p class="breadcrumbs"><a href="${r}">Home</a> / Service Areas</p>
        <span class="kicker">Where We Work</span>
        <h1>Tree Service Across Northwest Georgia</h1>
        <p class="lede">Based in Rome, we cover Northwest Georgia every week and reach across the metro-Atlanta region too. Tree work and roof work in every area we serve, with fast storm response when severe weather hits. Find your county below.</p>
      </div>
    </section>

${groups.map(([tier, label, blurb]) => `    <section>
      <div class="container">
        <div class="section-head">
          <span class="kicker">${label}</span>
          <h2>${tier === 'home' ? 'Counties we <strong>cover every week</strong>.' : 'Counties we <strong>serve, storm-ready</strong>.'}</h2>
          <p>${blurb}.</p>
        </div>
        <div class="feature-grid">
${section(tier)}
        </div>
      </div>
    </section>`).join('\n\n')}

    <section>
      <div class="container">
        <div class="band">
          <div class="band-grid">
            <div>
              <span class="kicker">Storm Line</span>
              <h2>Storms do not check <strong>county lines</strong>. Neither do we.</h2>
              <p>When severe weather moves through the region, we run structures-first triage across our whole service area and beyond.</p>
            </div>
            <div>
              <a class="phone-big" href="${TEL}">${PH}</a>
              <p style="margin-top:10px; font-size:.85rem;">Answered around the clock, every day of the year.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
` + foot(r);
  writeFileSync(join(ROOT, 'service-areas', 'index.html'), html);
}

console.log(`generated: ${cities.length} city pages + ${counties.length} county pages + hub`);
