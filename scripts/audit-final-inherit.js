const fs = require('fs');
const W = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';

const g = fs.readFileSync(W + '/lib/boilerplate-generator.ts', 'utf8');
const fn = g.slice(g.indexOf('function generateNextConfig'), g.indexOf('\nfunction generateTsConfig'));
console.log('=== generateNextConfig (' + fn.length + ' chars) ===');
for (const k of ['headers()', 'Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security',
  'Permissions-Policy', 'frame-ancestors', 'fonts.googleapis.com', 'cdnjs.cloudflare.com',
  'unoptimized: true', 'optimizeFonts: false']) {
  console.log('  ' + k.padEnd(30) + (fn.includes(k) ? 'ok' : '*** MISSING ***'));
}

const app = fs.readFileSync(W + '/templates/dashboard/assets/app.js', 'utf8');
console.log('\n=== dashboard template (ships to every build) ===');
for (const k of ['consentLabel', 'Not recorded', 'Is Test', 'function escapeJs', 'function escapeHtml',
  'function exportLeadsCsv', 'const SECTION_FIELDS', 'function saveHoursTab', 'function saveSectionData',
  'function uploadImageToField', 'nav-group']) {
  console.log('  ' + k.padEnd(26) + (app.includes(k) ? 'present' : '*** MISSING ***'));
}

console.log('\n=== consent checkbox lives on the SITE components ===');
for (const f of ['templates/components/newsletter/NewsletterBlock.tsx', 'templates/components/features/NewsletterPopup.tsx']) {
  const s = fs.readFileSync(W + '/' + f, 'utf8');
  console.log('  ' + f.split('/').pop().padEnd(24) + 'checkbox=' + s.includes('type="checkbox"') + '  marketingConsent=' + s.includes('marketingConsent') + '  posts=' + s.includes("fetch('/api/contact'"));
}

console.log('\n=== security hardening in the templates that ship ===');
for (const [f, marks] of [
  ['templates/backend/app/api/upload/route.ts', ['MAX_UPLOAD_BYTES', 'sniffImageType', 'protectRoute']],
  ['templates/backend/app/api/contact/route.ts', ['contactRateLimiter', 'clientIpFrom']],
  ['templates/backend/lib/rate-limiter.ts', ['contactRateLimiter', 'uploadRateLimiter', 'clientIpFrom']],
  ['templates/backend/lib/supabase-server.ts', ['getAdminClient', 'SUPABASE_SERVICE_ROLE_KEY', 'getSupabase']],
  ['templates/backend/middleware.ts', ['recordView', 'TENANT_ID']],
  ['templates/backend/lib/view-tracker.ts', ['hashVisitor', 'classifyUserAgent']],
]) {
  const s = fs.readFileSync(W + '/' + f, 'utf8');
  const ok = marks.every((m) => s.includes(m));
  console.log('  ' + f.replace('templates/backend/', '').padEnd(30) + (ok ? marks.join(' + ') : '*** MISSING ' + marks.filter((m) => !s.includes(m)).join(',') + ' ***'));
}

console.log('\n=== new-build tooling ===');
console.log('  scripts/new-site-env.js      : ' + fs.existsSync(W + '/scripts/new-site-env.js'));
const nc = fs.readFileSync(W + '/templates/backend/next.config.js', 'utf8');
const gn = fn;
console.log('  template === generator output : ' + (nc.trim().length > 100 && gn.includes('X-Frame-Options')));
