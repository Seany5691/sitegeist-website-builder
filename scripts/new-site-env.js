#!/usr/bin/env node
/**
 * new-site-env.js — wire a freshly built site to the shared platform.
 *
 * Everything except four per-site values is identical across the whole
 * ecosystem (one Supabase project, one Resend key). This sets all of it in
 * Vercel in one go so a new trial site is never missing TENANT_ID / Supabase /
 * Resend — the exact gap that silently zeroed two sites' analytics.
 *
 * USAGE
 *   node scripts/new-site-env.js <siteFolder> <canonicalUrl> <tenantId> \
 *        [--from <existingSiteFolder>] [--password <dashboardPassword>]
 *
 * EXAMPLE
 *   node scripts/new-site-env.js acme_plumbing https://acme.sitespire.co.za \
 *        11111111-2222-3333-4444-555555555555 --from missions_ablaze \
 *        --password 'Acme2026!'
 *
 * --from   copies the shared platform values (Supabase, Resend) from a site
 *          that is already configured. Defaults to missions_ablaze.
 * --password  the client's dashboard password. A bcrypt hash is generated and
 *          stored as DASHBOARD_PASSWORD_HASH_BASE64 (Base64 because Vercel
 *          strips `$` from env values). Omit to leave the password unset.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const VERCEL_JS = 'C:/Users/seany/AppData/Roaming/npm/node_modules/vercel/dist/vc.js';
const runVercel = (cwd, args) =>
  execFileSync(process.execPath, [VERCEL_JS, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });

function arg(name, short) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const siteFolder = process.argv[2];
const canonicalUrl = process.argv[3];
const tenantId = process.argv[4];
const sourceSite = arg('--from') || 'missions_ablaze';
const password = arg('--password');

if (!siteFolder || !canonicalUrl || !tenantId) {
  console.log('usage: node scripts/new-site-env.js <siteFolder> <canonicalUrl> <tenantId> [--from <site>] [--password <pw>]');
  process.exit(1);
}

const SITE_DIR = path.join(ROOT, 'Websites', siteFolder);
if (!fs.existsSync(SITE_DIR)) {
  console.log('*** no such site folder: ' + SITE_DIR + ' ***');
  process.exit(1);
}

function readEnv(dir) {
  const p = path.join(dir, '.env.local');
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^"([\s\S]*)"$/, '$1');
  }
  return out;
}

const shared = readEnv(path.join(ROOT, 'Websites', sourceSite));
const local = readEnv(SITE_DIR);

// ── shared: identical for every site in the ecosystem ───────────────────────
const ADDITIONS = {
  SUPABASE_URL: shared.SUPABASE_URL || local.SUPABASE_URL,
  SUPABASE_ANON_KEY: shared.SUPABASE_ANON_KEY || local.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: shared.SUPABASE_SERVICE_ROLE_KEY || local.SUPABASE_SERVICE_ROLE_KEY || arg('--service-key'),
  RESEND_API_KEY: shared.RESEND_API_KEY || local.RESEND_API_KEY,
};

// ── per-site ───────────────────────────────────────────────────────────────
const businessName = local.BUSINESS_NAME || path.basename(siteFolder).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const domain = canonicalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
ADDITIONS.TENANT_ID = tenantId;
ADDITIONS.NEXT_PUBLIC_SITE_URL = canonicalUrl;
ADDITIONS.EMAIL_FROM = local.EMAIL_FROM || `New Lead - ${businessName} <leads@mail.sitespire.co.za>`;
ADDITIONS.CONTACT_FORM_FALLBACK_TO = local.CONTACT_FORM_FALLBACK_TO || local.CONTACT_EMAIL || `info@${domain}`;

// dashboard login
ADDITIONS.DASHBOARD_USERNAME = local.DASHBOARD_USERNAME || 'admin';
if (password) {
  const bcrypt = require(path.join(ROOT, 'Websites', sourceSite, 'node_modules', 'bcryptjs'));
  // Base64 because Vercel strips `$` from env values.
  ADDITIONS.DASHBOARD_PASSWORD_HASH_BASE64 = Buffer.from(bcrypt.hashSync(password, 10), 'utf-8').toString('base64');
} else if (local.DASHBOARD_PASSWORD_HASH_BASE64) {
  ADDITIONS.DASHBOARD_PASSWORD_HASH_BASE64 = local.DASHBOARD_PASSWORD_HASH_BASE64;
}
if (local.NEXTAUTH_SECRET) ADDITIONS.NEXTAUTH_SECRET = local.NEXTAUTH_SECRET;

console.log('=== ' + siteFolder + ' → ' + canonicalUrl + ' ===');
const missing = Object.entries(ADDITIONS).filter(([, v]) => !v);
if (missing.length) {
  console.log('*** cannot proceed — no value for: ' + missing.map((m) => m[0]).join(', ') + ' ***');
  console.log('    (SUPABASE_SERVICE_ROLE_KEY comes from --service-key or ' + sourceSite + '/.env.local)');
  process.exit(1);
}

for (const [k, v] of Object.entries(ADDITIONS)) {
  console.log('  ' + k.padEnd(32) + String(v).slice(0, 44) + (String(v).length > 44 ? '…' : ''));
}

console.log('\n=== writing to Vercel ===');
let fail = 0;
for (const [k, v] of Object.entries(ADDITIONS)) {
  for (const envName of ['production', 'preview']) {
    try {
      try { runVercel(SITE_DIR, ['env', 'rm', k, envName, '-y']); } catch (e) {}
      runVercel(SITE_DIR, ['env', 'add', k, '--value', String(v), envName]);
    } catch (e) {
      console.log('  ' + k.padEnd(32) + envName.padEnd(11) + '*** ' + String(e.stderr || e.message).slice(0, 120));
      fail++;
    }
  }
  console.log('  ' + k.padEnd(32) + 'set');
}

const out = runVercel(SITE_DIR, ['env', 'ls']);
const NEED = ['TENANT_ID', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'EMAIL_FROM', 'NEXT_PUBLIC_SITE_URL', 'DASHBOARD_USERNAME', 'DASHBOARD_PASSWORD_HASH_BASE64', 'NEXTAUTH_SECRET'];
const stillMissing = NEED.filter((k) => !out.includes(k));

console.log('\n' + (fail === 0 && stillMissing.length === 0
  ? 'SITE ENV COMPLETE — deploy with: vercel --prod --yes'
  : 'PROBLEM(S): ' + stillMissing.join(', ')));
process.exit(fail === 0 && stillMissing.length === 0 ? 0 : 1);
