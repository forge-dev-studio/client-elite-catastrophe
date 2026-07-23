// Merge roster.json + existing city narratives + agent fragment files into the final
// data/cities.json (29 cities w/ narratives) and data/counties.json (8 counties w/ narratives).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const D = p => join(ROOT, 'data', p);
const roster = JSON.parse(readFileSync(D('roster.json'), 'utf8'));

// existing narratives (preserve the hand-written 8)
const existing = {};
if (existsSync(D('cities.json'))) {
  for (const c of JSON.parse(readFileSync(D('cities.json'), 'utf8'))) existing[c.slug] = { narrative: c.narrative, treeAngle: c.treeAngle };
}

// agent fragments
const frags = ['frag-home.json', 'frag-storm-cp.json', 'frag-cobb.json'];
const fCities = {}, fCounties = {};
for (const f of frags) {
  if (!existsSync(D(f))) { console.error(`MISSING fragment ${f}`); process.exit(1); }
  const j = JSON.parse(readFileSync(D(f), 'utf8'));
  Object.assign(fCounties, j.counties || {});
  Object.assign(fCities, j.cities || {});
}

// build cities.json
const cities = roster.cities.map(c => {
  const src = c.existing ? existing[c.slug] : fCities[c.slug];
  if (!src || !src.narrative) { console.error(`NO narrative for city ${c.slug}`); process.exit(1); }
  return { slug: c.slug, name: c.name, county: c.county, countySlug: c.countySlug, tier: c.tier, narrative: src.narrative, treeAngle: src.treeAngle || '' };
});

// build counties.json (attach city slugs in roster order)
const counties = roster.counties.map(co => {
  const narrative = fCounties[co.slug];
  if (!narrative) { console.error(`NO narrative for county ${co.slug}`); process.exit(1); }
  const citySlugs = roster.cities.filter(c => c.countySlug === co.slug).map(c => c.slug);
  return { slug: co.slug, name: co.name, tier: co.tier, seat: co.seat, hamlets: co.hamlets, cities: citySlugs, narrative };
});

// dash guard
const blob = JSON.stringify({ cities, counties });
const dash = blob.match(/[–—]/);
if (dash) { console.error('EM/EN DASH found in assembled content'); process.exit(1); }

writeFileSync(D('cities.json'), JSON.stringify(cities, null, 2) + '\n');
writeFileSync(D('counties.json'), JSON.stringify(counties, null, 2) + '\n');
console.log(`assembled: ${cities.length} cities, ${counties.length} counties, dashes: none`);
