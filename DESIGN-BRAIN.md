# DESIGN BRAIN
# =============
# The persistent knowledge base for the SiteGeist website quality system.
#
# READ THIS FILE FIRST at the start of every session, build, or fix pass.
# It is the single source of truth for: stage, rules, learnings, and next work.
# Portable — copy it anywhere and the system still knows everything.
#
# END GOAL: every client website looks like it was designed by a world-class
# graphic designer. Feels like it should cost R100,000+. We charge R399/month.
# Client control via dashboard stays intact. Industry disruption.

---

## 1. CURRENT STATE

| Field | Value |
|-------|-------|
| Stage | 1 — Foundations |
| Target design score | 8.5 / 10 |
| Judge rubric | v1 |
| Status | Active — feedback loop starting |
| Last updated | 2026-10-14 |

### Stage ladder
1. **Stage 1** — Consistent 8.5 every build (layout, spacing, contrast, hierarchy, a11y, mobile)
2. **Stage 2** — Consistent 9.5 (craft: type, micro-spacing, states, motion, polish)
3. **Stage 3** — 10.0 on rubric v1
4. **Stage 4** — Tighten rubric → v2 (micro-detail, optical alignment, empty states, icon weight). Reset target to 8.5
5. **Stage 5–6** — Climb v2: 8.5 → 9.5 → 10
6. **Stage 7** — Brand-aware, graphic-designer level (art direction, custom identity, generative visual language)
7. **Stage 8+** — Forever learning. 2-year client upgrade cycles. Target ceiling keeps rising.

### Scoring model
- **Design score** — layout, type, color, spacing, states, consistency, a11y. **This is the gate.**
- **Image score** — stock photos may stay low. Never blocks the gate. Replaced with real client photos later.
- **Uniqueness score** — distinctiveness, brand fit, memorability. Tracked separately; always climbing.
- **Weighted gate** — homepage hero weighted highest. Critical floors cannot be averaged away.
- **Stock images** — the ONLY allowed low score.

---

## 2. DESIGN RULES (Constitution)
# These are non-negotiable. Judge against these. Fix passes must not violate them.

### 2.1 Typography
- Clear scale: display / h1 / h2 / h3 / body / small / micro
- Fluid scale with `clamp()` preferred
- Max readable line length ~65–75 characters
- Heading font = personality. Body font = readability.
- Never more than 2 families. Prefer one serif + one sans OR two sans with strong contrast.
- Optical alignment over mathematical alignment

### 2.2 Spacing rhythm
- Consistent vertical rhythm between sections (8px base grid)
- Section padding: generous on desktop (96px+), tighter on mobile (48–64px)
- Card internal padding consistent
- Whitespace is a design element — not leftover space

### 2.3 Color system
- Tokens: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-bg`, `--color-text`, `--color-muted`
- Contrast: WCAG AA minimum (4.5:1 text). CTAs need stronger contrast than body.
- One accent for action. Don't use accent for decoration at same weight as CTAs.
- Elevation via `color-mix` surfaces, not random grays

### 2.4 Component standards
- **Hero**: clear headline hierarchy, one primary CTA, readable text over image (overlay if needed), rating/trust optional. On mobile avoid dead bands — min-h should be 80vh not full screen when content is short.
- **Cards** (services, testimonials, pricing): consistent radius, shadow, padding; clear internal hierarchy
- **Forms**: visible labels (floating or persistent), clear focus states, validation messages near field, success confirmation
- **CTAs**: high contrast, consistent shape, hover/active states, obvious clickability
- **Images**: consistent treatment (aspect, radius, overlay). Alt text always present.
- **Footer**: contact info, nav, copyright. Never an afterthought.
- **STATS**: one source of truth (`config.stats` array). Every page shows the SAME numbers. Never invent fallbacks. Hide stats section when empty.
- **MAPS**: `mapEmbedUrl` must be the iframe-safe embed form. Empty map box = broken. Show address + directions instead.
- **HOURS**: when opens === closes (e.g. "Emergency only"), show the value ONCE. Never "Emergency only · Emergency only".
- **GALLERY GRID**: use centered flex-wrap or balanced grid so the last row has no single orphan tile.
- **ABOUT PROSE**: left-align multi-line body copy. Add hierarchy (pull-quote, subheads). Never a wall of centred text.
- **ACCENT TEXT**: never use bright accent colors for small text on light backgrounds. Use `--safe-eyebrow` (amber-700) for eyebrows/labels. CTA fills use `--color-primary-cta` (deepened for 4.5:1 white text).

### 2.5 Interaction & states
- Every interactive element: hover, focus-visible, active
- Forms: empty / filled / error / success / loading
- Modals & popups: clear close affordance, focus trap, backdrop
- Smooth motion: 150–300ms ease-out. Never bouncy without purpose.
- No layout shift on load (CLS ≈ 0)

### 2.6 Responsive
- Mobile-first. 3 breakpoints judged: 390 / 768 / 1440
- Tap targets ≥ 44px on mobile
- Sticky bars must not cover content
- Type never overflows container

### 2.7 Accessibility
- All inputs: label or aria-label
- Icon buttons: aria-label
- Keyboard navigable
- Focus visible
- Color contrast AA
- Alt text descriptive (not "image")

### 2.8 Content honesty
- No placeholder text ("Lorem ipsum", "Your Business Name")
- No empty sections that look broken (hide or show elegant empty state)
- Phone numbers SA format: 012 345 6789
- Spelling and grammar clean

### 2.9 Technical
- Working links (internal, tel:, mailto:, wa.me)
- Meta, OG image, schema, sitemap present
- Dashboard remains functional (auth, save, upload, leads)
- Security headers intact

---

## 3. PROTECTED FILES (fix passes must NEVER modify)
# If any of these change, revert immediately. Dashboard + platform depend on them.

```
public/dashboard/**
app/dashboard/**
app/api/save-config/**
app/api/upload/**
app/api/auth/**
app/api/leads/**
app/api/site-data/**
app/api/blob-urls/**
lib/auth.ts
lib/dashboard-middleware.ts
lib/use-site-data.ts
lib/blob-storage.ts
lib/control-flags.ts
lib/section-registry.ts
lib/feature-registry.ts
components/SectionRenderer.tsx
components/features/FeatureHost.tsx
site-config.json SCHEMA (values may be edited carefully)
next.config.js security headers
middleware.ts
```

### Allowed to edit (fix passes)
```
components/Hero.tsx, Services*.tsx, Gallery*.tsx, Contact*.tsx, Testimonials.tsx, ...
app/globals.css
app/page.tsx, app/*/view.tsx
tailwind.config.ts
design tokens inside globals.css
```

---

## 4. UNIQUENESS RULES
# Uniqueness is per-client. Design quality is universal. Never confuse the two.

### 4.1 Uniqueness dimensions (scored)
1. **Distinctiveness** — does it look custom, not template?
2. **Brand fit** — does it match THIS business (emergency vs luxury vs family)?
3. **Memorability** — one visual moment you remember
4. **Anti-collision** — not a clone of our other client sites

### 4.2 Brand input to capture per client
- Personality: warm / premium / urgent / family / technical / luxury / playful
- Audience
- Competitors
- One-line brand story
- Trade-specific visual metaphors

### 4.3 Uniqueness patterns learned
# (Append after every fix cycle — this is how uniqueness compounds)

| Date | Trade | What worked | Reusable pattern? |
|------|-------|-------------|-------------------|
| — | — | (first entries go here) | — |

### 4.4 Anti-collision
- Each site gets a **design DNA** record (palette, type, layout, motifs, tone)
- Before launch, compare against recent sites in the same trade
- If too similar → inject a differentiating art direction

---

## 5. TEMPLATE LIBRARY MAP
# Which templates exist and what they serve.

### Heroes
HeroFullscreen, HeroCentered, HeroSplit, HeroMinimal, HeroCard, HeroContact, HeroFeature, HeroGradient, HeroOverlapping, HeroShowcase, HeroStats, HeroTestimonial

### Services
ServicesGrid, ServicesCards, ServicesIconGrid, ServicesAccordion, ServicesAlternating, ServicesAsymmetric, ServicesFeature, ServicesList, ServicesMinimal, ServicesTabs, ServicesTimeline

### Gallery
GalleryMasonry, GalleryCategories, GalleryFilterable, GalleryCarousel, GalleryMinimal, GalleryLightbox, GalleryFilmstrip, GalleryCinematic, GalleryFullscreen, GalleryStack, GalleryBeforeAfter

### Contact
ContactMap, ContactFull, ContactSplit, ContactCentered, ContactMinimal, ContactCards

### Headers / Footers / Sections
HeaderSolid, HeaderCentered, HeaderTransparent, HeaderSplit, HeaderMinimal
+ team, blog, stats, process, trust, partners, areas, location, awards, social, newsletter, reviews, vsl, privacy, pricing, cta, faq, testimonials, about, features

---

## 6. FIX LOG
# Every fix pass is recorded here. Paste sessions into MiMo → templates get upgraded.

### Format
```
### <Date> — <Site> — Pass <N>
- **Trade:** ...
- **Archetype:** ...
- **Templates touched:** ...
- **Score before → after:** x.x → y.y (design score)
- **Rubric:** vN
- **Fixes applied:**
  1. <file> — <issue> → <change> | dimension: a → b
- **Uniqueness notes:** ...
- **Regressions checked:** dashboard ✓ form ✓ leads ✓
- **Template upgrade needed:** yes/no — which files
```

### Log
### 2026-10-19 — rvs_plumbing_potchefstroom_klerksdorp — Fix pass
- **Trade:** Plumbing Companies
- **Brand personality:** professional
- **Rubric:** v1 | **Target:** 8.5
- **Fixes requested:**
  1. app/services/page.tsx — Below the Leak Detection & Repair card the page renders a massive empty region (~1200px of blank cream) before the orange CTA band. Remaining five services are missing/not rendered. → Ensure ALL services from site-config.json are rendered as cards on the services page. If a section has no content it must render nothing (no empty padding blocks). Target max 120px between the last service card and the CTA band. Audit any min-h-screen or py-32 on empty containers and remove them. | layoutCraft | high
  2. components/About.tsx — Stats on the About page contradict the homepage: About shows "10+ Years / 500 Qualified Plumbers / 1000 min Emergency Response" while home shows "15+ / 3 / 60 min". Factual inconsistency destroys credibility. → Read stats from the same source as the homepage: config.stats array first, then hero.stat1Value..stat4Value. Do NOT hardcode fallback numbers like 500 or 1000. Use exactly the same values as StatsBar/Hero. If no stats configured, hide the stats block. | consistency | high
  3. components/Portfolio.tsx — Portfolio gallery contains a chocolate cake, a bakery bread display, a bedroom and a gardening trowel — completely unrelated to plumbing and looks like filler stock. Desktop tiles lose the photo-count caption. Final row has a single orphan tile. → Only show images from the site image map categories that match the trade. If unrelated images appear, filter them out or replace with trade-relevant placeholders (branded gradient + category icon). Keep photo-count captions on desktop AND mobile. Balance the grid so the last row does not have a single orphan tile (e.g. make the last tile span 2 columns or reduce column count on the final row). | layoutCraft | high
  4. components/LocationMap.tsx — Our Location panel renders an empty white card with a blank circle placeholder and no map. Looks like a broken unfinished embed. → Use config.mapEmbedUrl if present to render the Google Maps iframe. If no map URL, do NOT render an empty box — show a clean address block with a Get Directions button instead. Never leave a blank circle placeholder. | layoutCraft | high
  5. app/about/page.tsx — About page repeats the exact same Services > Portfolio > Testimonials > FAQ > CTA > Contact stack as the homepage. Every page is a near-copy of home, which makes the site feel template-driven and inconsistent. → Give the About page its own composition: hero, story/history, team or owner section, stats, values/process, then a single CTA. Do NOT duplicate the homepage section stack. Each page must have a distinct purpose and layout. | consistency | medium
  6. app/services/page.tsx — Services page also repeats the homepage section stack instead of focusing on services. → Services page composition should be: hero, services grid/list (all services), optional process steps, FAQ, CTA. Remove duplicated portfolio/testimonials/about blocks that belong on other pages. | consistency | medium
  7. app/contact/page.tsx — Contact page repeats the same generic stack. It should be focused and functional. → Contact page composition: hero, contact form, contact details (phone/email/hours), map or directions, optional short FAQ. Remove duplicated services/portfolio/about sections. | consistency | medium
  8. components/Footer.tsx — Footer wordmark contrast is weak and the footer repeats site content instead of being a clean utility footer. → Footer wordmark must meet 4.5:1 contrast (white or near-white on dark, or dark text on light). Keep footer to: logo/wordmark, short tagline, contact info, quick links, copyright. Do not repeat full page content. | contrast | medium
- **MiMo exit:** 0
- **Protected files:** intact ✓
- **Next:** run LLM Judge to score the changes
### 2026-10-17 — rvs_plumbing_potchefstroom_klerksdorp — Fix pass
- **Trade:** Plumbing Companies
- **Brand personality:** professional
- **Rubric:** v1 | **Target:** 8.5
- **Fixes requested:**
  1. components/Footer.tsx — Footer wordmark is rendered in pink/red on orange background — approximately 2:1 contrast, failing WCAG AA badly, and clashing with the header wordmark. → Set the footer wordmark to #FFFFFF at font-weight 700 on the orange background, OR invert the footer to a dark background (#1C1917) with the orange accent for the wordmark and light gray (#d6d3d1) body copy. All footer text must meet 4.5:1 contrast against its background. | contrast | high
  2. components/About.tsx — Stat tile shows "374min" for Emergency Response — an unformatted data value that reads as a bug. "Qualified Plumbers" text is clipped by the floating WhatsApp button. → Format the stat value and unit separately: large bold number plus a smaller muted unit label (e.g. big "374" + smaller "min"), or round to a friendly form like "Under 1 hour". Add bottom padding (pb-16) on the stats row so the floating WhatsApp/quote buttons never overlap card text. | layoutCraft | high
  3. components/Contact.tsx — Form inputs use placeholder-only labelling so labels vanish on typing. No visible error styling on invalid submit. No success confirmation after submit. → Add persistent visible labels above each input (not just placeholders) linked with htmlFor/id. On invalid submit set aria-invalid=true on the field and show an inline red message below it with role="alert". Style invalid inputs with a red border. After successful submit, replace the form area with a branded success panel (checkmark icon + thank-you message). | states | high
- **Skipped (protected/disallowed):** components/SectionRenderer.tsx (protected)
- **MiMo exit:** 0
- **Protected files:** intact ✓
- **Next:** run LLM Judge to score the changes
### 2026-10-16 — rvs_plumbing_potchefstroom_klerksdorp — Fix pass
- **Trade:** Plumbing Companies
- **Brand personality:** professional
- **Rubric:** v1 | **Target:** 8.5
- **Fixes requested:**
  1. components/Contact.tsx — Form validation uses only browser default tooltips. No designed error state, no inline per-field messages, no success panel after submit. This drops states score and a11y score. → Add visually-hidden or floating labels on every input (aria-label). On invalid submit set aria-invalid=true and show inline <p role="alert"> message in red under each field. After successful submit replace the form with a branded success panel (checkmark + thank-you message + optional dismiss). Style error borders 2px solid #dc2626. | states | high
  2. components/Contact.tsx — Primary submit CTA uses a saturated red that clashes with the orange CTA system used everywhere else on the site. Breaks visual consistency. → Change the submit button to use the same orange accent as the other CTAs (var(--color-accent) background with white or dark text meeting 4.5:1 contrast). Keep hover/active/focus states consistent with other buttons. | consistency | high
  3. components/Hero.tsx — Hero CTA button contrast is weak against the hero overlay. Text on the CTA is hard to read at small sizes. → Increase CTA contrast: use accent background with high-contrast text (>=4.5:1), add subtle shadow for separation from the hero image, bump font weight to 700 and size to 16px. Ensure focus-visible outline is clearly visible. | contrast | high
  4. components/About.tsx — Section eyebrow labels are low contrast on the light background. Small uppercase text fails WCAG AA. → Darken eyebrow/label color so it meets 4.5:1 on the background (use a darker shade of the brand accent, e.g. amber-700 range instead of bright orange for text). Keep bright accent for fills and icons only. | a11y | medium
  5. app/globals.css — Inconsistent spacing rhythm between sections on some pages. Some sections feel cramped, others uneven. → Standardize .section-padding to a consistent vertical rhythm (e.g. 96px desktop, 64px tablet, 48px mobile) and ensure all sections use it. Check that gaps between cards/rows follow an 8px grid. | whitespace | medium
  6. components/Portfolio.tsx — One portfolio/gallery tile renders as an empty white box with broken/missing image. Looks unfinished. → Ensure every gallery tile has a valid image or an elegant placeholder (branded gradient + icon) so no tile is ever empty. Add loading and error states for images. | layoutCraft | medium
  7. components/Services.tsx — Service card CTAs are not visually consistent with hero and contact CTAs. Hover/focus states vary. → Unify all CTA buttons to the same component styles: same radius, same accent color, same padding scale, same hover (lift/darken) and focus-visible ring. Ensure they look like one design system. | consistency | medium
  8. components/Header.tsx — Focus states on navigation links and mobile menu button are not clearly visible for keyboard users. → Add a clear :focus-visible outline (2px accent ring with offset) to all nav links, the logo link, and the hamburger button. Ensure mobile menu traps focus while open and restores on close. | a11y | medium
- **MiMo exit:** 0
- **Protected files:** intact ✓
- **Next:** run LLM Judge to score the changes
(First entries appear here as we run the loop)

---

## 7. JUDGE EVOLUTION
# Rubric versions. Scores are only comparable within the same version.

### Rubric v1 (current) — Stage 1–3
**Design dimensions (gate):**
1. visualHierarchy — eye flow, heading distinction, hero→services→CTA path
2. whitespace — breathing room, balance, rhythm
3. contrast — readability, CTA prominence, WCAG AA
4. layoutCraft — grid, alignment, component consistency
5. states — hover/focus/error/success/empty handled
6. consistency — same system across all pages
7. responsive — 390 / 768 / 1440 all hold up
8. a11y — labels, keyboard, contrast, alt text

**Image dimensions (non-blocking):**
9. imageQuality — resolution, crop, cohesion (stock allowed to score low)
10. imageAuthenticity — stock vs real (expected low until client photos)

**Uniqueness dimensions (tracked, not gated in Stage 1):**
11. distinctiveness
12. brandFit
13. memorability

### Rubric v2 (Stage 4+ — planned)
Add: optical alignment, icon weight consistency, shadow/elevation discipline, empty-state elegance, micro-copy quality, motion purposefulness, font loading, CLS, tap-target QA, footer craft, CTA conversion clarity, brand-voice consistency.

### Judge reliability
- Store `rubric_version` with every score
- Calibration reference sites (add as we collect goldens)
- Design score excludes image authenticity from the gate

---

## 8. COVERAGE MANIFEST REQUIREMENTS
# Judge must prove it evaluated everything enabled.

Required checklist per run:
- [ ] Homepage (hero, each enabled section)
- [ ] Every enabled page (about, services, portfolio, contact, team, blog, faq, reviews, areas, privacy)
- [ ] Every enabled feature state (quote popup, newsletter, cookie bar, WhatsApp FAB, sticky call bar, lightbox, hamburger)
- [ ] Form states (empty, error, success)
- [ ] 3 viewports (mobile / tablet / desktop)
- [ ] Footer
- [ ] Technical (meta, OG, schema, links)

Anything enabled but not judged = **FAIL** (not silent skip).
Disabled in dashboard = skip is valid, must be listed as "off".

---

## 9. WORKING AGREEMENTS
# How we operate the loop.

1. **One fix pass at a time.** You look between passes. Continue / accept.
2. **Every fix gets logged.** Template-level or site-specific.
3. **Template fixes happen here.** One site's fix → library-wide upgrade.
4. **Protected files locked.** Regression checks after every pass.
5. **Stock images never block the gate.**
6. **Raise the bar only after stage cleared.** 8.5 → 9.5 → 10 → tighten.
7. **Client control sacred.** Dashboard must still work after every change.
8. **2-year upgrades** — we keep design DNA + baseline so we can re-judge and upgrade later.

---

## 10. OPEN WORK
# What still needs doing. Update as we go.

### Immediate (Stage 1)
- [ ] Judge: per-dimension fix lists + uniqueness suggestions
- [ ] Multi-viewport + interactive-state screenshots
- [ ] Coverage manifest in judge output
- [ ] Fix-pass API with protected-file locks
- [ ] Fix log writer
- [ ] Built Websites: score badge + "Fix to 8.5" button
- [ ] Run first cycle on JJ Sand & RVS Plumbing

### Next
- [ ] Consistency scoring across pages
- [ ] Weighted scores + critical floors
- [ ] Regression checker (dashboard, forms, leads)
- [ ] Design DNA records per site
- [ ] Calibration golden sites

### Later stages
- [ ] Rubric v2 (micro-detail)
- [ ] Brand extraction + art direction engine
- [ ] Generative identity (icons, patterns, type systems)
- [ ] 2-year client upgrade workflow
- [ ] Dashboard UX redesign (separate session)

---

## 11. SESSION BRIEF
# For any new MiMo Code CLI session:

> Read DESIGN-BRAIN.md first. We are in Stage <N>, target <X.X>. 
> Design quality and uniqueness are separate. Stock images may score low. 
> Protected files must never change. 
> One fix pass at a time. Log everything. 
> Fix templates library-wide from logs. 
> End goal: Apple-tier custom design at R399/month.

---

## 12. SUCCESS VISION
# The North Star.

- Every site looks like a world-class designer built it
- Client feels it should cost R100,000+
- Dashboard gives them full control
- Score is 10/10 under ever-tightening standards
- No two sites look the same
- Builder gets faster and smarter every build
- Clients never want to leave

**We are not building websites. We are building a design system that learns.**
