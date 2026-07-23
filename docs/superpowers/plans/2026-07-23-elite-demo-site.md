# Elite Catastrophe Demo Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 34-page cutover-ready Elite Catastrophe demo site (tree-first entity, roofing secondary, 12-post blog) verifier-green and live on GitHub Pages.

**Architecture:** Hand-authored static HTML with shared CSS tokens, a Node city-page generator fed by hand-written narratives, and a ported Dasher verify.mjs extended with a forbidden-claims gate. Reference implementation: `~/client-dasher-accounting` (40 pages verifier-green, same URL/deploy rules).

**Tech Stack:** Static HTML/CSS/vanilla JS, Node 20+ (no framework, no build step beyond generators), GitHub Pages (forge-dev-studio org), Poppins via Google Fonts.

## Global Constraints (from spec — every task inherits these)

- Attribution: Synergy Telecom, never Forge, on any Elite-facing text.
- Name token: business name is exactly **"Elite Catastrophe"** everywhere (schema, footer, copy). Facebook variant only as schema `alternateName: "Elite Catastrophe Tree Service"`. Name lives in ONE token (`data/site.json` → injected; never hand-typed in NAP/schema contexts).
- Phone: **(706) 676-7364**. Visible location: **"Serving Rome & Northwest Georgia"** — street address (32 Paris Dr SW, Rome, GA 30165) appears in JSON-LD only, never in visible copy.
- FORBIDDEN in all copy (verifier gate 14 enforces): tenure claims ("15+ years", "years of experience" with a number), "BBB accredited", "GAF", chamber memberships, "veteran-owned", "minority-owned", "licensed" (until GA license verified — cutover blocker), "insured" (until COI sighted), "RB Roofing", land clearing / lot clearing / forestry mulching, em dashes (—), Eric's home address, fabricated reviews/hours.
- ALLOWED: family-owned, 24/7 emergency response, real live-fetched review numbers, regional storm response framed honestly.
- No pricing on service/city pages. Blog posts may cite honest industry cost ranges; any range gets a trailing "+" on the high figure (e.g., "$800–3,500+").
- Entity weighting: homepage + city pages tree-first; nav lists Tree Services before Storm & Roofing; internal link mass flows to tree pages. Schema type `HomeAndConstructionBusiness`, NEVER `RoofingContractor`.
- URLs: 100% extensionless internal hrefs; hubs at `<dir>/index.html`; canonical + og:url absolute and extensionless; path-prefix-aware for GitHub Pages project URL.
- Colors: ink `#1a1a1a`, terracotta `#de9668` (tints/highlights), deep terracotta `#b45f33` (interactive/CTA on white), neutral grays; AA contrast enforced. Font: Poppins.
- Demo URL base: `https://forge-dev-studio.github.io/client-elite-catastrophe`.

---

### Task 1: Scaffold, tokens, shared assets

**Files:**
- Create: `.gitignore`, `.nojekyll`, `package.json`, `data/site.json`, `assets/css/styles.css`, `assets/js/main.js`, `robots.txt`
- Reference-copy: `~/client-dasher-accounting/assets/js/main.js` (adapt), Dasher `robots.txt` pattern

**Interfaces:**
- Produces: `data/site.json` consumed by generators/verify (`{ name, altName, phone, phoneHref, addr: {street, city, state, zip}, geo: {lat, lng}, baseUrl, gbpRating, gbpCount }`); CSS custom properties `--ink --terra --terra-deep --terra-tint --gray-*` used by every page.

- [ ] **Step 1: Scaffold directories + config files**

```bash
cd ~/client-elite-catastrophe
mkdir -p assets/css assets/js assets/img data tools services service-areas blog
touch .nojekyll
printf 'node_modules/\n.DS_Store\n' > .gitignore
```

`package.json`:
```json
{
  "name": "client-elite-catastrophe",
  "private": true,
  "type": "module",
  "scripts": {
    "verify": "node tools/verify.mjs",
    "cities": "node tools/generate-city-pages.mjs",
    "sitemap": "node tools/generate-sitemap.mjs"
  }
}
```

`data/site.json`:
```json
{
  "name": "Elite Catastrophe",
  "altName": "Elite Catastrophe Tree Service",
  "phone": "(706) 676-7364",
  "phoneHref": "tel:+17066767364",
  "addr": { "street": "32 Paris Dr SW", "city": "Rome", "state": "GA", "zip": "30165" },
  "geo": { "lat": 34.2570, "lng": -85.1647 },
  "baseUrl": "https://forge-dev-studio.github.io/client-elite-catastrophe",
  "gbpRating": 4.9,
  "gbpCount": 76,
  "gbpAsOf": "July 2026"
}
```

- [ ] **Step 2: Write `assets/css/styles.css`** — tokens block first, then base/component styles. Invoke `frontend-design` skill for the component layer. Tokens (exact):

```css
:root {
  --ink: #1a1a1a; --ink-soft: #3a3a3a;
  --terra: #de9668; --terra-deep: #b45f33; --terra-tint: #f7ebe2;
  --gray-1: #f6f5f3; --gray-2: #e5e2de; --gray-4: #8e8b87; --gray-6: #55524e;
  --font: 'Poppins', system-ui, sans-serif;
  --maxw: 1160px; --radius: 10px;
}
```
Requirements: sticky header with phone CTA (`--terra-deep` button), hero, service cards, review badge, city/blog cards, footer (3 columns: services / areas / contact), mobile-first responsive, `prefers-reduced-motion` respected. All interactive elements AA on their backgrounds (terracotta `#de9668` is decorative only on white; `--terra-deep` for text/buttons on light).

- [ ] **Step 3: Adapt `assets/js/main.js` from Dasher** — copy `~/client-dasher-accounting/assets/js/main.js`, keep: nav active-state via normalized resolved paths (works for clean + legacy URLs), scroll reveal, lazy loading. Remove Dasher-specific hooks. Add review-badge fetcher stub (Task 11 fills endpoint):

```js
async function hydrateReviewBadge() {
  const el = document.querySelector('[data-review-badge]');
  if (!el) return;
  try {
    const r = await fetch(el.dataset.endpoint, { signal: AbortSignal.timeout(2500) });
    const { rating, count } = await r.json();
    if (rating && count) el.textContent = `${rating}★ · ${count} Google reviews`;
  } catch { /* static fallback text stays */ }
}
hydrateReviewBadge();
```

- [ ] **Step 4: `robots.txt`** (allow all + sitemap absolute URL). Commit: `chore: scaffold, tokens, shared assets`

### Task 2: Verifier port + Elite gates (the test harness for everything after)

**Files:**
- Create: `tools/verify.mjs` (ported), `BUILD-SPEC.md` (ported + Elite rules)

**Interfaces:**
- Produces: `npm run verify` exits 0 green / 1 with per-page violations. Gates 1-13 = Dasher's (unique titles/descriptions, canonical/og:url absolute+extensionless, valid JSON-LD, no broken internal links, extensionless internal hrefs, sitemap rules, no em dashes). Gate 14 = forbidden claims. Gate 15 = name-token integrity.

- [ ] **Step 1: Port verifier**

```bash
cp ~/client-dasher-accounting/tools/verify.mjs tools/verify.mjs
cp ~/client-dasher-accounting/BUILD-SPEC.md BUILD-SPEC.md
```
Update constants at top of `verify.mjs`: `BASE_URL = 'https://forge-dev-studio.github.io/client-elite-catastrophe'`, site root, expected page count. Rewrite `BUILD-SPEC.md` header/rules for Elite (34 pages, spec §8 list, name rule).

- [ ] **Step 2: Add gate 14 (forbidden claims) + gate 15 (name integrity)** — exact code to append into the checks array:

```js
const FORBIDDEN = [
  [/\b\d+\+?\s*years\b/i, 'tenure claim'],
  [/BBB[-\s]?accredited/i, 'BBB accreditation claim'],
  [/\bGAF\b/, 'GAF certification claim'],
  [/chamber of commerce/i, 'chamber membership claim'],
  [/veteran[-\s]owned|minority[-\s]owned/i, 'ownership-status claim'],
  [/\blicensed\b/i, 'license claim (blocked until verified)'],
  [/\binsured\b/i, 'insurance claim (blocked until COI)'],
  [/RB\s*Roofing/i, 'RB Roofing reference'],
  [/land[-\s]clearing|lot[-\s]clearing|forestry\s*mulch/i, 'land-clearing (client conflict)'],
  [/205\s*E\.?\s*7th/i, 'private address'],
  [/—/, 'em dash'],
];
// gate 14: run on visible text + meta of every page
// gate 15: every JSON-LD "name" for the business === site.name from data/site.json;
// visible street address regex /32\s*Paris\s*Dr/i must appear in ZERO visible text (schema only)
```

- [ ] **Step 3: Run `npm run verify`** — Expected: FAIL (no pages yet, count mismatch). This is the red state; every later task drives it toward green. Commit: `feat: verifier with Elite forbidden-claims and name gates`

### Task 3: Brand assets

**Files:**
- Create: `assets/img/logo.png` (or `.svg`), `assets/img/logo-mark.png`

- [ ] **Step 1: Pull the real logo from the live Duda site** — fetch `https://elitecatastrophe.com`, grep image URLs (`dd-cdn` / `mntn` Duda asset hosts, `logo` in path), download best-resolution asset. If unreachable/low-res, build the text lockup fallback per spec §6 (ELITE ink / CATASTROPHE terracotta, wide-tracked Poppins Light) and log "logo file from Andrew" in cutover notes.
- [ ] **Step 2: Placeholder job photos** — 6-8 relevant Unsplash images (tree work, storm, roof tarp), every `<img>` gets `data-placeholder="replace-at-cutover"`. Commit: `chore: brand + placeholder assets`

### Task 4: Content data files

**Files:**
- Create: `data/cities.json`, `data/services.json`

**Interfaces:**
- Produces: `cities.json` array `{ slug, name, county, distanceMi, narrative (250-400 words, hand-written, unique), treeAngle }` for the 8 ring cities; `services.json` array `{ slug, name, lane: "tree"|"storm", title, metaDesc, h1, primaryKw, volumeNote }` for the 6 services. Consumed by Tasks 7-8 and the generator.

- [ ] **Step 1: Write `data/services.json`** with the exact 6 services + metadata from the page table below (Task 6).
- [ ] **Step 2: Write `data/cities.json`** — 8 hand-written narratives (Rome, Lindale, Cedartown, Rockmart, Calhoun, Summerville, Adairsville, Cartersville). Each narrative: real geography (county, distance from Rome base per `~/forge-rank-audit/results/elite-markets-50mi.json`), tree species/storm reality of NW GA (pines, oaks, spring storms), no invented facts, no stats filler, tree-first with one storm-response sentence. Commit: `feat: city + service content data`

### Task 5: Page template contract (applies to Tasks 6-10)

Every page: `<!DOCTYPE html>` + `<html lang="en">`; `<title>` and meta description per the table; absolute extensionless canonical + og:url; Poppins preconnect; single JSON-LD block per page type; sticky header (nav: Tree Services first, then Storm & Roofing, Service Areas, Blog, About, phone CTA); footer with services/areas/contact columns + "Serving Rome & Northwest Georgia" + phone (NO street address); all internal hrefs extensionless and path-prefix-aware. Business JSON-LD (home only; other pages reference via `@id`):

```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "{baseUrl}/#business",
  "name": "Elite Catastrophe",
  "alternateName": "Elite Catastrophe Tree Service",
  "telephone": "+17066767364",
  "url": "{baseUrl}/",
  "address": { "@type": "PostalAddress", "streetAddress": "32 Paris Dr SW", "addressLocality": "Rome", "addressRegion": "GA", "postalCode": "30165", "addressCountry": "US" },
  "geo": { "@type": "GeoCoordinates", "latitude": 34.2570, "longitude": -85.1647 },
  "areaServed": [ "Rome GA", "Lindale GA", "Cedartown GA", "Rockmart GA", "Calhoun GA", "Summerville GA", "Adairsville GA", "Cartersville GA" ],
  "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Services", "itemListElement": [ /* 6 Service entries by name */ ] }
}
```
No `aggregateRating` anywhere (cutover blocker). Service pages: `Service` schema with `provider: {"@id": "{baseUrl}/#business"}` + `areaServed`. City pages: `Service` + `areaServed` single city. Blog: `BlogPosting` (+ `FAQPage` where the post has a real Q&A section).

### Task 6: Core pages (home, about, contact, reviews) — page table is normative

| URL | Title | H1 | Primary target |
|---|---|---|---|
| `/` | Tree Service in Rome, GA \| Elite Catastrophe | Rome's Tree Service for Everyday Jobs and Storm Emergencies | tree service (2,900 GA) |
| `/about` | About Elite Catastrophe \| Rome, GA Tree Service | The Crew Rome Calls When Trees Cause Trouble | brand/trust |
| `/contact` | Contact Elite Catastrophe \| Free Estimates in Rome, GA | Get a Free Estimate | conversion |
| `/reviews` | Reviews \| Elite Catastrophe, Rome GA | What Neighbors Say About Our Work | brand + proof |

- [ ] **Step 1: Home** (use `frontend-design` skill): hero (tree-first headline + dual CTA call/estimate + review badge `data-review-badge` with static fallback "4.9★ · 76 Google reviews"), services grid (6 cards, tree row first), why-us (honest: family-owned, 24/7 emergency, real review velocity), service-area strip (8 city links), latest-from-blog (3 cards), full business JSON-LD.
- [ ] **Step 2: About** — honest story: family-owned Rome company, what they do, how they work storms regionally (honest framing), NO tenure/credential claims. **Owner names do NOT appear** (publication check is a cutover blocker).
- [ ] **Step 3: Contact** — phone-first; form markup with `data-ghl-placeholder="form"` comment block (IDs at cutover, Dasher pattern); NAP-lite.
- [ ] **Step 4: Reviews** — live badge + 3-5 real review excerpts pulled verbatim from their public GBP listing (attributed by first name + initial as displayed; no edits), link to their Google reviews. If excerpts can't be captured from the public listing during build, ship badge + link only.
- [ ] **Step 5: `npm run verify`** — expect only missing-page count failures. Commit: `feat: core pages`

### Task 7: Services hub + 6 service pages

| URL | Title | Primary target (vol) |
|---|---|---|
| `/services/` | Tree & Storm Services in Rome, GA \| Elite Catastrophe | hub |
| `/services/tree-removal` | Tree Removal in Rome, GA \| Elite Catastrophe | tree removal 1,600 GA |
| `/services/tree-trimming` | Tree Trimming & Pruning in Rome, GA \| Elite Catastrophe | tree trimming 880 GA |
| `/services/stump-grinding` | Stump Grinding & Removal in Rome, GA \| Elite Catastrophe | stump grinding 3,600 GA |
| `/services/emergency-tree-service` | 24/7 Emergency Tree Service in Rome, GA \| Elite Catastrophe | emergency tree service 5,400 US / storm damage tree removal (their #2 Rome cell) |
| `/services/storm-damage-restoration` | Storm Damage Restoration in NW Georgia \| Elite Catastrophe | storm damage roof repair 70 GA + restoration head term |
| `/services/roof-tarping` | Emergency Roof Tarping in NW Georgia \| Elite Catastrophe | roof tarping 260 GA / 6,600 US |

- [ ] Steps per page: 500-800 words, structure = what/when/how-we-work/service-area/CTA + 3-4 real FAQs (`FAQPage` schema on emergency, storm, tarping pages), `Service` JSON-LD, cross-links (tree pages link tree pages + emergency; storm pages link each other + emergency; ALL pages link home + contact). Hub: tree section visually first with 4 cards, storm section second with 2. Verify after. Commit: `feat: services hub + 6 service pages`

### Task 8: City generator + 8 city pages + areas hub

**Files:**
- Create: `tools/generate-city-pages.mjs`, `service-areas/index.html`, 8 generated pages

**Interfaces:**
- Consumes: `data/cities.json`, `data/site.json`
- Produces: `service-areas/<slug>/index.html` × 8, titles `Tree Service in {City}, GA | Elite Catastrophe`

- [ ] **Step 1: Port generator skeleton from Dasher** (`~/client-dasher-accounting/tools/` city generator): template literal page with narrative injection, extensionless links, per-city `Service`+`areaServed` JSON-LD, cross-link to `/services/emergency-tree-service` + 2 nearest cities. TREE-ONLY content (one storm-response sentence allowed; zero roofing links per weighting rule).
- [ ] **Step 2: Generate, eyeball one page, run verify.** Commit: `feat: service-area pages`

### Task 9: Blog — flagship six (posts 1-6 per spec §5 table)

- [ ] Per post: 1,200-1,800 words, hand-written, keyword cluster from spec §5 woven naturally (H2s answer the question variants), honest industry cost ranges with trailing "+" where costs appear, `BlogPosting` JSON-LD (+`FAQPage` where Q&A section exists), author = "Elite Catastrophe" (org, not person), 2-3 internal links to matching service page + relevant city page, one CTA block. URLs: `/blog/tree-fell-on-house-who-pays`, `/blog/large-hazardous-tree-removal-cost`, `/blog/leaning-tree-warning-signs`, `/blog/roof-insurance-claim-storm-damage`, `/blog/roof-tarping-guide`, `/blog/tree-removal-cost-georgia`. Verify. Commit per 2-3 posts.

### Task 10: Blog — coverage six (posts 7-12) + blog hub

- [ ] Same contract. URLs: `/blog/attic-ventilation-signs`, `/blog/new-roof-cost-guide`, `/blog/water-stains-on-ceiling`, `/blog/hail-damage-roof-signs`, `/blog/roof-flashing-leaks`, `/blog/stump-grinding-vs-stump-removal`.
- [ ] Blog hub `blog/index.html`: card grid, newest first, category chips (Tree / Roof / Storm & Insurance). Verify. Commit: `feat: blog complete (12 posts + hub)`

### Task 11: Review badge live wiring (additive-only infra rule)

- [ ] **Step 1: Inspect `~/vbw-reviews-worker`** (serves all clients, one key). Determine config pattern for adding a client (place ID keyed route). Find Elite's Google place ID from their public GBP/Maps listing.
- [ ] **Step 2: ADD Elite entry only** (zero changes to existing entries/routes) + `wrangler deploy`. If anything about the addition is not purely additive, STOP, ship static fallback, flag for Eric.
- [ ] **Step 3: Point `data-endpoint` at the worker route; verify live JSON + fallback path (block the request, badge shows static text).** Commit: `feat: live review badge`

### Task 12: 404, sitemap, robots finalization

- [ ] **Step 1: `404.html`** — port Dasher's base-href-injection pattern (dynamic `<base>` so assets/links resolve at any nested path), helpful links to hubs.
- [ ] **Step 2: `tools/generate-sitemap.mjs`** — walk built pages, emit absolute extensionless `<loc>` entries (hubs as directory URLs, blog included, 404 excluded), write `sitemap.xml`; robots.txt references it. Run + verify (gate 13). Commit: `feat: sitemap + 404`

### Task 13: Full verify green + visual review

- [ ] **Step 1: `npm run verify`** → drive to exit 0, all 34 pages, zero gate-14/15 hits. Paste the green summary into the task log.
- [ ] **Step 2: Screenshot review rig** (per the standing visual-review reference: puppeteer-core + `~/.cache/ms-playwright` chromium, `prefers-reduced-motion`): home, one service, one city, one blog post, contact — desktop 1440 + mobile 390. Fix what looks wrong (spacing, contrast, hero on mobile, nav overflow). Re-verify. Commit: `fix: visual pass`

### Task 14: GitHub + Pages deploy + live matrix

- [ ] **Step 1: Create repo + push** — `gh repo create forge-dev-studio/client-elite-catastrophe --public --source . --push` (Corey's gh auth on this box per standing repo rules).
- [ ] **Step 2: Enable Pages from master root; FIRST check the `github-pages` environment branch policy and add `claude/*` if restricted** (the silent Dasher failure). `.nojekyll` already present.
- [ ] **Step 3: Live matrix test** — curl every sitemap URL at the demo base expecting 200 (directory URLs and extensionless paths both), spot-check HTML renders. Paste results.
- [ ] **Step 4: Update memory (project file + MEMORY.md index) with live URL + state; final summary to Corey with demo link, what's placeholder, and the cutover blocker list.** Commit any final fixes.

## Self-review (done at write time)

- Spec coverage: §4 pages → Tasks 6-10,12; §5 blog → 9-10; §6 brand → 1,3; §7 schema → 5 contract + per-task; §8 integrity → Task 2 gates + global constraints; §9 pipeline → 1,2,8,12; §10 deploy → 14; §11 blockers → carried in Task 14 summary (no build action); §12 out-of-scope respected (no GBP/GHL/citation tasks). No placeholders/TBDs; interfaces named consistently (`data/site.json`, `verify.mjs` gates 14/15, generator paths).
