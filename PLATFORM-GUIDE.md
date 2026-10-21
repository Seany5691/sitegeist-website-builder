# SiteGeist Website Platform — Complete Reference

Everything about how the websites are built, why they look the way they do, and
every button in the client dashboard.

Written for someone who needs to understand the system end to end — whether
that's you, a developer picking this up, or a sales conversation where someone
asks "how does it actually work?"

---

## Part 1 — What the platform is

A multi-tenant website builder that turns a scraped or typed-in business into a
production Next.js site with a client-facing dashboard. Three things make it
different from a template pack:

1. **Every site is designed, not templated.** An industry archetype plus a
   deterministic "design seed" means two bakeries get two genuinely different
   sites — not one layout with the logo swapped.
2. **The client gets real control.** Sections, pages and premium features are
   switchable, reorderable and editable from the dashboard, and the website
   re-flows live. Nothing is hardcoded in the page.
3. **Everything is wired to leads.** Every form on every site feeds one pipeline:
   Resend notification to the business, a row in Supabase, and a visible record
   in the dashboard.

### The three live case-study sites

| Business | Site |
|---|---|
| Mamma & Mia Cakes and Catering | `www.mammamiacakes.co.za` |
| Missions Ablaze | `missions-ablaze.sitespire.co.za` |
| Tammy's Sticker Shop | `tammy-s-sticker-shop.sitespire.co.za` |

GeistCRM (the platform admin) runs at `crm.sitespire.co.za`.

---

## Part 2 — How a website gets built

The build is a deterministic pipeline with one AI step in the middle. Nothing
about the *structure* is left to chance; the AI's job is design and copy.

```
 1. SCRAPE          lib/scraper.ts (2,412 lines)
                    Pull the business's existing site — services, copy, images,
                    contact details, socials, brand colours.

 2. MEDIA           lib/media-downloader.ts, lib/image-processor.ts
                    Download and normalise images. Build image-map.json.

 3. DETECT          lib/industry-templates.ts
                    Work out the industry archetype from the business name,
                    description, services and URL.

 4. DESIGN SEED     lib/design-seed.ts
                    Generate the visual fingerprint that makes this site unique.

 5. BOILERPLATE     lib/boilerplate-generator.ts (3,399 lines)
                    Emit the entire Next.js project — routing, API routes, the
                    dashboard, the section registry, the lead pipeline, GEO
                    files. This is the part that makes every site identical
                    under the hood.

 6. BRIEF           lib/creative-brief.ts, lib/prompt-builder.ts (2,652 lines)
                    Write the design brief, the .build-instructions/ folder and
                    the prompt that the AI build agent reads.

 7. AI BUILD        MiMo build agent
                    Chooses design variants, writes copy, styles the pages.
                    This is the ONLY non-deterministic step.

 8. VERIFY          tests, GEO audit, build checks
                    256 automated tests. The homepage must stay dynamic (never
                    prerendered) so the content is editable without a rebuild.
```

The key architectural split:

- **Deterministic (steps 1–6, 8):** routing, data shapes, the dashboard, the
  lead pipeline, SEO/GEO output, the section registry. Never varies.
- **Art-directed (step 7):** which hero layout, which service card style, the
  actual wording. This is where the visual variety comes from.

If the AI step were removed, the site would still work — it would just look like
a competent generic business site. The AI is the taste layer.

---

## Part 3 — What a website actually is

### The homepage is composed at runtime

The homepage does **not** list sections in code. `app/page.tsx` renders three
things and nothing else:

```tsx
<Header />
<main>
  <SectionRenderer />                 {/* reads the registry */}
  <FeatureHost placement="inline" />  {/* premium widgets */}
</main>
<Footer />
```

`SectionRenderer` looks up the Section Registry, checks what the client has
switched on, and composes only those sections **in the order the client chose**.
Turning a section off closes the gap. Backgrounds are assigned from the visible
index at render time, so the alternation never breaks.

### The Section Registry is the single source of truth

`lib/section-registry.ts` defines every section and page once:

```ts
{ id, label, component, kind: 'section' | 'page',
  background, navAnchor, dashboardTab,
  requiresContent, defaultOn, locked, order, description }
```

The page renderer, the navigation and the dashboard tab list **all read this one
file**. Add a section there and it appears everywhere.

### 24 homepage sections

Two are locked on (Hero and CTA — the always-on floor). The rest are the
client's choice.

| Section | Component | On by default |
|---|---|---|
| Hero | `Hero` | ✅ locked |
| Stats / By the Numbers | `StatsBar` | — |
| Services | `Services` | ✅ |
| Process / How It Works | `ProcessSteps` | — |
| Gallery / Portfolio | `Gallery` | ✅ |
| Before / After | `BeforeAfter` | — |
| Latest Work / Case Studies | `LatestWork` | — |
| Testimonials / Reviews | `Testimonials` | ✅ |
| Trust Badges / Certifications | `TrustBadges` | — |
| About | `About` | ✅ |
| Team | `TeamSection` | — |
| Partners / Sponsors | `PartnersStrip` | — |
| Video | `VideoEmbed` | — |
| Service Areas | `AreasServed` | ✅ |
| Location / Map | `LocationMap` | ✅ |
| Business Hours | `BusinessHours` | ✅ |
| Pricing / Packages | `PricingTable` | — |
| FAQ | `Faq` | ✅ |
| Blog (latest posts) | `BlogStrip` | — |
| Awards / Press | `AwardsPress` | — |
| Instagram / Social Feed | `SocialFeed` | — |
| Newsletter Block | `NewsletterBlock` | — |
| VSL (Video Sales Letter) | `VslPlayer` | — |
| CTA Banner | `CtaBanner` | ✅ locked |

**Empty means hidden.** A section that is switched on but has no content renders
nothing on the website — never a broken gap. The dashboard shows an empty state
so the client knows to fill it in.

### Pages

Home, Services, Portfolio, About, Contact, Privacy/Terms are always available.
Team, Blog, FAQ, Reviews and Areas We Serve are optional — each has its own
switch, independent of its matching section. So a client can have the Team
*section* on the homepage without a Team *page*, or vice versa. Four distinct
switches: `team.section`, `team.page`, `blog.section`, `blog.page`.

Every optional page has a graceful "switched off" state, and its menu link
disappears when the page is off.

### 13 premium features

Features are floating/modal/inline widgets, separate from sections. Each lives in
a **placement slot** — `top-banner`, `header`, `inline`, `footer`, `floating`,
`modal`. Every slot is mounted in the page; drop one and everything assigned to
it silently does nothing.

| Feature | Placement | On by default |
|---|---|---|
| Announcement / Holiday Banner | top-banner | — |
| Sticky "Call Now" Bar | floating | ✅ |
| WhatsApp Button | floating | ✅ |
| Newsletter / Lead Popup | modal | — |
| Click-to-Call Button | floating | — |
| Trust Badges Strip | inline | — |
| Areas We Serve Strip | inline | ✅ |
| Photo Lightbox | inline | ✅ |
| Before / After Slider | inline | — |
| Sticky Header (shrink on scroll) | header | ✅ |
| Scroll Progress Indicator | header | — |
| Request a Quote — Slide-in | floating | — |
| Cookie / Privacy Consent Bar | footer | — |

The right-side floating buttons stack vertically so Click-to-Call, WhatsApp and
the Quote Slide-in can all sit on the right without overlapping.

---

## Part 4 — The design system

Every colour and font on the site is a **CSS custom property**. Components never
hardcode a hex value — they reference a token. That is what lets one component
look correct in fifteen industries.

```css
:root {
  --color-primary:    /* buttons, CTAs, active states */
  --color-secondary:  /* accents, hover */
  --color-accent:     /* highlights, badges */
  --color-bg:         /* page background */
  --color-text:       /* body copy */
  --color-muted:      /* secondary copy */

  --font-heading:     /* display type */
  --font-body:        /* reading type */

  --radius-sm/-md/-lg/-xl/-full
  --shadow-sm/-md/-lg/-xl
}
```

Derived colours are made with `color-mix(in srgb, var(--color-primary) 8%, …)`
rather than by hand-picking tints. So a border tint, a card wash and a shadow
all shift automatically when the brand colour changes.

The design system page in the dashboard shows the client their exact palette,
typography and radii — and those values are **locked**, so a client editing
content cannot accidentally destroy the visual identity.

---

## Part 5 — Archetypes: how industry drives design

### 15 industry archetypes

Detection runs over the business name, description, services and scraped URL.

| Archetype | Industry |
|---|---|
| `photography` | Photography & Creative Services |
| `security` | Security Services & Protection |
| `medical` | Medical, Health & Wellness |
| `restaurant` | Restaurants & Food Service |
| `bakery` | Bakery & Baked Goods |
| `trades` | Local Trades & Technical Services |
| `legal` | Law Firms & Legal Advisory |
| `finance` | Accounting, Tax & Financial Services |
| `realestate` | Real Estate & Property |
| `education` | Education, Training & Community |
| `beauty` | Beauty, Lifestyle & Personal Care |
| `hospitality` | Hotels, Lodges & Accommodation |
| `retail` | E-Commerce, Retail & Consumer Goods |
| `saas` | Technology & SaaS |
| `nonprofit` | Nonprofit, Charity & Humanitarian |

### What each archetype carries

Each one bundles three things:

1. **3 style variants** — e.g. *Restaurant* offers Warm & Inviting, Modern &
   Sleek, Rustic & Traditional. *Legal* offers Authoritative & Traditional,
   Modern & Approachable, Premium & Luxurious.
2. **8 colour palettes** — e.g. *Bakery* offers Warm Brown, Cream & Pastel,
   Chocolate & Gold, Sage Cream, Dusty Rose, Terracotta, Lavender Honey,
   Forest Berry.
3. **3 typography pairings** — e.g. *Trades* offers Bold Condensed, Clean
   Modern, Technical Mono. *Beauty* offers Elegant Serif, Modern Sans,
   Script Accent.

There are also `themeMode` (light/dark) and default backgrounds per archetype.
A law firm is not going to get a pastel rounded playground; a bakery is not
going to get a black-and-steel industrial grid.

---

## Part 6 — How templates get chosen

### The Design Seed

Every business gets a deterministic fingerprint — the same business name always
produces the same seed, so a rebuild is reproducible. It sets **15 axes**:

| Axis | Options |
|---|---|
| `layoutStyle` | editorial · minimal · bold · elegant · playful · industrial |
| `gridDensity` | sparse · balanced · dense · masonry |
| `headerStyle` | transparent · solid · gradient · split |
| `cardGeometry` | rounded · sharp · pill · organic |
| `animationEasing` | smooth · snappy · bouncy · dramatic |
| `spacingScale` | compact · comfortable · spacious |
| `imageAspectRatio` | mixed · square · portrait · landscape |
| `colorIntensity` | muted · vibrant · neon · pastel |
| `densityProfile` | airy · balanced · dense |
| `decorativeIntensity` | minimal · subtle · expressive |
| `typographyPairing` | editorial-serif · modern-sans · bold-condensed · elegant-mix · friendly-rounded · technical-mono |
| `motionIntensity` | subtle · moderate · expressive |
| `staggerStrength` | none · light · medium |
| `artDirection` | editorial · minimal · bold · cinematic · warm-organic |
| `sectionOrder` | the build-time starting order |

### Archetype constraints narrow the seed

The seed is **not** free choice. Each archetype declares preferred and excluded
values, and the generator biases toward them. Examples from the constraint table:

- **Medical / Healthcare** — prefers `minimal`/`elegant` layouts, `modern-sans`
  type, muted/pastel colour, minimal decoration, subtle motion. Explicitly
  excludes `playful` and `industrial` layouts, `bold-condensed` type, neon.
- **Trades / Field Services** — prefers `bold`/`industrial`, `bold-condensed`
  type, vibrant colour, moderate-to-expressive motion. Excludes `elegant`,
  `playful`, `editorial-serif`.
- **Logistics / Freight** — minimal and industrial only, `minimal` decoration,
  `subtle` motion only. Excludes `warm-organic` art direction entirely.
- **Professional / Corporate** — editorial or minimal, serif or clean sans,
  muted/vibrant. No `friendly-rounded`, no `technical-mono`, no expressive
  decoration.

So a plumbers' site and a paediatric clinic can never drift into looking like
each other, no matter what the AI would otherwise prefer.

### The component library is the menu the AI picks from

`templates/components/` holds **107 components across 29 families**. The AI
writes the chosen variant to a canonical flat path (`components/Hero.tsx`,
`components/Services.tsx`, …).

| Family | Variants | Examples |
|---|---|---|
| heroes | 12 | HeroCard, HeroCentered, HeroFullscreen, HeroSplit, HeroGradient, HeroOverlapping, HeroShowcase, HeroStats, HeroTestimonial, HeroMinimal, HeroFeature, HeroContact |
| services | 11 | ServicesCards, ServicesGrid, ServicesAccordion, ServicesAlternating, ServicesTabs, ServicesTimeline, ServicesIconGrid, ServicesList, ServicesMinimal, ServicesFeature, ServicesAsymmetric |
| gallery | 14 | GalleryMasonry, GalleryCinematic, GalleryCarousel, GalleryFilterable, GalleryMinimal, GalleryCategories, GalleryStack, GalleryFilmstrip, GalleryLightbox, GalleryFullscreen, GalleryBeforeAfter, BeforeAfter, LatestWork, _Lightbox |
| about | 7 | AboutSplit, AboutLayered, AboutTimeline, AboutStats, AboutTeam, AboutMinimal, AboutVideo |
| contact | 6 | ContactSplit, ContactCentered, ContactFull, ContactMap, ContactMinimal, ContactCards |
| testimonials | 6 | TestimonialsCards, TestimonialsSlider, TestimonialsQuote, TestimonialsGrid, TestimonialsFeatured, TestimonialsMinimal |
| headers | 5 | HeaderCentered, HeaderSplit, HeaderMinimal, HeaderSolid, HeaderTransparent |
| footers | 5 | FooterFull, FooterCentered, FooterMinimal, FooterCompact, FooterDark |
| faq | 4 | FaqAccordion, FaqCards, FaqGrid, FaqMinimal |
| team | 2 | TeamSection, TeamPage |
| blog | 2 | BlogStrip, BlogPage |
| areas | 2 | AreasServed, AreasPage |
| features | 15 | the feature widgets + `FeatureHost` dispatcher + `icons` |
| singletons | 1 each | ProcessSteps, TrustBadges, PartnersStrip, AwardsPress, SocialFeed, NewsletterBlock, StatsBar, BusinessHours, LocationMap, PricingTable, VideoEmbed, CtaBanner, VslPlayer, ReviewsPage, PrivacyContent, AdditionalSections |

### What the AI is forbidden to touch

Everything structural is platform-owned and shipped before the AI runs. It writes
**only** the design variants: Hero, Services, Gallery, Testimonials, Faq, About,
Contact, Header, Footer.

It is explicitly forbidden from modifying the section registry, the feature
registry, control flags, `SectionRenderer`, `FeatureHost`, any `features/`
widget, the lead pipeline, the SEO/GEO files, or the dashboard. Those are listed
as DO-NOT-MODIFY rules in `.build-instructions/technical-rules.md` and are
enforced by shipping them into the project before the agent starts.

---

## Part 7 — How colours get chosen

There is a strict priority chain. Whichever source is highest and available wins.

```
 1. UPLOADED LOGO          extract colours from a client-supplied logo
                           → always wins, and discards scraped brand colours

 2. SCRAPED BRAND          colours lifted from the business's existing site
                           by lib/color-extractor

 3. THEME PALETTE          siteConfig.theme.palette, if it is a real palette

 4. ARCHETYPAL PALETTE     the industry's chosen palette (see Part 5)

 5. PLATFORM DEFAULT       #0ea5e9 / #6366f1
```

The resolver treats `#0ea5e9` + `#6366f1` as "not chosen yet", so an untouched
site correctly falls through to the archetype colours rather than looking
generic.

**Palette selection within the archetype** is deterministic: the design seed's
bytes index into the archetype's palette array, and a deterministic **hue
rotation** can be applied for further variation. Same business name → same
palette, every rebuild.

**Dark mode** is a property of the archetype (`themeMode`), not a separate
theme. Security and a few premium archetypes are dark by default.

**The logo engine** (`lib/logo-engine.ts`) generates a deterministic SVG mark
when there is no usable logo — one of six shapes chosen by an FNV-1a hash of
`businessName | industry | primary | accent`. Identical inputs give a
byte-identical SVG. Precedence is `uploaded > scraped > generated`; once a logo
is uploaded nothing downstream may overwrite it.

Every generated site also gets a favicon set (`icon.svg`, `apple-icon.png`,
`icon-192.png`, `icon-512.png`, `favicon.ico`) so WhatsApp and social previews
show the client's mark.

---

## Part 8 — Typography

The archetype supplies three pairings; the design seed picks one. The pairing
sets `--font-heading` and `--font-body`, and every component references those
tokens.

| Pairing | Feel |
|---|---|
| `editorial-serif` | Magazine, considered, established |
| `modern-sans` | Clean, contemporary, efficient |
| `bold-condensed` | Impactful, industrial, high-visibility |
| `elegant-mix` | Serif display with sans body, premium |
| `friendly-rounded` | Approachable, warm, human |
| `technical-mono` | Precise, specification-led |

Google Fonts are loaded with optimisation disabled (`optimizeFonts: false`) so a
build never fails when the font CDN is unreachable.

---

## Part 9 — The dashboard, start to finish

The client signs in at `/dashboard` on their own domain. Username and password
are environment-only (`DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD_HASH_BASE64`)
— never in a file that ships. Sign-in uses NextAuth with bcrypt and a rate
limiter (10 attempts per 15 minutes). The error message reports the *real*
reason, so a rate limit does not masquerade as a wrong password.

The sidebar is grouped into four sections.

---

### 📊 Overview

**Overview** — the health of the site at a glance: Total Visits, Unique
Visitors, Conversion Rate, Total Leads, GEO Score, each with a sparkline. Plus
Top Pages, Traffic Sources, an AI Visibility strip, health chips and a content
inventory.

Visits are counted by the site's own beacon into Supabase `page_views` — no
third-party analytics, so the numbers survive a hosting move. Total Visits is
non-bot page loads; Unique Visitors is distinct visitor hashes (salted and
rotated daily, so no IP or PII is stored). Bots are recorded separately so AI
crawler traffic is reportable.

**Email / Leads** — every enquiry from every form on the site. Status, Inbox
(delivery state), Name, Email, Phone, Message, Received, and actions to view,
mark read/unread, or redeliver. Above it: a stats strip (Total, Unread, Opened,
Delivered, Failed, Redelivered) and a filter for All / Never opened / Unread /
Pending / Delivered / Failed / Bounced.

The **Never opened** filter is the useful one — a lead that was delivered but
never opened is a lead the business probably missed.

**Download CSV** exports every lead in a chosen range (All time · Last 7/30/90
days · Custom). The file carries the full message plus the consent record, with
test leads flagged and spreadsheet-formula injection neutralised.

---

### 📝 Website content

| Tab | What it edits |
|---|---|
| **Hero Section** | Headline, subheadline, badge, CTA text + link, hero image (upload *or* paste a link) |
| **Page Content** | Banner heading/subheading/image for the Services, Portfolio, About and Contact pages |
| **About Page** | Title, tagline, three paragraphs, image |
| **Services** | The service list — name, description, price, image each |
| **Gallery** | Photo folders, drag to reorder, folder thumbnails, per-folder limit |
| **Pricing** | Package name, price, detail lines |
| **Testimonials** | Name, text, rating, and a **Source** field (Google, Facebook, Trustpilot, HelloPeter, X, Instagram, Email, Word of mouth, In person, Other) — never hard-coded |
| **Team** | Name, position, bio, photo. Drag to reorder. Count-aware layout: 1, 2, 3, 4 or 5+ members all centre correctly |
| **Blog** | Post title, content, image, date |
| **FAQ** | Question + answer pairs, drag to reorder |

---

### ➕ Homepage sections

These are the switchable homepage blocks. Each has a content editor, and all of
them are count-aware — one item is a larger centred card, two is a pair, three
or four fill a row, and five or more wrap into centred rows without leaving a
single lonely card on the last line.

| Tab | Content |
|---|---|
| **Stats** | Big numbers — value + label. Optional section title |
| **Process** | Steps (number, title, description, photo) **plus a layout choice: Steps, Timeline, or Cards** |
| **Latest Work** | Case studies — name, story, result highlight, photo, tags |
| **Partners** | Brand logos with links. Logos step up in size when there are only one or two |
| **Awards** | Award name, who gave it, year, badge, link |
| **Social Feed** | Photos to show plus your social profile links |
| **Newsletter** | Heading, body, button label |
| **Video** | YouTube / Vimeo embeds |
| **VSL** | A full Video Sales Letter player: upload a video *or* paste a link, small/medium/large sizing, autoplay with a delay, mute/unmute, optional CTA button, and a poster image |

Every photo field anywhere in the dashboard accepts **either** a file upload
**or** a pasted image link.

---

### ⚙️ Business & setup

| Tab | What it does |
|---|---|
| **Hours** | Section heading **and** the Monday–Sunday opening times, plus the "show hours beside the contact form" switch. One Save button for the lot |
| **SEO / GEO** | Page title, meta description, keywords, and a 13-point GEO checklist covering what AI search engines see — `robots.txt`, `llms.txt`, JSON-LD, sitemap, Open Graph |
| **Design System** | Read-only view of the site's palette, typography and radii. Locked so content editing cannot break the identity |
| **Features** | All 13 premium widgets. Each card carries a plain-English description of what it does. ON expands the edit panel; OFF collapses to a dim row so it stays discoverable |
| **Settings** | Business name, contact details, social links, Menu Labels, WhatsApp, location/coordinates, service areas, notification email |

---

### 🎛️ The control that ties it together

**Settings › Website Control** is split into two cards:

- **Website Sections** — the on/off switch for every homepage block, with up/down
  arrows (and drag and drop) to reorder. Hero is pinned first and CTA pinned
  last, so a client cannot break the page structure.
- **Website Pages** — the on/off switch for each page. Turning a page off removes
  its menu link.

Turning a section off removes it from the website **and** hides its dashboard
tab. Turning it back on restores both. Order is stored in
`controls.sectionOrder` and the site honours it at render time — no rebuild
needed.

**Menu Labels** renames every nav link without changing the URL. It covers the
core pages, the optional pages (Team, Blog, Reviews, FAQ, Areas) and — via an
"In menu" tick box — any homepage section you want as a menu item that jumps to
it on the page.

---

### 💾 Saving

- A **floating Save pill** appears the moment there are unsaved changes and
  hides again once saved. It stays in reach at the bottom of the screen.
- Every expanded feature card has its own **Save** button.
- Feature and section toggles **save immediately** and tell you to refresh the
  website — so nothing is silently lost when you navigate away.
- Section order changes save immediately too.

---

## Part 10 — The lead pipeline

Every capture point on every site — the contact forms (all six designs), the
Newsletter block, the Newsletter / Lead Popup, and the Quote Slide-in — posts to
one endpoint.

```
 visitor fills a form
        ↓
  POST /api/contact
        ↓
  ┌───────────────────────────────┐
  │ 1. Log to Supabase            │  form_submissions, tenant-scoped
  │    (status: pending)          │
  │ 2. Send via Resend            │  from leads@mail.sitespire.co.za
  │    (reply-to = the visitor)   │  subject names the lead type
  │ 3. Record the message id      │  for open/click webhook tracking
  └───────────────────────────────┘
        ↓
  business gets an email · dashboard shows the lead
```

**It never fakes success.** If Resend is unconfigured or delivery fails, the
visitor sees a real error and the row is marked failed with the reason. There is
no green tick that lies.

Every row is stamped with the site's `tenant_id` and every dashboard read filters
on it, so a client only ever sees their own leads. Part 12 covers how tenancy
works across the whole ecosystem.

The subject line tells the business at a glance what arrived:

- `New Lead — <Business>` (contact form)
- `Newsletter Signup — <Business>`
- `Quote Request — <Business>`

### Marketing consent (POPIA)

The Newsletter block and Lead Popup carry an opt-in:

> ☐ Yes, send me news, specials and updates.

**It is deliberately unticked by default.** POPIA defines consent as a
"voluntary, specific and informed expression of will" (s1) and places the burden
of proof on the business (s11(2)). A pre-ticked box records the absence of an
objection, not an affirmative act, and would be very hard to defend if
challenged.

Three things are stored per lead so the business can *prove* consent later:
the yes/no, the **exact wording shown**, and the **timestamp**. Leads collected
before this existed export as **"Not recorded"** — never as "No" and never as
"Yes".

Open and click tracking are recorded too, so the dashboard can show whether the
business actually read their own notification.

---

## Part 11 — GEO and AI visibility

Built in from the start so the business is findable by AI search, not just
Google.

- **Dynamic route handlers** generate `robots.txt`, `llms.txt`, `llms-full.txt`,
  `sitemap.xml`, `rss.xml` and the Open Graph image from live config at request
  time — so a content edit shows up without a rebuild.
- **JSON-LD** structured data (LocalBusiness, Service, FAQPage, speakable) is
  server-rendered into the homepage.
- **The homepage must stay dynamic (`ƒ` in the Vercel build).** If it ever
  prerenders as static, the schema freezes at build time and content edits stop
  appearing. This is an invariant.
- A **13-point GEO audit** in the dashboard scores what an AI crawler actually
  sees.
- The view beacon distinguishes human, bot and AI traffic so AI Visibility is a
  real metric.

**Domain swaps are free.** Site base URLs resolve from the request host at
runtime, not from a build-time environment variable. Point a new domain at the
project and the canonical URLs, sitemap, `llms.txt` and Open Graph tags all flip
on the next request. No rebuild.

---

## Part 12 — How tenancy works

There is **one Supabase project for the entire ecosystem**. Not one per site.

```
https://avejlkcqzfbqgmcjwmqh.supabase.co      ← single project
              ↑ one anon key, shared
   ┌──────────┴──────────┬───────────┬──────────┬──────────┐
GeistCRM  GeistBilling  GeistTrack  Builder  every website
```

Every database-backed app and every client website points at the same URL with
the same anon key. A new site does **not** get its own database — that would
defeat the point of the platform.

What *is* unique per site is one value: **`TENANT_ID`**, which is that site's row
id in `trial_websites`.

| | |
|---|---|
| `SUPABASE_URL` | same everywhere |
| `SUPABASE_ANON_KEY` | same everywhere |
| `TENANT_ID` | **unique per site** |

### Isolation

Every insert stamps `tenant_id`, and every dashboard query filters on it
(`.eq('tenant_id', env.TENANT_ID)`). A client signing into their dashboard sees
**only their own leads, their own page views, their own data** — the filter runs
before anything is returned. There is no cross-tenant leakage through the
product.

**Caveat worth knowing:** this filtering is enforced in *application code*, not
at the database. The RLS policies on `form_submissions` are permissive
(`using (true)`), and migration 016 records the intent:

> *Tenant scoping is enforced in site API routes via `.eq('tenant_id', env.TENANT_ID)`.
> Tighten to a signed JWT tenant claim when one exists.*

Because the anon key is a public key, a technically skilled person could query
the table directly and read rows across tenants. Normal clients never will, and
the product never exposes it — but it is not cryptographically impossible.

Moving to a signed JWT tenant claim would push the filter into RLS and close
this properly. That is a deliberate future hardening step, worth doing before
hosting genuinely competing businesses side by side.

---

## Part 13 — What every future website gets

This is the question that matters most: does the next build match the case
studies?

**Yes.** Verified against the live sites:

| Layer | Shipped to every new build |
|---|---|
| Section Registry + `SectionRenderer` | ✅ |
| Feature Registry + `FeatureHost` (all 6 placement slots) | ✅ |
| Control flags + `siteNavLinks` (registry-driven nav) | ✅ |
| All structural components (Team, Blog, Process, Stats, Partners, Awards, Social, Newsletter, Trust, Areas, Location, Hours, LatestWork, BeforeAfter, Reviews, Privacy, Pricing, CtaBanner, VslPlayer, VideoEmbed) | ✅ |
| All 13 feature widgets + `WhatsAppGate` | ✅ |
| The dashboard (all 26 tabs, export, reordering, consent) | ✅ |
| Lead pipeline + Resend + Supabase | ✅ |
| GEO / SEO dynamic routes + JSON-LD | ✅ |
| Logo engine + favicon set | ✅ |
| `.build-instructions/` (the rules the AI reads) | ✅ |
| Dashboard cache-buster, per-site `config.js` | ✅ |

The build agent writes only the nine design-variant components and is forbidden
from touching any of the above.

### What is actually required per new site

Very little, because the platform is shared:

1. **A `trial_websites` row** — which gives the site its `TENANT_ID`.
2. **Vercel env vars** — and only these are new:
   - `TENANT_ID` ← the only truly per-site value
   - `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD_HASH_BASE64` ← the client's login
   - `NEXTAUTH_SECRET` ← per site

   Everything else is **the same values every time**: `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
   `BLOB_READ_WRITE_TOKEN`. Copy them across.

3. **Nothing else.** Supabase migrations 016–018 are already applied to the
   shared project and never need doing again. Migration 019 (marketing consent)
   needs running **once**, for the whole ecosystem.

A new site does not need a new Supabase project, a new Resend account, a new
Blob store or a new database.

---

## Appendix — Technical notes worth knowing

- **One Supabase project serves the entire ecosystem — this is deliberate.** Do
  not create a database per site. Every site shares `avejlkcqzfbqgmcjwmqh` and
  the same anon key; only `TENANT_ID` differs. Scoping is by
  `.eq('tenant_id', env.TENANT_ID)` in the API routes.
- **Build-time images stay in the deployment filesystem.** A dashboard "delete"
  removes the reference only. This is deliberate: it means a site can always be
  reset to its original photos.
- **Vercel Blob is the runtime source of truth for `site-config.json`.**
  Hand-editing the local file does nothing on a live site — content changes go
  through `/api/save-config`.
- **`public/dashboard/assets/config.js` is per-site and must never be
  overwritten with the template.** The template is a skeleton full of
  `{{PLACEHOLDERS}}`; copying it over a live site makes the file fail to parse
  and blanks the entire dashboard.
- **The dashboard `?v=` cache-buster must be bumped whenever assets change.**
  A stale cache-buster makes every fix look broken to the person testing it.
- **Components use design tokens only.** Zero hardcoded hex colours anywhere in
  the section/feature library — that is what keeps them archetype-agnostic.
- **`AnimateOnScroll` is the flex/grid item.** Layout sizing for its children
  must go on its `className`, not on the inner element.
- **Tailwind arbitrary values use the underscore form** —
  `w-[calc(50%_-_1rem)]`, not `w-[calc(50%-1rem)]`.
- **Tests:** 256/256 passing across the intelligent pipeline, architecture,
  full pipeline, build-trial, full-output and prompt-system suites.

---

*Last updated: October 2026 — after the Full Control System (Phase 4), the
live-test regression sweep (Phase 5), the section-panel and alignment work, and
the lead export + POPIA consent build.*
