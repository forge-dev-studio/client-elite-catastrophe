# Elite Catastrophe — Black + Orange Execution Playbook

Construction rubric for the restyle agent team AND the audit rubric. Derived from sourced
research (WebAIM, W3C WCAG 2.2, university brand guides, Halo Lab, wavespace/Humbleteam
case studies) with every contrast value **recomputed locally** (`scratchpad/contrast.mjs`)
because the research run's verifier phase failed on credits. Contrast numbers below are math,
not claims.

## 0. The one-sentence identity
Black-DOMINANT, orange-as-ACCENT. Black is the base and the anchor (header, hero, bands,
footer); white/paper carries reading content; orange is a scalpel, never a bucket.
If orange is filling large areas or setting paragraphs, it is wrong.

## 1. Locked palette (all values WCAG-verified)

| Token | Hex | Use | Verified |
|---|---|---|---|
| `--ink` | `#0d0d0f` | near-black base (NOT pure #000 — premium) | white body 17.4:1 |
| `--ink-2` | `#141417` | elevated dark surface, cards on dark | orange on it 6.4:1 |
| `--ink-3` | `#1e1e22` | hairline borders / dividers on dark | — |
| `--orange` | `#ff6a00` | **ON DARK ONLY**: kickers, key words, icons, rule-lines; and CTA button FILL | 6.76:1 on ink |
| `--orange-ink` | `#c2410c` | **ON WHITE**: orange text, links, small marks, UI borders | 5.18:1 on white |
| `--orange-hi` | `#ff8f52` | hover/active for orange on dark | 8.60:1 on ink |
| `--orange-lo` | `#a8360b` | hover/active for orange text on white | 6.57:1 on white |
| `--paper` | `#faf8f5` | light section base | ink 18.3:1 |
| `--white` | `#ffffff` | cards on paper | — |
| `--on-dark` | `#f4f2ef` | body text on ink | 17.4:1 |
| `--on-dark-mut` | `#b4b1ac` | muted text on ink | 9.1:1 |
| `--on-light` | `#0d0d0f` | body on paper/white | 18.3:1 |
| `--on-light-mut` | `#45433f` | muted on paper | 9.3:1 |

**Hard rules from the math (verifier gate 16 enforces the forbidden ones):**
- NEVER `#ff6a00` as text on white/paper (2.87:1 fail).
- NEVER white text on `#ff6a00` fill (2.87:1 fail). Orange buttons take **ink** text.
- On white, orange TEXT must be `--orange-ink` `#c2410c`; orange BUTTON fill either stays
  `--orange` with ink text, or `--orange-ink` with white text.
- Orange as a *meaningful* UI border on white = 2.71:1, fails 3:1. Keep orange lines on
  white decorative (paired with adjacent text); real focus rings on white use `--orange-ink`.

## 2. Color architecture / dark-section rhythm
Black-dominant means the structural anchors are dark and content breathes on light. Target
proportion on a full page: ~55% black surfaces, ~40% paper/white, ~5% orange.

Homepage rhythm (top to bottom): ribbon **dark** → header **dark** → hero **dark** (big) →
services **light** → why **light** → storm band **dark** → areas **light** → blog **light**
→ footer **dark**. Never two adjacent full sections both heavy-dark except header→hero
(intentional stacked black masthead). Interior pages: compact **dark** page-hero band, then
content on **light**, footer **dark**.

## 3. Orange usage rules (restraint)
- Orange appears as: the kicker eyebrow + its rule-line, ONE or two key words per headline
  (via `<strong>`/`.hl`), the primary CTA fill, link hover, icon strokes, the active-nav
  underline, small numeric accents (the 4.9 / 24/7 stats). That is the whole list.
- No orange paragraphs, no orange-filled hero, no more than one orange CTA competing per
  viewport. Secondary actions are ghost (ink outline on light, white outline on dark).
- Every orange link/action carries a non-color cue too (underline on hover, icon, or
  border) for color-deficient users.

## 4. Typography (Poppins, premium geometric)
- Display/H1: weight **200-300**, wide tracking `.01em`-`.14em`, large clamp. The thin wide
  wordmark look mirrors the CATASTROPHE logotype. One or two words per headline promoted to
  weight 600 or `.hl` orange for emphasis contrast.
- Kicker eyebrow: 600, uppercase, letter-spacing `.28em-.32em`, small, orange, with a
  34px orange rule-line before it.
- Body: 400, 1.7 line-height, `--on-*` tokens. Never thinner than 400 for body.
- Buttons/labels: 600, letter-spacing `.03em`.
- On dark sections headings use `--on-dark` with orange highlight words; on light use `--ink`.

## 5. Imagery (avoid cheap-stock look)
- Every photo on/near dark gets a treatment: a dark bottom-up gradient scrim
  (`linear-gradient(0deg, var(--ink) 0%, transparent 60%)`) so text/badges sit on it, plus
  a subtle warm multiply. Hero image sits in a **framed** container: thin `--orange` accent
  line on two sides (the E-frame motif), ink matte behind.
- Prefer tight, high-contrast nature/storm imagery; desaturate slightly toward the palette.
  Duotone (ink shadows, warm highlights) on at least the hero for cohesion.
- All stock stays `data-placeholder` (cutover swaps real Elite job photos, which will look
  far better than any stock and is the point).

## 6. Component patterns
- **Ribbon** (dark, thin): pulse dot orange, phone link orange→white hover.
- **Header** (dark): white wordmark ELITE + orange CATASTROPHE sub, white nav, orange
  active underline, ONE orange CTA button (fill + ink text). Scrolled = hairline `--ink-3`.
- **Hero** (dark): orange kicker, thin white headline w/ 1-2 orange words, muted lede,
  orange primary CTA + white-ghost secondary, framed treated image, floating review badge
  card (white card, orange stars, sits on the image scrim).
- **Service cards** (on light): white card, ink title, `--orange-ink` "learn more", lane
  chip (tree = ink-on-paper, storm = orange-tint bg). Hover: lift + `--orange` top-border
  accent (decorative, paired with content = allowed).
- **Storm/urgency band** (dark): orange kicker, white headline, big orange phone number,
  concentric ring motif in `--orange` at low alpha.
- **Stat accents**: the number in `--orange` (on light use `--orange-ink`), label ink.
- **Footer** (dark): white wordmark, `--on-dark-mut` body, orange link hover, orange hairline
  top border.

## 7. Build steps for the agent team
1. Replace the token block in `assets/css/styles.css` §`:root` with §1 tokens (keep names
   the pages already reference where possible; add new ones).
2. Recolor component layer per §6: header/hero/page-hero to dark; cards/sections light;
   bands/footer dark. Add `.hl` utility (orange highlight word: `--orange` on dark,
   `--orange-ink` on light via context).
3. Add image-scrim + frame CSS for hero/article-hero.
4. No markup rewrites needed for cascade pages (shared CSS). Touch `index.html` hero only
   for the dark treatment wrapper + scrim div, and any page that hard-codes a color inline.
5. Run `node tools/clean-links.mjs && npm run verify` (must stay green: 34 pages).
6. Screenshot sweep (desktop 1440 + mobile 390), compare against §2/§3/§6, fix, re-shoot.

## 8. Audit rubric (what "done" means)
- Contrast: every text/UI pair meets its threshold (spot-check with contrast.mjs).
- Restraint: no viewport has >1 primary orange CTA; no orange paragraph; orange ≈5% area.
- Rhythm: dark anchors present (header, hero, ≥1 band, footer); no muddy all-dark stack.
- Premium: thin wide display type, treated (not raw) hero photo, consistent framing.
- Integrity gates still green (no forbidden claims, extensionless URLs, name token, schema).
