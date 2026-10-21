const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITE = ROOT + '/Websites/mamma_mia_cakes_and_catering';

const env = fs.readFileSync(SITE + '/.env.local', 'utf8');
function get(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
}

const user = get('DASHBOARD_USERNAME');
const b64 = get('DASHBOARD_PASSWORD_HASH_BASE64');
const raw = get('DASHBOARD_PASSWORD_HASH');

console.log('=== .env.local (mamma_mia) ===');
console.log('  DASHBOARD_USERNAME              =', JSON.stringify(user));
console.log('  DASHBOARD_PASSWORD_HASH_BASE64  =', b64 ? b64.slice(0, 40) + '…  (len ' + b64.length + ')' : '(null)');
console.log('  DASHBOARD_PASSWORD_HASH         =', raw ? raw.slice(0, 20) + '…  (len ' + raw.length + ')' : '(null)');
console.log('  NEXTAUTH_SECRET set             =', !!get('NEXTAUTH_SECRET'));

console.log('\n=== decode BASE64 ===');
let decoded = null;
if (b64) {
  decoded = Buffer.from(b64, 'base64').toString('utf-8');
  console.log('  decoded:', decoded);
  console.log('  looks like bcrypt:', /^\$2[aby]?\$\d\d\$/.test(decoded));
}

console.log('\n=== raw hash has escaped $? ===');
if (raw) {
  console.log('  raw as stored :', JSON.stringify(raw));
  const unescaped = raw.replace(/\\\$/g, '$');
  console.log('  unescaped     :', JSON.stringify(unescaped));
  console.log('  raw===decoded :', unescaped === decoded);
}

console.log('\n=== bcrypt.compare("Mamma2024!", hash) ===');
let bcrypt;
try { bcrypt = require(SITE + '/node_modules/bcryptjs'); }
catch (e) { try { bcrypt = require('bcryptjs'); } catch (e2) { console.log('  bcryptjs not resolvable: ' + e2.message); process.exit(0); } }

(async () => {
  for (const [label, hash] of [['decoded-from-b64', decoded], ['raw-unescaped', raw ? raw.replace(/\\\$/g, '$') : null]]) {
    if (!hash) continue;
    try {
      const ok = await bcrypt.compare('Mamma2024!', hash);
      console.log('  ' + label.padEnd(20) + ' -> ' + (ok ? 'MATCHES PASSWORD' : 'DOES NOT MATCH'));
    } catch (e) {
      console.log('  ' + label.padEnd(20) + ' -> THREW ' + e.message);
    }
  }

  // Also try the other two sites' passwords in case of mix-up
  console.log('\n=== cross-check: does this hash match the documented password? ===');
  const candidates = ['Mamma2024!', 'Mamma2024', 'admin', 'Password123!', 'Mamma2024!!'];
  for (const pw of candidates) {
    if (!decoded) break;
    const ok = await bcrypt.compare(pw, decoded);
    if (ok) console.log('  MATCH: ' + JSON.stringify(pw));
  }

  // Sanity: generate what the hash SHOULD be for Mamma2024!
  console.log('\n=== what a correct hash for "Mamma2024!" looks like (cost 10) ===');
  const h = await bcrypt.hash('Mamma2024!', 10);
  console.log('  ' + h);
  console.log('  its base64 would be:', Buffer.from(h, 'utf-8').toString('base64'));
  console.log('  current b64 decodes to same hash?', Buffer.from(b64 || '', 'base64').toString('utf-8') === h);
})();
