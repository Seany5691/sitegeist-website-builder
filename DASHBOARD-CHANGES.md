# Complete Dashboard & Backend Changes Documentation

## Overview
This document tracks **ALL changes** made to the Mamma Mia Cakes & Catering website dashboard and backend infrastructure. **These changes must be applied to the website builder template** to ensure all future websites have the same functionality.

**Critical Note:** This is a complete rewrite from filesystem-based storage to Vercel Blob storage, with authentication fixes, mobile dashboard fixes, draft-state fixes, and improved UX. Every change is documented here.

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Dec 2026 | 1.0 | Initial comprehensive documentation of all dashboard changes |
| Dec 2026 | 2.0 | **Critical fixes:** login JSON errors, phantom Unsaved Changes modal, Blob cache staleness, mobile hamburger, credential leaks |
| Dec 2026 | 2.1 | **Logout fix:** NextAuth signout requires CSRF; stale session let any password appear to log in and refresh restored the dashboard after Sign Out |
| Dec 2026 | 2.2 | **FAQ/Team save fix:** late placeholder functions shadowed the real editors. **Design System:** panel now shows the live brand palette/typography instead of hardcoded dummy values |
| Dec 2026 | 2.3 | **Menu labels editable** from dashboard. **Business hours visibility toggle** (hours now render on site). **WhatsApp widget** driven by site config (was hardcoded) |
| Dec 2026 | 2.4 | **Page Content Save button** + **inner page hero banner editors**. **Gallery folder rename**. **Contact form really sends email** (`/api/contact` + Resend) to the dashboard recipient. SEO titles from content. Videos editor + VideoEmbed on home. |
| Dec 2026 | 2.5 | **Toggle CSS fixed**. **Hours inside Contact** (form left / hours right; form centres when hours off). **Page Content panel rebuilt**. **Gallery display mode + limits + folder order**. **Hide unused dashboard sections** via `DASHBOARD_CONFIG.features`. |
| Dec 2026 | 2.6 | **Gallery tiles always centred** (1–4+ folders/pictures). **Homepage Gallery Display card polished + moved to bottom**. **Business hours editor polished**. **No native browser dialogs** — rename uses custom prompt modal; errors use dashboard toasts/modals. |
| Dec 2026 | 2.7 | **Gallery tiles larger** (folders ~340px, pictures ~300px). **Section spacing tightened** (`section-padding` 8rem→5.25rem desktop). **Winning formula** locked in section 24 — dashboard must match this site on every future build. |

---

## ⚠️ READ THIS FIRST — Website builder integration

**Every change in this document is template-wide.** When you apply these fixes in the website builder:

1. **Do NOT patch only one gallery layout or one site theme.** Apply to **every template / every build type** the builder generates (gallery masonry, folder grid, lightbox templates, industry presets, etc.).
2. **Shared code** (`lib/blob-storage.ts`, `lib/auth.ts`, `app/api/**`, `public/dashboard/assets/app.js` + `styles.css`, Contact/Header/Footer/Gallery components) must be identical across all templates — only `config.js` / seed content / colours differ.
3. **Per-template flags** live in `public/dashboard/assets/config.js` → `features` (and theme/designSystem). Each generated site sets which dashboard sections exist.
4. **After updating the builder template**, bump the dashboard cache version (`?v=x.y`) so every new site ships the new files.
5. **Regression checklist** in section 10 must be run on **at least one site per template type** before releasing the builder update.

If a gallery template has a custom component file name (e.g. `GalleryMasonry.tsx`, `GalleryFolders.tsx`), port the same `gallerySettings` behaviour into that file. The contract is the `siteConfig.gallerySettings` schema in section 16 — not a single filename.

**v2.0 is the authoritative version.** If a snippet below conflicts with the code, the live code in this repository wins.

---

## Table of Contents
1. [v2.0 Critical Fixes Summary](#1-v20-critical-fixes-summary)
2. [Vercel Blob Storage Integration](#2-vercel-blob-storage-integration)
3. [Authentication](#3-authentication)
4. [Website + Dashboard Data Loading](#4-website--dashboard-data-loading)
5. [Unsaved Draft System](#5-unsaved-draft-system)
6. [Mobile Dashboard](#6-mobile-dashboard)
7. [Security Requirements](#7-security-requirements)
8. [Environment Variables](#8-environment-variables)
9. [Deployment Process](#9-deployment-process)
10. [Testing Checklist](#10-testing-checklist)
11. [Website Builder Template Integration](#11-website-builder-template-integration)

---

## 1. v2.0 Critical Fixes Summary

These four bugs must **never** ship again on a generated website.

| # | Symptom | Root cause | Fix |
|---|---------|------------|-----|
| 1 | Login shows `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` | NextAuth callback returns an HTML redirect; client called `res.json()` on it | POST form-urlencoded to `/api/auth/callback/credentials`, **never parse that body**. Verify via `GET /api/auth/session`. Show `Incorrect username or password` when no session. |
| 2 | “Unsaved Changes” modal appears even with no edits | Auto-save wrote full snapshots every 30s; `clearDraft()` never ran (save returned `undefined`); Discard did not clear keys | Dirty flag; only autosave when dirty; `clearDraft()` on successful save **and** on Discard; skip modal when draft equals current data |
| 3 | Dashboard saves do not show on the website | (a) Blob `put()` cached 1 month, (b) site fetched raw blob URLs with no cache-bust, (c) dashboard read static `public/*.json` while saves went to Blob | `cacheControlMaxAge: 60` on `put()`; unified `GET /api/site-data` with `Cache-Control: no-store`; `export const dynamic = 'force-dynamic'`; dashboard + website both load from that API |
| 4 | Dashboard hamburger stays open; UI not mobile-friendly | `switchSection()` never closed the drawer; `.header-actions { display:none }` on phones; no overlay/scroll-lock | Close drawer on nav; overlay + `body.sidebar-open` scroll lock; icon-only header buttons on small screens; modal/form touch targets |
| 5 | Sign Out shows the login screen but refresh/dash comes back; any password then logs in | `POST /api/auth/signout` without CSRF is rejected — session cookie survives. Login then only checked “is there a session?”, so the leftover cookie authenticated every attempt | Sign out with CSRF + form-urlencoded + `json: true`, **verify session is empty** before leaving the dashboard; sign out again at the start of every login attempt so only the new attempt can create a session |
| 6 | FAQ (and Team) “Save” does nothing | Later **placeholder** `function addFaqItem()` / `addTeamMember()` (`// to be fully implemented`) overwrote the real editors at the bottom of `app.js` | Never redeclare editor functions. Delete placeholder stubs. Keep one implementation per editor. |
| 7 | Design System panel shows dummy colors/fonts (`#0ea5e9`, “System Font”) | Panel only read `siteConfig.designSystem` / `brandAssets`, which are empty; hardcoded fallbacks were used | Resolve theme from `siteConfig.designSystem` → `siteConfig.theme` → `DASHBOARD_CONFIG.theme` + `DASHBOARD_CONFIG.designSystem` (must match `app/globals.css`). Placeholder fallbacks must be the **real** brand values, not generic defaults. |
| 8 | Menu names not editable; business hours saved but never shown; WhatsApp number hardcoded | Labels lived in `Header.tsx` / `Footer.tsx`; no hours component; WhatsApp widget used literal strings | `siteConfig.navigation` drives Header/Footer labels. `siteConfig.showBusinessHours` + `BusinessHours` component on Home/Contact. `siteConfig.whatsapp` drives the chat widget. All editable in Settings. |

---

## 1.1 Client-editable content (dashboard must cover all of this)

**Editable (content):** business name, hero, about, page headings, services, pricing, testimonials, FAQ, blog, team, gallery images, contact info, social links, business hours (+ show/hide), **menu item labels**, WhatsApp (show/number/greeting), SEO, videos, logo.

**NOT editable (by design):** layout, colors, fonts, spacing, motion, section structure, CSS.

**Known remaining gaps (builder backlog):** see section 14.

---

## 2. Vercel Blob Storage Integration

### Problem
Vercel's serverless filesystem is **read-only**. Dashboard saves failed because the app tried to write to `/public/*.json` which doesn't exist in production.

### Solution
Integrated **Vercel Blob** storage to persist all config files and uploaded images, with a **short cache TTL** so dashboard saves are visible without redeploying.

---

### 2.1 New / Required Files

#### `lib/blob-storage.ts`

Complete blob storage helper with automatic fallback.

**v2.0 requirements (do not omit):**

```typescript
// JSON configs — cache must be SHORT or dashboard updates are invisible for up to a month
const blob = await put(filename, jsonString, {
  access: 'public',
  contentType: 'application/json',
  token: BLOB_TOKEN,
  addRandomSuffix: false,
  allowOverwrite: true,
  cacheControlMaxAge: 60, // seconds; Blob default is ONE MONTH
})

// Reads must never be served stale
const response = await fetch(url, { cache: 'no-store' })

// Image uploads also need a short TTL
const blob = await put(`uploads/${filename}`, file, {
  access: 'public',
  token: BLOB_TOKEN,
  addRandomSuffix: false,
  allowOverwrite: true,
  cacheControlMaxAge: 60,
})
```

**Why `cacheControlMaxAge`:** Vercel Blob’s default cache is **one month**. Overwriting `site-config.json` keeps the same public URL, so the CDN keeps serving the old file. Without this setting, “dashboard save works but website does not change.”

Also required in this file:
- `isBlobEnabled()` — true only when `BLOB_READ_WRITE_TOKEN` is set
- `saveJSON(filename, data)` → Blob in prod, filesystem locally
- `loadJSON(filename)` → fetch with `cache: 'no-store'`
- `uploadImage(file, filename)`
- `deleteFile(url)`
- `getPublicUrl(filename)`
- `getConfigUrls()` (kept for `/api/blob-urls` compatibility)

---

#### `app/api/site-data/route.ts` (NEW — primary data API)

**This is the single source of truth** for the public website and the dashboard.

```typescript
import { NextResponse } from 'next/server'
import { loadJSON, isBlobEnabled } from '@/lib/blob-storage'

// Must run at request time so dashboard saves are visible without a redeploy
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [siteConfig, imageMap, seo] = await Promise.all([
      loadJSON('site-config.json'),
      loadJSON('image-map.json'),
      loadJSON('seo.json'),
    ])

    return NextResponse.json(
      {
        success: true,
        siteConfig: siteConfig || null,
        imageMap: imageMap || null,
        seo: seo || null,
        source: isBlobEnabled() ? 'blob' : 'filesystem',
        updatedAt: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to load site data', error: String(error) },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  }
}
```

**Critical:**
- `export const dynamic = 'force-dynamic'` — without this Next.js prerenders the route at build time and content freezes forever.
- Response `Cache-Control: no-store`.
- Never point the browser at raw blob URLs for JSON config.

---

#### `app/api/blob-urls/route.ts` (kept for compatibility)

Still returns blob URLs for legacy callers. Also must include `export const dynamic = 'force-dynamic'`.

---

#### `scripts/seed-blob.js`

One-time script to upload initial config files to Blob. Run after first deploy (see Deployment).

---

### 2.2 Modified Files

#### `app/api/save-config/route.ts`
- `protectRoute(request)` (auth + origin check) before write
- `saveJSON('site-config.json' | 'image-map.json', …)`
- Returns `{ success, message, isProduction, requiresRebuild: false, savedUrls }`

#### `app/api/upload/route.ts`
- `protectRoute` before write
- `uploadImage(file, filename)` → full URL
- Filename: `${timestamp}-${safeName}`

#### `lib/use-site-data.ts` (public website)

**v2.0 behavior:**
- Fetches `GET /api/site-data?t=${Date.now()}` with `{ cache: 'no-store' }`
- Shares **one in-flight request** across all components (do not fetch per component)
- Falls back to `/site-config.json` + `/image-map.json` with cache-bust if API fails
- Exposes `{ config, imageMap, loading, isLoading }`
- Exposes `invalidateSiteDataCache()` (optional)

```typescript
// Shared in-flight request so every component does not fire its own fetches
let sharedRequest: Promise<SiteData> | null = null
let sharedData: SiteData | null = null
```

---

## 3. Authentication

### 3.1 Files

#### `lib/auth.ts`
- `CredentialsProvider` + bcrypt against `DASHBOARD_PASSWORD_HASH` **or** Base64-decoded `DASHBOARD_PASSWORD_HASH_BASE64`
- Rate limit: 5 attempts / 15 minutes per IP (`lib/rate-limiter.ts`)
- `pages: { signIn: '/dashboard', error: '/dashboard' }`
- JWT session, 24h

**Base64 hash (required on Vercel):** Vercel strips `$` from env values, which corrupts bcrypt hashes. Store the hash Base64-encoded in `DASHBOARD_PASSWORD_HASH_BASE64` and decode in code.

**Logging (v2.0):** never log the password (not even last 3 chars) and never log the raw hash or secret. Only log whether they are set.

#### `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 3.2 Dashboard login client — `public/dashboard/assets/app.js`

**v2.0 / v2.1 auth client (this exact pattern is required):**

```javascript
/** Fetch JSON only when the response is actually JSON (NextAuth may return HTML redirects). */
async function fetchJson(url, options = {}) {
  const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { ok: res.ok, status: res.status, data: null, isJson: false };
  }
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data, isJson: true };
}

async function getAuthSession() {
  try {
    const { ok, isJson, data } = await fetchJson('/api/auth/session');
    if (!ok || !isJson) return null;
    return data && data.user ? data : null;
  } catch (_) {
    return null;
  }
}

/**
 * Destroy the NextAuth session for real.
 * NextAuth /api/auth/signout POST requires a CSRF token — without it the
 * cookie stays and any password appears to log in afterwards.
 */
async function signOutSession() {
  try {
    const { ok, isJson, data } = await fetchJson('/api/auth/csrf');
    if (!ok || !isJson || !data?.csrfToken) {
      return { success: false, error: 'Logout service unavailable. Please try again.' };
    }
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken: data.csrfToken, json: 'true', callbackUrl: '/dashboard' }),
      credentials: 'same-origin',
    });
  } catch (e) {
    return { success: false, error: 'Logout failed. Please try again.' };
  }
  const session = await getAuthSession();
  if (session) {
    return { success: false, error: 'Logout failed - session is still active. Please try again.' };
  }
  return { success: true };
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  errorEl.style.display = 'none';

  if (!username || !password) {
    errorEl.textContent = 'Incorrect username or password';
    errorEl.style.display = 'block';
    return;
  }

  try {
    // Clear any leftover session first. Otherwise a stale cookie makes
    // every password "work" because we only checked for a session afterwards.
    await signOutSession();

    const csrf = await fetchJson('/api/auth/csrf');
    if (!csrf.ok || !csrf.isJson || !csrf.data?.csrfToken) {
      throw new Error('Login service unavailable. Please try again.');
    }

    await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        csrfToken: csrf.data.csrfToken, username, password,
        json: 'true', callbackUrl: '/dashboard',
      }),
      credentials: 'same-origin',
    });

    // Session created by THIS attempt only (old session was cleared above)
    const session = await getAuthSession();
    if (session) {
      errorEl.style.display = 'none';
      await showDashboard();
      return;
    }
    throw new Error('Incorrect username or password');
  } catch (error) {
    errorEl.textContent = error.message || 'Login failed. Please try again.';
    errorEl.style.display = 'block';
  }
}

async function logout() {
  const result = await signOutSession();
  if (!result.success) {
    // Stay put and surface the problem rather than pretending to be logged out
    alert(result.error || 'Logout failed. Please try again.');
    return;
  }
  clearDraft();
  isDirty = false;
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
  closeSidebar();
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  // clear username/password fields + any error text
}
```

**Auth rules (all required):**
1. POST credentials as `application/x-www-form-urlencoded` (NextAuth’s native format).
2. **Never** `res.json()` the credentials callback — it can be `<!DOCTYPE html>`.
3. Confirm via `/api/auth/session` after the attempt.
4. **Sign out before every login attempt** so a leftover cookie cannot make any password succeed.
5. **Sign out must use CSRF + form-urlencoded + `json: true`**, then re-check that the session is gone.
6. If sign-out cannot be confirmed, do **not** show the login screen as if it succeeded.
7. Wrong password → **“Incorrect username or password”** (not a JSON parse error).
8. Check `Content-Type` before parsing **any** auth response.

### 3.3 Login form (index.html)
- Username label/placeholder must say **Username** (not “Business Name”).
- Add `autocomplete="username"` / `autocomplete="current-password"`.

---

## 4. Website + Dashboard Data Loading

### Public website
`components/*.tsx` call `useSiteData()` → shared fetch of `/api/site-data`.

### Dashboard
`ensureSiteDataLoaded()` in `app.js`:
1. Fetches `/api/site-data?t=${Date.now()}` with `cache: 'no-store'`
2. Falls back to static `/site-config.json` + `/image-map.json` if the API fails
3. Never merges `localStorage` over server data (prevents cross-site contamination)

`loadDashboardData()` **must hydrate forms from `siteConfig`**, not from `window.DASHBOARD_CONFIG`:

```javascript
const sc = siteConfig || {};
const contact = sc.contact || {};
const social = sc.socialLinks || sc.social || {};
const seo = sc.seo || {};
document.getElementById('settingsPhone').value = contact.phone || sc.phone || '';
// ... same pattern for email, address, social, seo
```

`window.DASHBOARD_CONFIG` (`config.js`) is **setup/branding metadata** (business name, industry, theme, design system, paths). It is not the content source of truth for text/images — but **it is the source of truth for the Design System panel** when `siteConfig.designSystem` is absent.

### Design System panel (`loadDesignSystem`)

The Design System section must show the **same palette and fonts the live site uses** (`app/globals.css`).

Resolution order:
1. `siteConfig.designSystem` / `siteConfig.theme`
2. `window.DASHBOARD_CONFIG.designSystem` / `.theme`
3. Real brand defaults (not generic `#0ea5e9` / “System Font”)

Per-site `config.js` shape:

```javascript
theme: {
  primary: "#3C1414",      // MUST match app/globals.css --color-primary
  secondary: "#6B3A2E",    // --color-secondary
  accent: "#FFD700",       // --color-accent
  background: "#FFF8DC",   // --color-bg
  text: "#2C1810",         // --color-text
  fonts: {
    heading: "Playfair Display",  // MUST match --font-heading / layout.tsx
    body: "Lato",                 // MUST match --font-body
  },
},
designSystem: {
  seedId: "mamma-mia-warm-bakery",
  archetype: "Bakery",
  artDirection: "warm-organic",
  densityProfile: "balanced",
  decorativeIntensity: "warm",
  motionIntensity: "moderate",
  imageTreatment: [
    "Brand-color tint overlay on gallery images",
    "Vignette effect on category thumbnails",
    "Hero overlay for text readability",
  ],
  guardrails: [
    "Color palette locked to brand guidelines",
    "Typography pairing enforced",
    "Section structure preserved",
    "Image treatment consistency",
    "Button & form styling unified",
  ],
},
```

When the builder generates a site, **copy these values from that site’s `app/globals.css` and layout fonts.** Never leave the dashboard showing a different palette than the website.

### Navigation labels + feature toggles (`siteConfig`)

```json
{
  "navigation": {
    "home": "Home",
    "services": "Services",
    "portfolio": "Our Work",
    "about": "About",
    "contact": "Contact"
  },
  "showBusinessHours": true,
  "businessHours": [
    { "dayOfWeek": "Monday", "opens": "08:00", "closes": "17:00", "closed": false }
  ],
  "whatsapp": {
    "enabled": true,
    "number": "27721565654",
    "greeting": "Hi! How can we help you today?",
    "prefill": "Hi! I'm interested in your services."
  }
}
```

**Rules:**
- `components/Header.tsx` and `components/Footer.tsx` must read `config.navigation` (URLs stay `/services`, `/portfolio`, … — only the visible label changes).
- `components/BusinessHours.tsx` renders only when `showBusinessHours !== false` and `businessHours` is non-empty. Mounted on Home (before Contact) and Contact page.
- `components/WhatsAppWidget.tsx` reads `config.whatsapp` (fallback `contact.phone`); returns `null` when disabled or no number.
- Dashboard Settings has cards for **Menu Labels**, **Business Hours** (toggle + list), **WhatsApp Chat**.

### FAQ / Team editors

- One function per editor action (`addFaqItem`, `updateFaqItem`, `addTeamMember`, …).
- **Never** append “to be fully implemented” stubs at the bottom of `app.js` — a later `function addFaqItem()` declaration replaces the real one and Save appears dead.
- Modal submit buttons bind via `element.onclick = addFaqItem` in `openFaqEditor()` / `openTeamEditor()`.

### Init sequence (required order)
```
DOMContentLoaded
  → checkAuth()
  → ensureSiteDataLoaded()   // preload

checkAuth success / handleLogin success
  → showDashboard()
      → ensureSiteDataLoaded()
      → loadDashboardData()
      → restoreDraft()       // may show Unsaved modal
      → startAutoSave()
```

### Save functions
- `saveSiteConfig()` → POST `/api/save-config` → on success: `clearDraft()`, `isDirty = false`, toast, **return `true`/`false`**
- Section buttons (`saveHeroContent`, `saveAboutContent`, `savePageContent`, `saveSeo`, …) mutate `siteConfig` then `await saveSiteConfig()`
- `saveAllSettings()` applies contact + social fields **once**, then **one** `saveSiteConfig()` (never three parallel POSTs)
- `saveBusinessHours()` relies on the change listeners in `loadBusinessHours()` writing into `siteConfig.businessHours`, then one save

---

## 5. Unsaved Draft System

### Keys
- `localStorage.siteConfig_draft`
- `localStorage.imageMap_draft`

### Rules (all four required)

1. **Dirty flag.** `isDirty` is set on real edits (`input`/`change`), ignored while hydrating (`suppressDirty`).
2. **Autosave only when dirty.** Every 30s, write drafts only if `isDirty`.
3. **Clear on successful save.** `clearDraft()` + `isDirty = false` inside `saveSiteConfig()` success path.
4. **Clear on Discard.** `restoreDraft()` must call `clearDraft()` when the user clicks Discard.

### Modal gating
Before showing the Unsaved Changes modal, compare draft JSON to current in-memory data (`draftsMatchCurrent()`). If identical, silently delete the draft and **do not prompt**.

```javascript
if (draftsMatchCurrent(configDraft, imageDraft)) {
  clearDraft();
  isDirty = false;
  return false;
}
```

### `showUnsavedModal`
- Lists only the draft categories that actually differ
- Restore → parse drafts into `siteConfig`/`imageMap`, reload UI, keep `isDirty = true`
- Discard → `clearDraft()`, `isDirty = false`

---

## 6. Mobile Dashboard

### Required behaviors
1. **`switchSection()` closes the drawer** (`closeSidebar()`).
2. **Overlay** `#sidebarOverlay.sidebar-overlay` behind the drawer; click closes.
3. **`body.sidebar-open { overflow: hidden; }`** while open.
4. **Escape** closes the drawer.
5. **Do not hide `.header-actions`** on small screens — hide labels only, keep icon buttons (min 40–44px).

### CSS essentials (`public/dashboard/assets/styles.css`)

```css
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 35; }
.sidebar-overlay.open { display: block; }
body.sidebar-open { overflow: hidden; }

@media (max-width: 1024px) {
  .sidebar { transform: translateX(-100%); z-index: 45; }
  .sidebar.open { transform: translateX(0); box-shadow: 0 0 40px rgba(0,0,0,.25); }
  .main-content { margin-left: 0; }
  .menu-toggle { display: block; }
}

@media (max-width: 640px) {
  .header-btn span { display: none; }       /* icon-only, still visible */
  .header-btn { min-width: 40px; min-height: 40px; }
  .user-menu span { display: none; }
  .content { padding: 1rem 0.75rem; }
  .section-header { flex-direction: column; align-items: stretch; }
  .section-header-actions { width: 100%; margin-left: 0; flex-wrap: wrap; }
  .section-header-actions .primary-btn,
  .section-header-actions .reset-btn { flex: 1 1 auto; justify-content: center; min-height: 44px; }
  .modal-content { width: auto; max-width: calc(100vw - 24px); margin: 0 12px; }
  .form-group input,
  .form-group textarea,
  .form-group select { font-size: 16px; } /* prevent iOS zoom */
}
```

### JS essentials

```javascript
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const open = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('open', open);
  document.body.classList.toggle('sidebar-open', open);
}

function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  document.body.classList.remove('sidebar-open');
}
```

HTML (inside `#dashboard`, before `.sidebar`):

```html
<div id="sidebarOverlay" class="sidebar-overlay" onclick="closeSidebar()"></div>
```

---

## 7. Security Requirements

Every generated site MUST comply:

1. **No credentials in `public/`.** `config.js` must **not** contain username/password. Auth is env-only.
2. **No debug env endpoints.** Do not ship `app/api/debug/**`. (It leaked `NEXTAUTH_SECRET` prefix and bcrypt hash prefix.)
3. **No password/hash logging** in `lib/auth.ts` or anywhere else.
4. **`protectRoute`** (session + origin) on `save-config` and `upload`.
5. **Rate limiting** on login (5 / 15 min / IP).
6. After any leak, **rotate** `NEXTAUTH_SECRET` and the dashboard password.

---

## 8. Environment Variables

### Vercel (Production / Preview)

```bash
# Authentication
DASHBOARD_USERNAME=admin
# Base64-encoded bcrypt hash (Vercel strips $ from raw bcrypt)
DASHBOARD_PASSWORD_HASH_BASE64=JDJhJDEwJHZOMUFhWXA3RE96MDRzVFVWQlc1NGUzdFkuSmRhMkJFRlVyanRYRkdpYWJQazZIOWM1TGpD

# NextAuth
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://your-site.vercel.app

# Vercel Blob (REQUIRED in production — auto-added when Blob store is linked)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
```

Generate Base64 hash:
```bash
node -e "console.log(Buffer.from(process.env.HASH).toString('base64'))"
# or
echo -n '$2a$10$...' | base64
```

### Local `.env.local`

```bash
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD_HASH=$2a$10$...   # raw hash works locally
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
# Optional — local dev uses filesystem when unset
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
```

**Notes:**
- `BLOB_READ_WRITE_TOKEN` must be present in **Vercel** or saves fall back to filesystem and fail silently in production.
- If you create the Blob store in the Vercel project, Vercel injects the token automatically — verify it exists under Settings → Environment Variables.
- `.env.production` is an import template. **Uncomment / set `BLOB_READ_WRITE_TOKEN`** when documenting the template; never leave it commented in production.

---

## 9. Deployment Process

### 9.1 First-Time Setup

1. **Create Vercel Blob**
   - Vercel Dashboard → Project → **Storage** → Create → **Blob** → Public
   - Confirm `BLOB_READ_WRITE_TOKEN` appears in Environment Variables

2. **Add environment variables** (section 8)

3. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

4. **Seed Blob**
   ```bash
   # Put BLOB_READ_WRITE_TOKEN in .env.local first
   node scripts/seed-blob.js
   ```

5. **Verify**
   - `GET https://your-site.vercel.app/api/site-data` returns JSON with `source: "blob"` and your content
   - `GET https://your-site.vercel.app/api/blob-urls` returns `*.blob.vercel-storage.com` URLs

### 9.2 Subsequent Deployments

```bash
npm run build
vercel --prod
```

No rebuild is required for content-only changes — dashboard saves go to Blob and `/api/site-data` is `force-dynamic`.

---

## 10. Testing Checklist

### Authentication
- [ ] Wrong password → **“Incorrect username or password”** (never a JSON parse error)
- [ ] Wrong username → same friendly error
- [ ] Correct credentials → dashboard opens **without** needing a manual refresh
- [ ] Wrong password → **“Incorrect username or password”** even if a session was previously active
- [ ] Sign Out → login screen; **refresh stays on the login screen** (session cookie is gone)
- [ ] After Sign Out, wrong password is rejected; only correct credentials open the dashboard
- [ ] If Sign Out cannot destroy the session, an error is shown (UI does not fake a logout)
- [ ] Session persists for 24 hours
- [ ] Logout works
- [ ] Rate limiting works (5 attempts / 15 minutes)

### Blob / content sync
- [ ] Dashboard save (Hero, About, Content, Settings, SEO) updates the live site within ~60s (usually immediately)
- [ ] Image uploads work and appear on the site
- [ ] `GET /api/site-data` reflects saved content without redeploy
- [ ] `/api/site-data` and `/api/blob-urls` are **Dynamic (ƒ)** in `next build` output (not Static ○)
- [ ] Local development uses filesystem when no Blob token

### Unsaved drafts
- [ ] Open dashboard, wait 60s with no edits, refresh → **no** Unsaved Changes modal
- [ ] Edit something, wait for autosave, refresh → modal appears; Restore keeps edits
- [ ] Same flow, click Discard → modal does **not** reappear; drafts cleared
- [ ] Save a section → drafts cleared; refresh shows no modal

### Content editors
- [ ] FAQ → Add → fill Question + Answer → **Save** → item appears in the list and on the live site
- [ ] FAQ → Edit → Save updates the item
- [ ] FAQ → Delete confirms and removes
- [ ] Team / Blog / Pricing nav items **hidden** when `features` is false or there is no content
- [ ] Menu Labels: change “Portfolio” to “Our Work” → Save → Header **and** Footer update; URL stays `/portfolio`
- [ ] Business Hours toggle OFF → form centred; ON → form left + hours right
- [ ] WhatsApp toggle OFF → chat button disappears; ON + number → button works
- [ ] Toggles are clearly visible (switch not overlapping text)
- [ ] Page Content: Save Changes toast; banner fields update inner page heroes
- [ ] Gallery: Rename keeps order and photos; ↑ ↓ reorder works
- [ ] Gallery: pictures mode with limit → “View full Gallery” shows all
- [ ] Gallery: folders mode shows folder tiles; click opens folder
- [ ] Single image / single folder is **centred**
- [ ] Contact form emails the dashboard recipient (when `RESEND_API_KEY` set)

### Design System
- [ ] Palette matches `app/globals.css` exactly (Primary/Secondary/Accent/Background/Text hex values)
- [ ] Typography shows the real heading/body fonts (e.g. Playfair Display / Lato — not “System Font”)
- [ ] Archetype / art direction reflect the site builder values (e.g. Bakery / warm-organic)
- [ ] Changing the site palette in `globals.css` + `config.js` is reflected in the dashboard after deploy

### Mobile
- [ ] Hamburger opens drawer; selecting a nav item **closes** it
- [ ] Overlay tap and Escape close the drawer
- [ ] Body does not scroll behind the open drawer
- [ ] View Site / Enhance still reachable on a phone (icons)
- [ ] Save/Reset buttons usable at 375px width
- [ ] Modals fit with side margins on a phone
- [ ] Focusing inputs does not zoom the iOS page

### Build & security
- [ ] `npm run build` succeeds
- [ ] No Google Fonts build errors
- [ ] No `/api/debug/env` route
- [ ] No username/password in `public/dashboard/assets/config.js`
- [ ] Vercel logs do not print passwords or full hashes

---

## 11. Website Builder Template Integration

### Critical Notes

1. **Apply v2.0 as a single atomic template update** — partial integration will reintroduce the login/cache/draft bugs.
2. **Every new site needs:** Blob store linked, env vars set, `seed-blob.js` run once.
3. **Increment cache-bust** in `public/dashboard/index.html` (`?v=4.0`) on every template release.
4. **Never put credentials in generated `config.js`.**

### Integration Order

1. Install `@vercel/blob`
2. `lib/blob-storage.ts` — with `cacheControlMaxAge: 60` and `fetch(..., { cache: 'no-store' })`
3. `app/api/site-data/route.ts` — with `export const dynamic = 'force-dynamic'`
4. `app/api/blob-urls/route.ts` — with `export const dynamic = 'force-dynamic'`
5. `app/api/save-config/route.ts` + `app/api/upload/route.ts` — `protectRoute` + blob helpers
6. `lib/use-site-data.ts` — shared `/api/site-data` fetch
7. `lib/auth.ts` — Base64 hash decode, safe logging only
8. `app/api/auth/[...nextauth]/route.ts`
9. Dashboard `index.html` — overlay, username label, `?v=4.0`
10. Dashboard `app.js` — login handler, dirty drafts, `closeSidebar`, `ensureSiteDataLoaded`, settings hydration
11. Dashboard `styles.css` — mobile rules in section 6
12. Dashboard `config.js` — **no credentials**
13. `scripts/seed-blob.js`, `.env.example`, `.env.production` (with `BLOB_READ_WRITE_TOKEN` documented as required)
14. **Delete** any `app/api/debug/**`
15. Test locally → deploy → seed blob → run section 10 checklist

### Per-site customization only
- `public/dashboard/assets/config.js` — businessName, industry, city, ownerName, contact defaults, social defaults, SEO defaults, **theme + designSystem (must match `globals.css`)**, paths
- `DASHBOARD_USERNAME` / password hash in env
- Content in `public/site-config.json`, `image-map.json`, `seo.json` (then seeded to Blob)
- `app/globals.css` color/font variables and `app/layout.tsx` font links — keep in sync with `config.js` theme

Everything else must stay identical across all generated websites.

---

## 12. Contact form email (required on EVERY generated site)

Website contact form → `POST /api/contact` → **Resend** → inbox of the dashboard **Contact Form Recipient**.

### One-time platform setup (once for you, not per client)

1. Create a free account at **https://resend.com**
2. Verify your sending domain (e.g. `mail.yourbuilder.com`) — recommended for production
3. Create an API key → `RESEND_API_KEY`
4. Set the from address, e.g. `Mamma Mia Website <no-reply@yourbuilder.com>` → `EMAIL_FROM`

You can reuse **the same** `RESEND_API_KEY` + `EMAIL_FROM` on every website you generate.

### Per-site Vercel environment variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="Site Enquiries <no-reply@yourbuilder.com>"
# Optional fallback recipient if dashboard has no email set:
# CONTACT_FORM_FALLBACK_TO=you@yourbuilder.com
```

### Per-site client setting

Dashboard → **Settings → Contact Information → Contact Form Recipient**  
= the email that should receive enquiries (falls back to the main Email field).

### How it works (do not change casually)

| File | Role |
|------|------|
| `app/api/contact/route.ts` | Validates input, loads `siteConfig.contactForm.to` (or `contact.email`), sends via Resend, never fakes success |
| `components/Contact.tsx` | Posts JSON to `/api/contact`; shows real success/error toasts |
| `lib/blob-storage.ts` `loadJSON` | Reads recipient from Blob so each site has its own inbox |

**Rules:**
- If `RESEND_API_KEY` is missing, return **503** with a clear message — never pretend the message was sent.
- `reply_to` is set to the visitor’s email so the client can hit Reply.
- Recipient comes from **site config**, not hardcoded.

### Smoke test

1. Set recipient in dashboard → Save Contact Info  
2. Submit the contact form on the live site  
3. Inbox receives an email titled `New enquiry from <Business> — <Name>`  
4. Submit with empty name → 400 error toast  

---

## 13. File Inventory (v2.0)

### Created
| File | Purpose |
|------|---------|
| `lib/blob-storage.ts` | Blob + filesystem storage helper |
| `lib/use-site-data.ts` | Shared no-store site data hook |
| `lib/page-meta.ts` | SEO metadata from site content |
| `lib/dashboard-middleware.ts` | `protectRoute` (auth + origin) |
| `lib/rate-limiter.ts` | Login rate limit |
| `app/api/site-data/route.ts` | Unified no-store content API (website + dashboard) |
| `app/api/blob-urls/route.ts` | Legacy blob URL endpoint |
| `app/api/contact/route.ts` | Contact form → email delivery |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `app/api/save-config/route.ts` | Auth + blob save |
| `app/api/upload/route.ts` | Auth + blob upload |
| `components/PageHero.tsx` | Inner page banner from `siteConfig.pageHeroes` |
| `components/BusinessHours.tsx` | Hours list (gated by `showBusinessHours`) |
| `scripts/seed-blob.js` | One-time Blob seeding |
| `.env.example` / `.env.production` | Env templates |
| `BLOB-QUICKSTART.md` | Short deploy guide |
| `DASHBOARD-CHANGES.md` | This document |

### Modified
| File | Purpose |
|------|---------|
| `lib/auth.ts` | Base64 hash, safe logging |
| `app/layout.tsx` | CDN fonts |
| `app/globals.css` | Font variables |
| `components/Header.tsx` | Nav labels from `siteConfig.navigation` |
| `components/Footer.tsx` | Same nav labels |
| `components/Contact.tsx` | Real `/api/contact` submit |
| `components/WhatsAppWidget.tsx` | From `siteConfig.whatsapp` |
| `app/page.tsx` | VideoEmbed + BusinessHours mounted |
| `app/services|portfolio|about|contact/page.tsx` | PageHero + generateMetadata |
| `public/dashboard/index.html` | Page heroes, menu labels, hours toggle, WhatsApp, contact recipient, rename folder, `?v=4.4` |
| `public/dashboard/assets/app.js` | All dashboard editors/saves |
| `public/dashboard/assets/styles.css` | Mobile + toggles |
| `public/dashboard/assets/config.js` | **Credentials removed**; theme + designSystem |
| `package.json` | `@vercel/blob` |

### Deleted (must not ship)
| File | Reason |
|------|--------|
| `app/api/debug/env/route.ts` | Leaked secret/hash material |

---

## 13. Troubleshooting

### Login: “Unexpected token '<' … is not valid JSON”
**Cause:** Client parsed the NextAuth HTML redirect.  
**Fix:** Use the v2.0 `handleLogin` pattern (form-urlencoded + session verify). Never `res.json()` the callback.

### Login: “Incorrect username or password” with correct password
**Cause:** Env hash does not match the password, or `DASHBOARD_PASSWORD_HASH_BASE64` is missing/mangled.  
**Fix:** Regenerate Base64 hash, set in Vercel, redeploy. Check logs for `Hash loaded: yes` / `Hash length: 60`.

### Website shows old data after dashboard save
**Causes & fixes:**
1. Blob still has default 1-month cache → set `cacheControlMaxAge: 60` on every `put()`
2. Frontend cached the response → `cache: 'no-store'` + `?t=` timestamp
3. API route was static → `export const dynamic = 'force-dynamic'`
4. `BLOB_READ_WRITE_TOKEN` missing → saves go to filesystem and fail in prod
5. Blob never seeded → run `node scripts/seed-blob.js`

### FAQ / Team Save button does nothing
**Cause:** A later placeholder `function addFaqItem()` / `addTeamMember()` overwrote the real editor.  
**Fix:** Delete duplicate stubs. Verify with DevTools → console that clicking Save does not only log “to be fully implemented”.

### Design System shows wrong colors/fonts
**Cause:** `loadDesignSystem` fell back to generic defaults because `siteConfig.designSystem` is empty.  
**Fix:** Put the real palette/fonts in `DASHBOARD_CONFIG.theme` / `designSystem` (copy from `globals.css`). Panel resolution order: `siteConfig.designSystem` → `siteConfig.theme` → `DASHBOARD_CONFIG`.

### Unsaved Changes modal every visit
**Cause:** Drafts written without dirty tracking and never cleared.  
**Fix:** Section 5 rules (dirty flag, clear on save, clear on Discard, compare before prompt).

### Dashboard save fails with 401
**Cause:** Session cookie missing/expired, or origin check failed.  
**Fix:** Log in again; ensure `NEXTAUTH_URL` matches the production domain.

### “Blob already exists”
**Fix:** `allowOverwrite: true` on `put()` (already in `blob-storage.ts`).

---

## 15. Content audit — remaining gaps

Layout / colors / fonts stay locked (correct).

**Fixed in v2.3–2.4:** menu labels · business hours show/hide · WhatsApp · Page Content **Save button** · inner page hero banners · gallery **folder rename** · contact form **email delivery** · SEO titles from content · videos (editor + homepage section).

Still optional / low priority:

| # | Gap | Notes |
|---|-----|-------|
| 1 | “Call Now” button label | Optional `navigation.callToAction` |
| 2 | Logo image in Header | `logoUrl` in config unused; Header is text-only |
| 3 | Home section order | Layout-adjacent; product decision |
| 4 | Blog public pages | Dashboard has Blog tools; no `/blog` routes — hide Blog nav or build routes |
| 5 | Custom additional sections | `AdditionalSections` has no dashboard UI (About page only) |

---

## 16. Gallery display (all gallery templates)

### `siteConfig.gallerySettings` schema

```json
{
  "gallerySettings": {
    "homeMode": "pictures",
    "homeFilter": "All",
    "homePictureLimit": 8,
    "homeFolderLimit": 6,
    "folderOrder": ["Portfolio", "Cakes"]
  }
}
```

| Field | Values | Meaning |
|-------|--------|---------|
| `homeMode` | `"pictures"` \| `"folders"` | Home shows photo tiles **or** folder tiles |
| `homeFilter` | `"All"` \| folder name | Default category on home |
| `homePictureLimit` | number ≥ 1 | Max images on home in pictures mode |
| `homeFolderLimit` | number ≥ 1 | Max folders on home in folders mode |
| `folderOrder` | string[] | Display order of folders (also stored as `imageMap.categoryOrder`) |

### Behaviour every gallery template must implement

1. **Home (`mode="home"` or equivalent)**
   - `pictures`: show up to `homePictureLimit` images (filtered by `homeFilter`).
   - `folders`: show up to `homeFolderLimit` folder tiles; click a folder to open its images (with Back).
   - If more items exist than the limit → **“View full Gallery”** button → gallery page with everything.
2. **Full page (`mode="full"` / portfolio)**
   - All images, category filter tabs, lightbox.
3. **Centring**
   - A single image or single folder must be **centred** on the page (not left-aligned).
4. **Folder order**
   - Follow `folderOrder` / `imageMap.categoryOrder`.
   - Rename keeps the **same position** and all photos.
   - Dashboard ↑ / ↓ buttons reorder.
5. **Rename**
   - Re-keys the category; no delete/recreate.

### Dashboard UI (Gallery section)

- **Homepage Gallery Display** card: mode, default filter, picture limit, folder limit → Save Display Settings.
- Folder cards: **↑ ↓ Rename Delete**.
- Limits show/hide based on mode.

### Builder requirement

Apply this to **all gallery templates** (masonry, grid, folders, lightbox variants). If a template uses its own component, port the same schema + UX; do not leave a template without homeMode/limits/order.

---

## 17. Dashboard feature flags (hide what the site does not use)

`public/dashboard/assets/config.js`:

```javascript
features: {
  hero: true,
  gallery: true,
  services: true,
  pricing: false,    // hide Pricing in dashboard if the template has no pricing page
  testimonials: true,
  about: true,
  blog: false,       // hide Blog if there is no /blog route
  team: false,       // hide Team if the template has no team block
  faq: true,
  videos: true,
  seo: true,
  settings: true,
}
```

**Rule:** The dashboard must **not** show editors for sections the public website does not render.  
`setupAdaptiveNavigation()` hides the sidebar item when `features.<section> === false`, or when content is empty (gallery/services/testimonials/blog/team).

**Builder:** set `features` per template to match the components that template actually mounts.

---

## 18. Business hours layout (Contact block)

- **Not** a separate homepage section.
- Inside **Get In Touch**:
  - `showBusinessHours === true` and hours exist → **form left, hours card right** (`lg:grid-cols-2`).
  - Toggle off or no hours → form only, **centred** (`max-w-2xl mx-auto`).
- Implement inside the Contact component (or equivalent per template). Do not leave a standalone hours section.

Toggle in Settings: **“Show business hours next to the contact form”**.

---

## 19. Page Content panel (must stay clear)

**Banner** = image + headline at the top of an inner page (`pageHeroes`).  
**Section heading** = title of a content block (`pageContent`).

Cards (one per page):

| Card | Fields |
|------|--------|
| Homepage headings | Gallery heading/sub, Testimonials heading/sub, FAQ heading/sub |
| Services page | Banner headline / sub / image + Services list heading / description + CTA title / text |
| Gallery page | Banner + gallery page heading / description |
| About page | Banner headline / sub / image |
| Contact page | Banner + contact form heading / description |
| Videos | URLs one per line |

**Never** label two different fields the same way. Always distinguish Banner vs list/section.  
Save button top **and** bottom + toast on success.

---

## 20. Toggle switch CSS (Settings)

Broken when `.editor-field input` styles the hidden checkbox.

**Required CSS:**
- `.editor-field input:not([type="checkbox"])` for text inputs only
- `.toggle-label` is `display:flex`, `position:relative`, gap, min-height 44px
- Checkbox is visually hidden (`opacity:0`, 1px) and `pointer-events:none`
- `.toggle-switch` is 46×26 with a sliding knob; checked → success colour

Never stack the switch on top of the label text.

---

## 21. No native browser dialogs

The dashboard must **never** call `alert()`, `confirm()`, or `prompt()`.

| Use instead | Purpose |
|-------------|---------|
| `showConfirm(msg, title)` | Delete / reset confirmations |
| `showAlert(msg, title)` | Errors / validation |
| `showPrompt(msg, title, default, label)` | Rename folder / text input |
| `showToast(msg, type)` | Success / failure feedback |

Rename folder must use **showPrompt** (modal with text field), not `window.prompt`.

---

## 22. Gallery centring

Home gallery (folders **and** pictures) must **always** centre tiles:

```css
/* flex + wrap + centre — works for 1, 2, 3, 4+ items */
display: flex;
flex-wrap: wrap;
justify-content: center;
```

- Folder tiles: fixed width ~240px, `flex-none`
- Picture tiles: responsive width (`50%` / `33%` / `25%`) with `max-width: 220px`, `flex-none`
- Do **not** use left-aligned `grid-cols-N` alone for the home preview

Apply in **every gallery template**.

---

## 23. Homepage Gallery Display card (UI)

- Lives at the **bottom** of the Gallery section (after folder list)
- Uses `.gallery-display-card` + `.gallery-display-grid` (responsive auto-fit columns)
- Styled `select` elements (custom chevron, min-height 42px)
- Primary Save button

Business hours rows: bordered cards, bold day name, min-height inputs, “Closed” checkbox on the right.

---

## 24. THE WINNING FORMULA — golden dashboard + site reference

**This Mamma Mia site is the reference implementation.** When the website builder generates **any** new site, the dashboard and site behaviour must match this site exactly. Only content, colours, fonts, and `config.js` / `features` differ per client.

### What “exactly the same” means

| Area | Golden behaviour (copy from this site) |
|------|----------------------------------------|
| **Login / logout** | CSRF signout, session verify, “Incorrect username or password”, no refresh-to-escape |
| **Unsaved drafts** | Dirty flag; modal only when real edits; Discard clears |
| **Blob sync** | `/api/site-data` `force-dynamic` + `no-store`; `cacheControlMaxAge: 60` |
| **Menu labels** | Settings → Menu Labels → Header + Footer |
| **Business hours** | Toggle + hours list; **inside Contact** (form left / hours right; form centres when off) |
| **WhatsApp** | Toggle + number + greeting from `siteConfig.whatsapp` |
| **Page Content** | Save buttons; Banner vs section labels; page heroes; videos |
| **Gallery** | Rename (modal), ↑↓ order, home mode (pictures/folders), limits, default filter, View full Gallery, **centred tiles** |
| **Gallery tile size** | Folders ~**340px** wide, pictures ~**300px** max, flex centre |
| **Section spacing** | `.section-padding` = **3.25 / 4.25 / 5.25 rem** (mobile / md / lg) — not the old 4/6/8 |
| **Heading gap** | Section header margin **mb-12** (not mb-16) |
| **Toggles** | `.toggle-label` + `.toggle-switch`; never inherit text-input styles |
| **Modals** | `showConfirm` / `showAlert` / `showPrompt` / `showToast` only — **zero** `alert`/`confirm`/`prompt` |
| **Feature flags** | `DASHBOARD_CONFIG.features` hides Team/Blog/Pricing/etc. when unused |
| **Contact email** | `/api/contact` → Resend → dashboard Contact Form Recipient |
| **Design System** | Shows real palette/fonts from `globals.css` via `config.js` theme |
| **Security** | No creds in `config.js`, no debug env routes, CSRF + rate limit |

### Builder checklist before shipping a new site

1. Copy **current** `public/dashboard/**`, `lib/**`, `app/api/**`, shared components from this repo (or the template bundle) — do not rebuild from scratch.
2. Set `config.js`: business identity + `theme` + `designSystem` + `features` for that template.
3. Set env: `DASHBOARD_USERNAME`, password hash Base64, `NEXTAUTH_*`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`.
4. Seed Blob (`node scripts/seed-blob.js`).
5. Run the section 10 checklist on **desktop + mobile**.
6. Bump dashboard `?v=` cache version.

### Design tokens (spacing — apply to every template)

```css
.section-padding {
  padding-top: 3.25rem;
  padding-bottom: 3.25rem;
}
@media (min-width: 768px) {
  .section-padding { padding-top: 4.25rem; padding-bottom: 4.25rem; }
}
@media (min-width: 1024px) {
  .section-padding { padding-top: 5.25rem; padding-bottom: 5.25rem; }
}
```

If a template has its own section wrapper, match these paddings. Do **not** leave 8rem desktop section padding — it reads as too much empty space.

### Gallery tile sizes (every gallery template)

- Folder tile: `w-[min(100%,340px)]`, aspect ~4/3, `flex-none`, parent `flex flex-wrap justify-center gap-5`
- Picture tile: max width **~300px**, square-ish, parent `flex flex-wrap justify-center gap-4`
- Always centre; never left-align small counts

---

**END OF DOCUMENTATION**
