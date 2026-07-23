# Elite Catastrophe Site — BUILD-SPEC (binding rules)

Ported from the Dasher pipeline 2026-07-23. Full design rationale lives in
`docs/superpowers/specs/2026-07-23-elite-demo-site-design.md`. These are the rules
`tools/verify.mjs` enforces; every page must pass before merge/deploy.

## Identity (NAP)
- Business name is EXACTLY **"Elite Catastrophe"** in schema, footer, and copy (single
  source: `data/site.json`). Facebook variant "Elite Catastrophe Tree Service" appears
  ONLY as schema `alternateName`. Never add new name variants.
- Phone (706) 676-7364 / `tel:+17066767364`. Visible location ONLY "Serving Rome &
  Northwest Georgia". Street address (32 Paris Dr SW) lives in JSON-LD only, never
  visible copy (gate 15b).
- Schema type `HomeAndConstructionBusiness`. `RoofingContractor` is FORBIDDEN (gate 15a).
  No `aggregateRating` until testimonials are verified (gate 15a).

## Entity weighting (why the site exists)
Tree-first everywhere: homepage + city pages are tree content, nav lists Tree Services
before Storm & Roofing, internal links flow to tree pages. Roofing/storm exists as a
SECONDARY service section + informational blog content, never head-term architecture.

## URLs (gates 3, 7, 8, 12, 12b, 13)
- 100% extensionless internal hrefs; hubs live at `<dir>/index.html` linked as `<dir>/`.
- Never leading-slash internal links (path-prefix breaks on GitHub Pages project URLs).
- Canonical + og:url absolute on `data/site.json baseUrl`, extensionless. Cutover =
  flip `baseUrl`, regenerate cities + sitemap, re-verify.
- `tools/clean-links.mjs` normalizes any `.html` hrefs; run before verify.
- Sitemap: every page except 404.html, extensionless locs, no strays.

## Copy (gates 9, 14)
- NO em or en dashes anywhere, entities included. Ranges use "to": "$800 to $3,500+".
- Any cost range: broad industry ballpark only, trailing "+" on the top figure,
  explicit not-a-quote disclaimer. Elite's own prices never appear.
- FORBIDDEN site-wide: BBB accredited, GAF, chamber of commerce, veteran-owned,
  minority-owned, RB Roofing, land clearing / lot clearing / forestry mulching
  (Legacy Land Care client conflict), the private address, self license/insurance
  claims ("we are licensed", "licensed and insured").
- FORBIDDEN outside blog posts (strict set): any "N years" figure, the words
  "licensed" and "insured" in any context.
- ALLOWED: family-owned, 24/7 emergency response, live-fetched review numbers,
  honest regional storm response.
- CUTOVER BLOCKER: GA roofing license must be verified (license # in footer/schema)
  before DNS cutover or any live-domain "licensed" language. See rank-audit config.

## Structure per page (gates 1-6, 10, 11)
One h1. Unique title + meta description. og:type/url/title/description/image +
twitter:card. Valid JSON-LD. FAQPage mainEntity count == visible `.faq-question`
count. `<nav>` + `<footer>` present.

## Reviews
Live badge + reviews list hydrate from
`https://vbw-reviews.synergycloud.workers.dev/reviews?place=ChIJm-SuBmnaz0MRRNGQZ5GfNBs`
(worker repo: `~/vbw-reviews-worker`, Elite allow-listed 2026-07-23). Static fallback
text stays if the fetch fails. Never fabricate review text; the list renders only
API-returned reviews with "Powered by Google" attribution.

## Media
Every stock image carries `data-placeholder="replace-at-cutover"`. Real photos +
original logo file from Andrew are cutover blockers. GettyImages assets on their old
Duda site are NOT reusable (licensing).

## Workflow
```
node tools/generate-city-pages.mjs   # after editing data/cities.json
node tools/clean-links.mjs           # normalize hrefs
node tools/generate-sitemap.mjs      # after any page add/remove
npm run verify                       # must exit 0 before commit
```
