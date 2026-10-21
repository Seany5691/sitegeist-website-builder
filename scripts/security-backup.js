/**
 * SECURITY RESTORE POINT — taken before the 6 security hardening fixes.
 *
 * Covers: Website Builder source tree, the 3 target sites (source + dashboard +
 * config + env), and GeistCRM's database migrations (so migration state is
 * recoverable). Excludes node_modules / .next / .vercel / temp.
 */
const fs = require('fs');
const path = require('path');

const ECOSYSTEM = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const BACKUPS = path.join(ECOSYSTEM, 'GeistBackups');
const BUILDER = path.join(ECOSYSTEM, 'Website Builder');
const WEBSITES = path.join(ECOSYSTEM, 'Websites');
const CRM = path.join(ECOSYSTEM, 'GeistCRM');
const TARGET_SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.vercel', 'temp', '.git', '.mimocode', '.vercel']);
const EXCLUDE_EXT = new Set(['.tsbuildinfo']);

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}${p(d.getMinutes())}`;
}

function walk(src, dst, stats) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(path.join(src, entry.name), path.join(dst, entry.name), stats);
    } else {
      if (EXCLUDE_EXT.has(path.extname(entry.name))) continue;
      const s = path.join(src, entry.name);
      const d = path.join(dst, entry.name);
      fs.copyFileSync(s, d);
      stats.files++;
      stats.bytes += fs.statSync(s).size;
    }
  }
}

function countTree(dir, stats) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      countTree(path.join(dir, entry.name), stats);
    } else {
      if (EXCLUDE_EXT.has(path.extname(entry.name))) continue;
      stats.files++;
      stats.bytes += fs.statSync(path.join(dir, entry.name)).size;
    }
  }
}

function mb(n) { return (n / 1024 / 1024).toFixed(2) + ' MB'; }

const stamp = timestamp();
const wbBackup = path.join(BACKUPS, `Website Builder - backup ${stamp}`);
const sitesBackup = path.join(BACKUPS, `Websites-3sites - backup ${stamp}`);
const crmBackup = path.join(BACKUPS, `GeistCRM-migrations - backup ${stamp}`);
fs.mkdirSync(BACKUPS, { recursive: true });

console.log('=== SECURITY BACKUP — restore point before the 6 hardening fixes ===');
console.log('destination:', BACKUPS);
console.log('');

// --- 1. Website Builder ---
console.log('[1/4] Copying Website Builder source tree...');
const wbSrc = { files: 0, bytes: 0 };
countTree(BUILDER, wbSrc);
const wbDst = { files: 0, bytes: 0 };
walk(BUILDER, wbBackup, wbDst);
console.log(`      source: ${wbSrc.files} files, ${mb(wbSrc.bytes)}`);
console.log(`      backup: ${wbDst.files} files, ${mb(wbDst.bytes)}`);
const wbMatch = wbSrc.files === wbDst.files && wbSrc.bytes === wbDst.bytes;
console.log(`      match:  ${wbMatch ? 'YES' : 'CHECK MANUALLY'}`);

// --- 2. Three sites ---
console.log('[2/4] Copying 3 site source/config/dashboard/env trees...');
const siteReport = [];
for (const s of TARGET_SITES) {
  const siteSrc = path.join(WEBSITES, s);
  const siteDst = path.join(sitesBackup, s);
  // include middleware + next.config since security headers land there
  const parts = [
    'app', 'components', 'lib', 'public/dashboard',
    'public/site-config.json', 'public/image-map.json', 'public/seo.json',
    'package.json', 'next.config.js', 'middleware.ts', 'tsconfig.json',
    'site-config.json', '.env.production', '.env.local', '.build-instructions',
  ];
  const st = { files: 0, bytes: 0 };
  for (const part of parts) {
    const s2 = path.join(siteSrc, part);
    if (!fs.existsSync(s2)) continue;
    const d2 = path.join(siteDst, part);
    const stat = fs.statSync(s2);
    if (stat.isDirectory()) walk(s2, d2, st);
    else {
      fs.mkdirSync(path.dirname(d2), { recursive: true });
      fs.copyFileSync(s2, d2);
      st.files++;
      st.bytes += stat.size;
    }
  }
  siteReport.push({ site: s, files: st.files, bytes: st.bytes });
  console.log(`      ${s}: ${st.files} files, ${mb(st.bytes)}`);
}

// --- 3. GeistCRM migrations ---
console.log('[3/4] Copying GeistCRM database migrations...');
const crmDst = { files: 0, bytes: 0 };
const migSrc = path.join(CRM, 'database', 'migrations');
if (fs.existsSync(migSrc)) {
  walk(migSrc, path.join(crmBackup, 'database', 'migrations'), crmDst);
}
console.log(`      ${crmDst.files} migration files, ${mb(crmDst.bytes)}`);

// --- 4. Manifest ---
console.log('[4/4] Writing MANIFEST...');
const checks = [
  'lib/boilerplate-generator.ts',
  'templates/dashboard/index.html',
  'templates/dashboard/assets/app.js',
  'templates/backend/lib/leads.ts',
  'templates/backend/app/api/upload/route.ts',
  'templates/backend/app/api/contact/route.ts',
  'templates/backend/app/api/leads/route.ts',
  'templates/backend/lib/dashboard-middleware.ts',
  'templates/backend/lib/supabase-server.ts',
  'lib/prompt-builder.ts',
  'app/api/build-website/route.ts',
];
const checkResults = checks.map((c) => ({ file: c, exists: fs.existsSync(path.join(wbBackup, c)) }));

const manifest = [
  `MANIFEST — SECURITY restore point`,
  `=================================`,
  ``,
  `Created       : ${new Date().toISOString()}`,
  `Local time    : ${stamp}`,
  `Purpose       : Restore point BEFORE the 6 security hardening fixes`,
  `                1. /api/upload file-type + size allowlist`,
  `                2. Security headers (CSP/HSTS/X-Frame-Options/...)`,
  `                3. Rate limiting on public endpoints`,
  `                4. Dashboard innerHTML XSS escaping`,
  `                5. JWT-based tenant isolation (RLS)`,
  `                6. Stop returning raw error strings to clients`,
  ``,
  `BACKUP 1 — Website Builder`,
  `  Path        : ${wbBackup}`,
  `  Files       : ${wbDst.files}`,
  `  Size        : ${mb(wbDst.bytes)}`,
  `  Excluded    : node_modules, .next, .vercel, temp, .git, *.tsbuildinfo`,
  ``,
  `BACKUP 2 — 3 target sites (source + dashboard + config + env)`,
  `  Path        : ${sitesBackup}`,
  ...siteReport.map((r) => `  ${r.site.padEnd(32)} ${String(r.files).padStart(6)} files  ${mb(r.bytes)}`),
  ``,
  `BACKUP 3 — GeistCRM database migrations`,
  `  Path        : ${crmBackup}`,
  `  Files       : ${crmDst.files}`,
  `  Size        : ${mb(crmDst.bytes)}`,
  ``,
  `VERIFICATION`,
  ...checkResults.map((c) => `  ${c.exists ? 'OK  ' : 'MISS'} ${c.file}`),
  ``,
  `RESTORE INSTRUCTIONS`,
  `  1. Stop any running dev server.`,
  `  2. Copy the contents of "Website Builder - backup ${stamp}" over`,
  `     "Website Builder/" (replace all).`,
  `  3. Copy each site folder under "Websites-3sites - backup ${stamp}"`,
  `     back into "Websites/<site>/" for the paths listed above.`,
  `  4. Copy "GeistCRM-migrations - backup ${stamp}/database/migrations" over`,
  `     "GeistCRM/database/migrations" if migration state must be rolled back.`,
  `  5. npm install in each project if needed.`,
  `  6. Redeploy the 3 sites + GeistCRM.`,
  `  7. If Supabase migration 019 was applied and must be rolled back, run:`,
  `       alter table public.form_submissions drop column if exists marketing_consent;`,
  `       alter table public.form_submissions drop column if exists marketing_consent_at;`,
  `       alter table public.form_submissions drop column if exists marketing_consent_text;`,
  `       drop index if exists form_submissions_tenant_consent_idx;`,
  ``,
  `This folder is a full restore point. Keep it.`,
].join('\n');

const manifestPath = path.join(BACKUPS, `MANIFEST-SECURITY ${stamp}.txt`);
fs.writeFileSync(manifestPath, manifest, 'utf8');
fs.writeFileSync(path.join(wbBackup, 'MANIFEST.txt'), manifest, 'utf8');
fs.writeFileSync(path.join(sitesBackup, 'MANIFEST.txt'), manifest, 'utf8');

console.log('');
console.log('=== BACKUP COMPLETE ===');
console.log('  ', wbBackup);
console.log('  ', sitesBackup);
console.log('  ', crmBackup);
console.log('  ', manifestPath);
console.log('');
const allOk = checkResults.every((c) => c.exists) && wbMatch;
console.log('Verification:', allOk ? 'ALL KEY FILES PRESENT + COUNTS MATCH' : '*** PROBLEM — DO NOT PROCEED ***');
process.exit(allOk ? 0 : 1);
