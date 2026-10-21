# DASHBOARD AUDIT & REDESIGN PLAN
# =================================
# Full audit of the website dashboard: template coverage, UX/UI gaps, and a
# phased redesign that never breaks existing functionality.
#
# Scope: everything EXCEPT Overview and Email/Leads (user confirmed those are perfect).
# Principle: every template, component, feature must be controllable from the dashboard.

---

## 1. CURRENT STATE — WHAT EXISTS

### 1.1 Navigation structure (4 groups)

| Group | Items | Verdict |
|-------|-------|---------|
| **Overview + Email/Leads** | overview, leads | ✅ **PERFECT — do not touch** |
| **Content** | hero, content (page headings), about, services, gallery, pricing, testimonials, team, blog, faq | ⚠️ Confusing split |
| **Sections** | statsBar, process, latestWork, partners, awards, instagram, newsletter, video, vsl | ⚠️ Mixed with content |
| **Settings** | hours, seo, design-system, features, settings | ⚠️ Settings is a grab-bag |

### 1.2 What the website can render (Section Registry)

**Homepage sections (24):** hero, statsBar, services, process, gallery, beforeAfter, latestWork, testimonials, trustBadges, about, team, partners, video, serviceAreas, location, pricing, faq, blogStrip, awards, instagram, newsletter, cta, contact, vsl

**Pages (12):** home, services, portfolio, about, contact, privacy, teamPage, blogPage, faqPage, reviewsPage, areasPage, serviceDetailPages

**Features (13):** announcementBanner, stickyCallBar, whatsappFab, newsletterPopup, clickToCallFab, trustBadges, areasServedStrip, photoLightbox, beforeAfter, stickyHeader, scrollProgress, quoteSlideIn, cookieBar

### 1.3 Content editors that exist (SECTION_FIELDS)

process, latestWork, partners, awards, instagram, newsletter, statsBar, video, hours

**Sections with toggles but NO dedicated content editor in this system:**
hero, services, gallery, beforeAfter, testimonials, trustBadges, about, team, serviceAreas, location, pricing, faq, blogStrip, cta, contact

*(Many of these ARE editable via other tabs — hero has its own tab, services has a services editor, gallery has gallery editor. The gap is that the mental model is split.)*

---

## 2. CRITICAL GAPS

### GAP 1 — Per-page section placement (BIGGEST)

**Problem:** Sections are global on/off. Turn Process on → it appears on Home AND everywhere else.

**User need:** Process on Services page only. Or FAQ on Contact only. Or Gallery on Portfolio only.

**Impact:** Every page looks the same (judge flagged this). Can't customize page composition.

### GAP 2 — Confusing mental model

**Problem:** You go to one place for section headings (Page Headings) and another place for section content (Services, Gallery, etc.). A client has to hunt around.

**User quote:** *"you need to go to one place for the headings of each section and another place for the content of the pages and it's just getting confusing"*

### GAP 3 — Settings is a grab-bag

Currently: hours, seo, design-system, features, settings all crammed together.

**User want:** Settings as a proper section with sub-areas: Page Control, Features, Business Info, SEO, etc.

### GAP 4 — Template ↔ dashboard coverage

107 template components. Only 9 have dedicated editors in SECTION_FIELDS. Most are controlled indirectly (hero tab, services editor, gallery editor, feature toggles) but the connection is **not obvious to a client**.

**Need:** Clear mapping — every template piece has a visible control in the dashboard.

---

## 3. REDESIGN PROPOSAL

### 3.1 New information architecture

```
┌─ OVERVIEW              (unchanged — perfect)
├─ EMAIL / LEADS         (unchanged — perfect)
│
├─ WEBSITE CONTENT       (what visitors see — by page)
│   ├─ Homepage
│   │   ├─ Hero
│   │   ├─ Sections on homepage (drag-order + on/off)
│   │   └─ CTA Banner
│   ├─ Services Page
│   │   ├─ Hero
│   │   ├─ Services list
│   │   ├─ Process Steps        ← can put Process HERE only
│   │   ├─ FAQ
│   │   └─ CTA
│   ├─ Portfolio Page
│   │   ├─ Hero
│   │   ├─ Gallery
│   │   └─ CTA
│   ├─ About Page
│   │   ├─ Hero
│   │   ├─ Story / History
│   │   ├─ Stats
│   │   ├─ Team
│   │   └─ CTA
│   ├─ Contact Page
│   │   ├─ Hero
│   │   ├─ Form
│   │   ├─ Hours
│   │   ├─ Map
│   │   └─ FAQ
│   └─ Other Pages (Privacy, Team, Blog, etc.)
│
├─ DESIGN
│   ├─ Brand & Colors
│   ├─ Typography
│   ├─ Images / Gallery
│   └─ Design System
│
└─ SETTINGS
    ├─ Business Info (name, contact, hours, social)
    ├─ Page Control (turn pages on/off)
    ├─ Features (WhatsApp, quote popup, cookie bar, etc.)
    ├─ SEO / GEO
    └─ Domain / Advanced
```

### 3.2 Key UX changes

| Change | Why |
|--------|-----|
| **Sections organized BY PAGE** | Client thinks: "What's on my Services page?" not "What's a ProcessSteps section?" |
| **Per-page section lists** | Drag to reorder, toggle on/off per page |
| **One place per page** | Headings + content + layout all under that page |
| **Settings as a proper hub** | Page Control, Features, Business Info, SEO clearly separated |
| **Overview + Email/Leads untouched** | Already perfect |
| **Visual section previews** | See what each section looks like before enabling |
| **Smart defaults** | New site gets sensible page composition out of the box |

### 3.3 Per-page section model (new data structure)

```json
{
  "pageSections": {
    "home": ["hero", "services", "gallery", "testimonials", "cta", "contact"],
    "services": ["hero", "services", "process", "faq", "cta"],
    "about": ["hero", "about", "stats", "team", "cta"],
    "contact": ["hero", "contact", "hours", "map", "faq"],
    "portfolio": ["hero", "gallery", "cta"]
  }
}
```

This replaces the global `controls.sections` on/off with per-page lists. The SectionRenderer reads which page it's on and renders only that page's sections.

---

## 4. PHASED IMPLEMENTATION (nothing breaks)

### Phase 1 — Per-page sections (biggest win)
1. Add `pageSections` to site-config
2. SectionRenderer reads page context + renders only that page's sections
3. Dashboard: Homepage tab shows its section list; Services tab shows its section list
4. Migrate existing global toggles → per-page defaults (Home gets everything currently on)
5. **No UI redesign yet** — just make per-page work in current UI

### Phase 2 — Settings restructure
1. Move hours, SEO, features into Settings hub
2. Add Page Control (turn pages on/off) under Settings
3. Keep all existing settings functionality — just reorganize

### Phase 3 — Content tab consolidation
1. Group heading + content editors by page
2. "Services" tab = Services heading + services list + process + FAQ for that page
3. Remove the "Page Headings" vs "Content" split

### Phase 4 — Visual polish
1. Section previews / thumbnails
2. Consistent card layouts
3. Modern spacing, typography, iconography
4. Mobile-responsive dashboard

### Phase 5 — Full coverage audit
1. Map every template component → dashboard control
2. Add missing editors for any gaps
3. Document the mapping in DESIGN-BRAIN

---

## 5. WHAT STAYS THE SAME

- Overview tab (perfect)
- Email/Leads tab (perfect)
- Feature toggles (WhatsApp, quote popup, etc.)
- Stats/hours/maps editors (just wired better)
- All site-config data structures (additive changes only)
- Section registry + feature registry
- All template components and their rendering

## 6. WHAT MOVES

- Section on/off → per-page section lists
- Page Headings + Content → merged into page-centric tabs
- Hours + SEO + Features → under Settings hub
- Global "sections" nav → "Website Content" organized by page

## 7. WHAT'S NEW

- Per-page section composition
- Page Control in Settings
- Section previews
- Visual design polish on dashboard

---

## 8. TEMPLATE COVERAGE MATRIX

| Template family | Dashboard control | Status |
|----------------|-------------------|--------|
| Hero (12 variants) | Hero tab | ✅ |
| Services (11 variants) | Services editor | ✅ |
| Gallery (13 variants) | Gallery editor | ✅ |
| About (7 variants) | About content + stats | ✅ (needs page grouping) |
| Contact (6 variants) | Contact form + hours | ✅ (needs page grouping) |
| Testimonials (6 variants) | Testimonials editor | ✅ |
| Team | Team editor | ✅ |
| FAQ | FAQ editor | ✅ |
| Blog | Blog editor | ✅ |
| Pricing | Pricing editor | ✅ |
| Process | Process editor | ✅ (needs per-page placement) |
| Hours | Hours editor | ✅ (special hours just added) |
| Location/Map | Map URL + address | ✅ |
| Stats | Stats editor | ✅ (toggle now wired) |
| Features (13) | Features tab | ✅ |
| Footer (5 variants) | Not directly editable | ⚠️ Add basic footer controls |
| Header (5 variants) | Not directly editable | ⚠️ Add nav/brand controls |

---

## 9. RECOMMENDATION

Start with **Phase 1 (per-page sections)** — it solves the biggest UX gap (Process on Services only) and is additive. Then Phase 2 (Settings) which is pure reorganization. Phases 3-5 are polish.

Total estimated: 4 phases over multiple sessions. Each phase ships independently and is testable.
