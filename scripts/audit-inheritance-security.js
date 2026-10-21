const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } };

console.log('=== 1. Is next.config.js GENERATED or COPIED? ===');
const bg = read(WB + '/lib/boilerplate-generator.ts') || '';
const genIdx = bg.indexOf('function generateNextConfig');
console.log('  generateNextConfig exists in boilerplate-generator: ' + (genIdx > 0));
if (genIdx > 0) {
  const seg = bg.slice(genIdx, genIdx + 900);
  console.log('  emits headers(): ' + /headers\(\)/.test(seg));
  console.log('  emits CSP       : ' + /Content-Security-Policy/.test(seg));
  console.log('  emits X-Frame   : ' + /X-Frame-Options/.test(seg));
}
const tplNext = read(WB + '/templates/backend/next.config.js');
console.log('  templates/backend/next.config.js exists: ' + !!tplNext);
if (tplNext) {
  console.log('    has headers(): ' + /headers\(\)/.test(tplNext));
  console.log('    has CSP     : ' + /Content-Security-Policy/.test(tplNext));
}

// order of operations in build-website
const bw = read(WB + '/app/api/build-website/route.ts') || '';
const order = [];
[['generateNextConfig', bw.indexOf('generateNextConfig')],
 ['copyBackendDir', bw.indexOf('copyBackendDir')],
 ['copyControlSystemFolders / shipComponent', bw.indexOf('shipComponent')],
 ['files[\'next.config.js\']', bw.indexOf('next.config.js')]].forEach(([n, i]) => order.push({ n, i }));
order.filter(o => o.i >= 0).sort((a, b) => a.i - b.i).forEach(o => console.log('  order: ' + o.n + ' at ' + o.i));

console.log('\n=== 2. Does the build pipeline SET Vercel env vars? ===');
for (const f of ['app/api/build-website/route.ts', 'app/api/build-site/route.ts', 'scripts/go-live.ts']) {
  const s = read(WB + '/' + f) || '';
  console.log('  ' + f.padEnd(38) + 'mentions env add: ' + /env\s+add|vercel env|TENANT_ID/.test(s));
}

console.log('\n=== 3. SHIP LIST: which security-critical files land in a new build? ===');
const backendFiles = [];
function walk(d, p = '') {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const rel = p ? p + '/' + e.name : e.name;
    if (e.isDirectory()) walk(d + '/' + e.name, rel);
    else backendFiles.push(rel);
  }
}
walk(WB + '/templates/backend');
const CRITICAL = [
  'middleware.ts',
  'lib/view-tracker.ts',
  'lib/rate-limiter.ts',
  'lib/supabase-server.ts',
  'lib/leads.ts',
  'lib/dashboard-middleware.ts',
  'app/api/contact/route.ts',
  'app/api/upload/route.ts',
  'app/api/leads/route.ts',
  'app/api/stats/route.ts',
  'app/api/save-config/route.ts',
  'app/api/site-data/route.ts',
  'next.config.js',
];
for (const f of CRITICAL) {
  const inBackend = backendFiles.includes(f);
  const content = inBackend ? read(WB + '/templates/backend/' + f) : null;
  const marks = [];
  if (content) {
    if (/MAX_UPLOAD_BYTES|sniffImageType/.test(content)) marks.push('upload-hardened');
    if (/contactRateLimiter|uploadRateLimiter/.test(content)) marks.push('rate-limit');
    if (/getAdminClient/.test(content)) marks.push('admin-client');
    if (/X-Frame-Options|Content-Security-Policy/.test(content)) marks.push('headers');
    if (/protectRoute/.test(content)) marks.push('auth-guard');
    if (/String\(error\)/.test(content)) marks.push('*** LEAKS ERRORS ***');
  }
  console.log('  ' + f.padEnd(38) + (inBackend ? 'ships' : '*** NOT SHIPPED ***') + (marks.length ? '  [' + marks.join(', ') + ']' : ''));
}

console.log('\n=== 4. Dashboard ships? ===');
for (const f of ['templates/dashboard/index.html', 'templates/dashboard/assets/app.js', 'templates/dashboard/assets/styles.css']) {
  const s = read(WB + '/' + f);
  console.log('  ' + f.replace('templates/dashboard/', '').padEnd(26) + (s ? s.length + 'b' : 'MISSING'));
}
const dashApp = read(WB + '/templates/dashboard/assets/app.js') || '';
console.log('  app.js has escapeJs        : ' + /function escapeJs/.test(dashApp));
console.log('  app.js has exportLeadsCsv  : ' + /function exportLeadsCsv/.test(dashApp));
console.log('  app.js has SECTION_FIELDS  : ' + /const SECTION_FIELDS/.test(dashApp));
console.log('  app.js has consent         : ' + /marketingConsent/.test(dashApp));

console.log('\n=== 5. Component ship list (control system) ===');
const cm = (bw.match(/controlSystemFolders\s*=\s*\[([\s\S]*?)\]/) || [])[1];
console.log('  ' + (cm ? cm.replace(/\s+/g, ' ').trim() : 'NOT FOUND'));
const cf = (bw.match(/controlSystemFiles[\s\S]{0,200}/) || [])[0];
console.log('  ' + (cf || '').replace(/\s+/g, ' ').slice(0, 160));

console.log('\n=== 6. Migration state ===');
for (const n of ['016_form_submissions', '017_email_open_tracking', '018_page_views', '019_marketing_consent', '020_lock_leads_reads']) {
  const p = ROOT + '/GeistCRM/database/migrations/' + n + '.sql';
  console.log('  ' + n.padEnd(30) + (fs.existsSync(p) ? 'written' : 'MISSING'));
}
