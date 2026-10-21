const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITE = ROOT + '/Websites/missions_ablaze';
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return '<<missing>>'; } };

console.log('=== D. Rate limiting on public endpoints ===');
for (const f of ['app/api/contact/route.ts', 'app/api/upload/route.ts', 'app/api/site-data/route.ts', 'lib/auth.ts', 'lib/rate-limiter.ts']) {
  const s = read(SITE + '/' + f);
  const uses = /loginRateLimiter|RateLimiter|rate.?limit/i.test(s);
  console.log('  ' + f.padEnd(34) + (uses ? 'rate-limit present' : '*** NO RATE LIMIT ***'));
}

console.log('\n=== E. Auth hardening ===');
const auth = read(SITE + '/lib/auth.ts');
console.log('  bcrypt compare used       : ' + /bcrypt\.compare/.test(auth));
console.log('  plaintext password in env : ' + /DASHBOARD_PASSWORD(?!_HASH)/.test(auth.replace(/DASHBOARD_PASSWORD_HASH/g, '')));
console.log('  session strategy          : ' + (auth.match(/strategy:\s*'(\w+)'/) || [])[1]);
console.log('  session maxAge            : ' + (auth.match(/maxAge:\s*(\d+)/) || [])[1]);
console.log('  rate limiter in authorize : ' + /loginRateLimiter/.test(auth));

console.log('\n=== F. Cookie / session flags ===');
for (const f of ['app/api/auth/[...nextauth]/route.ts', 'lib/auth.ts', 'lib/dashboard-middleware.ts']) {
  const s = read(SITE + '/' + f);
  const flags = [];
  ['httpOnly', 'secure', 'sameSite', 'secure:'].forEach(k => { if (s.includes(k)) flags.push(k); });
  console.log('  ' + f.padEnd(44) + (flags.length ? flags.join(', ') : 'no explicit cookie flags'));
}

console.log('\n=== G. dashboard innerHTML — is every write escaped? ===');
const app = read(SITE + '/public/dashboard/assets/app.js');
// find innerHTML = ... assignments and check whether escapeHtml appears in that expression
const re = /\.innerHTML\s*=\s*([^;]{0,400})/g;
let m, total = 0, escaped = 0, suspicious = [];
while ((m = re.exec(app)) !== null) {
  total++;
  const expr = m[1];
  const usesEsc = /escapeHtml|escapeAttr/.test(expr);
  const usesTemplate = /`/.test(expr);
  // raw interpolation of a variable without escapeHtml is the risk
  const rawVar = /\$\{(?!escapeHtml)[a-zA-Z_][\w.]*\}/.test(expr);
  if (usesEsc) escaped++;
  if (rawVar && !usesEsc) {
    const line = app.slice(0, m.index).split('\n').length;
    suspicious.push(line);
  }
}
console.log('  total innerHTML assignments : ' + total);
console.log('  using escapeHtml in expr    : ' + escaped);
console.log('  with raw ${var} and no esc  : ' + suspicious.length);
if (suspicious.length) console.log('     at lines: ' + suspicious.slice(0, 25).join(', '));

console.log('\n=== H. does site-config leak anything non-public? ===');
const cfgPath = SITE + '/public/site-config.json';
if (fs.existsSync(cfgPath)) {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const find = (o, pred, path = '') => {
    const hits = [];
    if (!o || typeof o !== 'object') return hits;
    for (const [k, v] of Object.entries(o)) {
      const p = path ? path + '.' + k : k;
      if (pred(k, v)) hits.push(p + ' = ' + (typeof v === 'string' ? v.slice(0, 60) : JSON.stringify(v).slice(0, 60)));
      if (v && typeof v === 'object') hits.push(...find(v, pred, p));
    }
    return hits;
  };
  const emailKeys = find(cfg, (k, v) => /email|to$/i.test(k) && typeof v === 'string' && v.includes('@'));
  const geoKeys = find(cfg, (k, v) => /lat|lng|longitude|latitude/i.test(k));
  console.log('  email-ish fields in public config:');
  emailKeys.forEach(e => console.log('    ' + e));
  console.log('  geo fields in public config:');
  geoKeys.forEach(e => console.log('    ' + e));
} else {
  console.log('  (public/site-config.json not present locally)');
}

console.log('\n=== I. save-config — what can be written? ===');
const sc = read(SITE + '/app/api/save-config/route.ts');
console.log('  guarded        : ' + /protectRoute/.test(sc));
console.log('  body keys allowed: ' + (sc.match(/body\.(\w+)/g) || [...new Set(sc.match(/body\.(\w+)/g) || [])].join(', ')));
console.log('  filename fixed : ' + /site-config\.json|image-map\.json|seo\.json/.test(sc));
console.log('  arbitrary path : ' + /body\.filename|body\.path|body\.name/.test(sc));

console.log('\n=== J. error disclosure ===');
for (const f of ['app/api/site-data/route.ts', 'app/api/contact/route.ts', 'app/api/upload/route.ts', 'app/api/leads/route.ts']) {
  const s = read(SITE + '/' + f);
  const discloses = /String\(error\)|error\.message|err\.message/.test(s) && /NextResponse\.json\(/.test(s);
  const returnsErr = /error:\s*String\(error\)|error: error\.message|message: error\.message/.test(s);
  console.log('  ' + f.padEnd(38) + (returnsErr ? '*** returns raw error to client ***' : discloses ? 'logs but check response body' : 'clean'));
}
