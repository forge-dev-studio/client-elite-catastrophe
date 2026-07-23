# Elite Catastrophe Demo Site — Design Spec (2026-07-23)

Approved by Corey 2026-07-23 (chat). Revised same day per Corey: blog expanded 6 → 12 posts for full coverage of every measured keyword cluster. Attribution: **Synergy Telecom** (never Forge) on all Elite-facing deliverables.

## 1. Purpose

Build the cutover-ready demo site for Elite Catastrophe LLC (Rome GA tree service + storm-damage roofing, owner Andrew Rittenhouse, GBP 4.9★/76). The demo doubles as the production site at cutover (Dasher model: full build as the closer). It is also the proof-of-honesty artifact: every claim on it is verifiable.

**The strategic job of this site:** flip Google's read of the entity from "storm-restoration outfit" to "Rome GA tree company that also handles storm restoration." The 7/21 audit measured 1 pack cell of 1,140 (Rome "storm damage tree removal" #2), generic "tree service" at #13 despite 76 reviews beating 5 of 8 pack holders. Category-clean relevance wins this pack (Kingdom Tree proof: 17 reviews, in all 15 tree packs). Reviews are not the constraint; identity is.

## 2. Strategy (two measured models, combined)

- **Dr Roof geo-grid model → the TREE lane:** per-city landing pages for the real 0-25mi ring, tree-first content only.
- **ARAC content-engine model → the ROOFING lane:** informational blog content harvesting national/GA top-of-funnel volume with zero local competition. Roofing never gets head-term service architecture (Rome roofing packs owned by 500-600-review incumbents; audit verdict: do not sell).
- **Weighting discipline (non-negotiable):** homepage H1/title = tree company in Rome GA; city pages tree-only; nav lists Tree Services before Storm & Roofing; internal link mass flows to tree pages. Roofing is present but structurally subordinate. Schema type is NOT RoofingContractor.
- GBP surgery (separate workstream, not this build): primary category → Tree Service; storm/roofing kept as secondary categories ("Storm damage restoration service" aligns with the measured 110k/mo head term).

## 3. Data sources (all in ~/forge-rank-audit)

| File | Contents |
|---|---|
| results/elite-rank-grid-2026-07-21.md | 30kw × 38-market pack grid |
| results/elite-tree-top8-scorecard-2026-07-21.md | Rome tree pack competitive scorecard |
| results/elite-nroofers-blueprint-2026-07-21.md + elite-nroofers-labs-2026-07-21.json | The two content models + 1,820 ranked keywords across 5 N-ATL roofer domains |
| results/elite-volume-2026-07-21.json | 35-term GA + Rome volumes |
| results/elite-blogkw-volume-2026-07-23.json | Round-1 blog gap fill (75 seeds, US + GA) |
| results/elite-blogkw2-ideas-2026-07-23.json | Round-2 keywords_for_keywords expansion (issues + big-jobs lenses) |
| configs/elite-catastrophe.md | Config, integrity flags, license working assumption |

## 4. Architecture — 34 pages, extensionless URLs

```
/                               Home — tree-first identity
/about                          Honest trust page
/contact                        GHL form placeholder + phone (706) 676-7364
/reviews                        Live GBP badge (reviews-worker) + real review excerpts
/services/                      Services hub (tree section first, storm second)
/services/tree-removal          tree removal 1,600 GA + fallen/large/dangerous variants
/services/tree-trimming         tree trimming 880 + pruning 590
/services/stump-grinding        stump grinding 3,600 + stump removal 320
/services/emergency-tree-service  emergency tree service 5,400 US family + storm damage
                                  tree removal (their existing Rome #2 cell) + 24/7 framing
/services/storm-damage-restoration  SECONDARY LANE: storm damage roof repair 70 GA,
                                    storm damage restoration head term, hail/wind repair
/services/roof-tarping          roof tarp/tarping 6,600 US each, 260 GA, emergency tarp
/service-areas/                 Hub
/service-areas/{rome,lindale,cedartown,rockmart,calhoun,summerville,adairsville,cartersville}
                                8 city pages, tree-first, hand-written narratives,
                                storm-response mention, NO roofing city pages
/blog/                          Hub
/blog/{12 posts — section 5}
/404.html                       Base-href-injected (GitHub Pages nested-path pattern)
+ sitemap.xml, robots.txt, .nojekyll
```

## 5. Blog lineup — 12 posts, one per measured cluster (revised 2026-07-23 per Corey: full cluster coverage at launch)

**Flagship six (big-ticket job intent):**

| # | Post (working title) | Cluster + US/mo anchors | Job value |
|---|---|---|---|
| 1 | Tree Fell on Your House: Who Pays and What to Do First | neighbor-liability family ~6,000 combined + tree falls on house 1,300 + homeowners insurance for tree removal 1,600 | Insurance-funded removals (pillar) |
| 2 | Large and Hazardous Tree Removal: Cranes, Costs, When You Need a Pro | crane tree removal 880 + large tree removal 590 + cost to cut down large tree 480×4 variants + hazardous 590 + dangerous 390 | Biggest-ticket tree jobs |
| 3 | Is That Tree Going to Fall? Leaning Trees and Warning Signs | leaning tree 2,900 + signs a tree is dying 2,900 + how to tell if a tree is dead 2,900 + tree too close to house 720 | Hazard-removal pipeline |
| 4 | Will Insurance Replace Your Roof After Storm Damage? | roofer insurance claim 2,600 + roof replacement insurance 1,300 + does/will insurance cover 960 + how to get insurance to pay 880 | Full roof replacements |
| 5 | Roof Tarping After a Storm: Cost, How Long It Lasts, Who to Call | roof tarp + roof tarping 13,200 combined + how to tarp a roof 880 + emergency roof tarp 590 | Storm-job front door |
| 6 | How Much Does Tree Removal Cost in Georgia? | tree removal cost 12,100 + how much to cut down a tree 2,400 + large/oak/pine cost variants | Traffic + lead post |

**Coverage six (topical authority + traffic):**

| # | Post (working title) | Cluster + US/mo anchors | Lane |
|---|---|---|---|
| 7 | Attic Ventilation: Signs Your Roof Can't Breathe | attic fan 40,500 + soffit vents 27,100 + attic ventilation 22,200 + ridge vent 18,100 + roof ventilation 18,100 | Roof |
| 8 | What a New Roof Really Costs (and What Drives the Price) | roof replacement cost 22,200 + metal roof cost 12,100 + new roof cost 9,900 + roof repair cost 6,600 + inspection cost 2,900 | Roof |
| 9 | Water Stains on the Ceiling: Roof Leak or Something Else? | water stains/marks/spots on ceiling 3,600×4 + water dripping from ceiling 2,900 + roof leak repair cost 2,900 | Roof |
| 10 | What Hail Damage Looks Like on a Roof | hail damage roof 5,400 + what does hail damage look like 1,000×2 + hail damage shingles 1,300 + wind damage shingles 1,000 | Roof |
| 11 | Roof Flashing: Where Most Leaks Actually Start | roof flashing installation 6,600 + install chimney flashing 2,900 + step flashing 590 | Roof |
| 12 | Stump Grinding vs. Stump Removal: Which One Do You Need? | stump removal cost 5,400 + stump grinding cost 4,400 + stump removal 320 + stump grinding 3,600 GA | Tree |

Split: 5 tree-side + 7 roof-side. The roof lean is intentional — the blog IS the roofing lane (ARAC model); tree owns the service pages and city architecture. Every post internal-links to its matching service page and carries FAQPage schema where it answers question clusters.

Phase-2 backlog (post-cutover monthly content engine): metal-roof-over-shingles / materials questions (can you put metal over shingles 1,600×3 + fiberglass shingles 2,900 + Owens Corning 1,900), storm damage restoration GA-angle pillar (110,000 US head term), storm gutter damage angle, seasonal storm-prep content, city-angled variants of the flagship posts, refreshes. Excluded intents: B2B terms (tree service insurance = insurance FOR tree companies), botany terms, DIY-gear terms.

**Excluded content, permanent:** land clearing / lot clearing / forestry mulching (Legacy Land Care client conflict).

## 6. Design system

- Colors: Elite teal `#68ccd1`, yellow `#f7d000` (verified from their live Duda CSS), dark ink for text on white; AA contrast enforced (teal is light: use on dark backgrounds or as accent, never light-on-white body text).
- Type: Poppins (clean geometric sans, matches existing brand; complies with no-decorative-fonts rule).
- Components: sticky header w/ phone CTA, hero w/ dual CTA (Call + Free Estimate), service cards, review badge (live), city-page template, blog cards, footer with services + areas + NAP-lite.
- Photography: real Elite photos when Andrew provides; until then neutral/unsplash placeholders flagged `data-placeholder` (cutover blocker to replace — same as Dasher).

## 7. Schema

- Home: `HomeAndConstructionBusiness` (NOT RoofingContractor — would re-poison the entity) with name, phone, url, real address (32 Paris Dr SW Rome GA 30165 in schema only), geo, areaServed (8 cities), aggregateRating omitted until testimonial/rating verification (standing rule).
- Service pages: `Service` with provider ref + areaServed.
- City pages: `Service` + `areaServed` (SAB pattern — the standing rule for service-area businesses).
- Blog posts: `BlogPosting` + `FAQPage` where the post answers question clusters.
- Visible copy shows "Serving Rome & Northwest Georgia" — residential street address never in visible copy.

## 8. Integrity rules (hard gates, enforced by verifier where possible)

FORBIDDEN anywhere on the site: "15+ years" or any tenure claim; "BBB accredited"; GAF certification; chamber memberships; "veteran-owned"/"minority-owned"; "licensed" language (until license verified — see blockers); RB Roofing references; land-clearing services; fabricated reviews/ratings/hours; em dashes; Eric's home address.
ALLOWED: family-owned; 24/7 emergency response (their real model); real review count/rating (live-fetched); "insured" only after COI verification (else omit); regional storm response framed honestly.
Any price range shown gets a trailing "+" on the high figure (standing rule); default is NO pricing on the site.

## 9. Tech pipeline (Dasher pattern, ported)

- Static hand-authored HTML; shared CSS tokens file; vanilla JS (scroll effects, nav active-state on normalized resolved paths, lazy loading).
- `tools/generate-city-pages.mjs` from `data/city-data.json` with hand-written per-city narratives (never auto-stat filler); emits extensionless links.
- `tools/verify.mjs` ported from Dasher's 13 gates: unique titles/descriptions, canonical + og:url consistency, valid JSON-LD, no broken internal links, no em dashes, 100% extensionless internal hrefs, sitemap rules (no redirect stubs, blog included), plus new gate: forbidden-claims regex scan (section 8 list).
- Build must be path-prefix aware (GitHub Pages project URL) per standing Forge repo rules.

## 10. Deployment

- Repo: `forge-dev-studio/client-elite-catastrophe` (this local repo pushed there at build start).
- GitHub Pages from master; demo URL `forge-dev-studio.github.io/client-elite-catastrophe/`.
- **Check the github-pages environment branch policy FIRST** and add `claude/*` allow if feature-branch deploys are needed — this silently blocked Dasher deploys for weeks.
- `.nojekyll` at root (client-reports precedent).
- Production DNS/cutover: elitecatastrophe.com currently on Duda; swap only at cutover with Andrew.

## 11. Cutover blockers (recorded, not build blockers)

1. **GA roofing license — verify and get license # for footer/schema before DNS cutover or any live-domain roofing claims** (working assumption 2026-07-23: licensed, per Corey ~100%; also logged in forge-rank-audit/configs/elite-catastrophe.md).
2. GHL form + calendar IDs (sub-account not yet provisioned; see ~/elite-catastrophe GHL+Jobber project).
3. Real photos from Andrew replacing placeholders.
4. Testimonial verification before any rating schema.
5. "Insured" claim: COI sighted, else stays off.
6. DNS swap at Andrew's registrar + GBP website field update.
7. Owner-name publication check (Andrew vs "Byron A." on BBB — don't publish either without asking).

## 12. Out of scope for this build

GBP category surgery + citation cleanup (separate workstream); GHL/Jobber integration (own project); SMS/A2P; review-engine automation; Networx RB-slug disassociation; any AL-market content (GA-only until AL license verified).

## 13. Success criteria

- verify.mjs green across all 34 pages, zero forbidden-claim hits.
- Live demo URL serving the full extensionless matrix (every directory + nested path 200s).
- Entity test readable on the page: view-source shows tree-first titles/H1s/schema on home + city pages, storm/roofing subordinate.
- Live review badge rendering real GBP numbers with graceful fallback.
- Corey/Eric can walk Andrew through it as both the sales demo and the honest-marketing proof.
