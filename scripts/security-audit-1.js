const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITE = ROOT + '/Websites/missions_ablaze';
const WB = ROOT + '/Website Builder';

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const p = d + '/' + e.name;
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

console.log('=== 1. EVERY API ROUTE + does it check auth? ===');
const apiFiles = walk(SITE + '/app/api').filter(f => /\.(ts|tsx|js)$/.test(f));
for (const f of apiFiles.sort()) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = f.replace(SITE + '/', '');
  const exported = [...src.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)/g)].map(m => m[1]);
  const guards = [];
  if (/protectRoute\(/.test(src)) guards.push('protectRoute');
  if (/requireAuth\(/.test(src)) guards.push('requireAuth');
  if (/getServerSession|authOptions/.test(src)) guards.push('getServerSession');
  if (/validateOrigin\(/.test(src)) guards.push('validateOrigin');
  if (/authorization|bearer|api[_-]?key/i.test(src)) guards.push('key-check');
  const risky = [];
  if (/multipart|FormData|file\b/i.test(src) && /upload/i.test(rel)) risky.push('FILE-UPLOAD');
  if (/fs\.|writeFile|unlink|createWriteStream/.test(src)) risky.push('FS-WRITE');
  if (/BLOB_READ_WRITE_TOKEN/.test(src)) risky.push('BLOB-TOKEN');
  if (/RESEND_API_KEY/.test(src)) risky.push('RESEND-KEY');
  if (/SUPABASE_SERVICE|service_role/.test(src)) risky.push('SERVICE-ROLE');
  const noGuard = guards.length === 0;
  console.log('  ' + rel.padEnd(46) + exported.join(',').padEnd(22) + (noGuard ? '*** NO AUTH ***' : guards.join('+')) + (risky.length ? '   [' + risky.join(',') + ']' : ''));
}

console.log('\n=== 2. SECRETS: which are read where? ===');
const keyFiles = walk(SITE).filter(f => /\.(ts|tsx)$/.test(f) && !f.includes('node_modules'));
const envNames = ['RESEND_API_KEY', 'SUPABASE_SERVICE', 'service_role', 'BLOB_READ_WRITE_TOKEN', 'NEXTAUTH_SECRET', 'DASHBOARD_PASSWORD', 'RESEND_WEBHOOK_SECRET'];
for (const name of envNames) {
  const server = [], client = [];
  for (const f of keyFiles) {
    const src = fs.readFileSync(f, 'utf8');
    if (!src.includes(name)) continue;
    const rel = f.replace(SITE + '/', '');
    if (/NEXT_PUBLIC_/.test(name) || rel.includes('use-site-data') || /\.test\./.test(rel)) client.push(rel);
    else if (rel.startsWith('app/api/') || rel.startsWith('lib/') || rel === 'middleware.ts') server.push(rel);
    else client.push(rel + '?');
  }
  console.log('  ' + name.padEnd(26) + 'server:' + String(server.length).padStart(2) + '  client-adjacent:' + String(client.length).padStart(2) + (client.length ? '  ' + client.slice(0, 3).join(', ') : ''));
}

console.log('\n=== 3. Is any server secret referenced from a client component? ===');
const clientComps = walk(SITE + '/components').filter(f => /\.tsx$/.test(f))
  .concat(walk(SITE + '/app').filter(f => /\.tsx$/.test(f) && !f.includes('/api/')));
let leaks = 0;
for (const f of clientComps) {
  const src = fs.readFileSync(f, 'utf8');
  for (const name of envNames) {
    if (src.includes(name)) {
      console.log('  *** ' + f.replace(SITE + '/', '') + ' references ' + name + ' ***');
      leaks++;
    }
  }
}
console.log('  client-side secret references: ' + leaks);

console.log('\n=== 4. Security headers / middleware ===');
const mw = fs.readFileSync(SITE + '/middleware.ts', 'utf8');
console.log('  middleware.ts exports: ' + [...mw.matchAll(/export (async )?function (\w+)/g)].map(m => m[2]).join(', '));
for (const h of ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security', 'Permissions-Policy']) {
  const inMw = mw.includes(h);
  const nextCfg = fs.existsSync(SITE + '/next.config.js') ? fs.readFileSync(SITE + '/next.config.js', 'utf8') : '';
  const inCfg = nextCfg.includes(h);
  console.log('  ' + h.padEnd(28) + 'middleware=' + (inMw ? 'YES' : 'no ') + '  next.config=' + (inCfg ? 'YES' : 'no '));
}
const nc = fs.existsSync(SITE + '/next.config.js') ? fs.readFileSync(SITE + '/next.config.js', 'utf8') : '';
console.log('\n  next.config.js content:');
console.log(nc.split('\n').map(l => '    ' + l).join('\n'));

console.log('\n=== 5. Dashboard static files: publicly served? ===');
const pub = fs.existsSync(SITE + '/public/dashboard/index.html');
console.log('  public/dashboard/index.html exists: ' + pub);
console.log('  (public/ is served without auth by Next.js — the SHELL is public,');
console.log('   the DATA comes from /api/site-data which is guarded)');

console.log('\n=== 6. XSS: are user fields escaped on render? ===');
const esc = walk(SITE + '/components').filter(f => /\.tsx$/.test(f));
let dangerously = 0, escCount = 0;
for (const f of esc) {
  const src = fs.readFileSync(f, 'utf8');
  if (/dangerouslySetInnerHTML/.test(src)) { console.log('  *** dangerouslySetInnerHTML in ' + f.replace(SITE + '/', '') + ' ***'); dangerously++; }
  if (/escapeHtml|DOMPurify|sanitize/.test(src)) escCount++;
}
console.log('  components using dangerouslySetInnerHTML: ' + dangerously);
console.log('  components with a sanitizer: ' + escCount);
const dashApp = fs.readFileSync(SITE + '/public/dashboard/assets/app.js', 'utf8');
console.log('  dashboard escapeHtml defined: ' + /function escapeHtml/.test(dashApp));
console.log('  dashboard dangerouslySetInnerHTML uses: ' + (dashApp.match(/dangerouslySetInnerHTML|innerHTML\s*=/g) || []).length + ' innerHTML writes');
console.log('  dashboard innerHTML WITHOUT escapeHtml nearby: (manual check needed)');
