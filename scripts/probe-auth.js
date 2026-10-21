const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITE = ROOT + '/Websites/mamma_mia_cakes_and_catering';
const WB = ROOT + '/Website Builder';

function tryRead(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; }
}

console.log('=== auth-related files in mamma_mia ===');
for (const rel of [
  'lib/auth.ts', 'lib/dashboard-middleware.ts', 'middleware.ts',
  '.dashboard-credentials.txt', '.env.local', '.env.local.example', '.env.production',
  'app/api/auth/[...nextauth]/route.ts',
]) {
  const p = SITE + '/' + rel;
  const s = tryRead(p);
  console.log('  ' + rel.padEnd(44) + (s == null ? 'MISSING' : s.length + ' bytes'));
}

console.log('\n=== lib/auth.ts ===');
console.log(tryRead(SITE + '/lib/auth.ts') || '(missing)');

console.log('\n=== lib/dashboard-middleware.ts ===');
console.log(tryRead(SITE + '/lib/dashboard-middleware.ts') || '(missing)');

console.log('\n=== middleware.ts ===');
console.log(tryRead(SITE + '/middleware.ts') || '(missing)');

console.log('\n=== .dashboard-credentials.txt ===');
console.log(tryRead(SITE + '/.dashboard-credentials.txt') || '(missing)');

console.log('\n=== .env.local (values redacted length only) ===');
const env = tryRead(SITE + '/.env.local');
if (env) {
  env.split('\n').forEach(l => {
    if (!l.trim() || l.trim().startsWith('#')) { console.log('  ' + l); return; }
    const i = l.indexOf('=');
    if (i < 0) { console.log('  ' + l); return; }
    const k = l.slice(0, i);
    const v = l.slice(i + 1);
    console.log('  ' + k + '=' + v + '   (len ' + v.length + ')');
  });
} else console.log('  (missing)');

console.log('\n=== generator auth template ===');
const bg = tryRead(WB + '/lib/boilerplate-generator.ts') || '';
const i = bg.indexOf('function generateAuthConfig');
console.log(bg.slice(i, i + 2200));
