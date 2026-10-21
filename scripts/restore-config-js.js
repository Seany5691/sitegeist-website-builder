const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const BACKUP = ROOT + '/GeistBackups/Websites-3sites - backup 2026-10-06 1935';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

console.log('=== restore public/dashboard/assets/config.js from WS0 backup ===');
for (const s of SITES) {
  const src = path.join(BACKUP, s, 'public', 'dashboard', 'assets', 'config.js');
  const dst = path.join(ROOT, 'Websites', s, 'public', 'dashboard', 'assets', 'config.js');
  if (!fs.existsSync(src)) { console.log('  ' + s + '  *** BACKUP MISSING ***'); continue; }

  const content = fs.readFileSync(src, 'utf8');
  const placeholders = content.match(/\{\{[A-Z_]+\}\}/g) || [];
  if (placeholders.length) {
    console.log('  ' + s + '  *** BACKUP STILL HAS PLACEHOLDERS: ' + placeholders.join(', ') + ' ***');
    continue;
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, content, 'utf8');
  const check = fs.readFileSync(dst, 'utf8');
  const ok = check === content && !(check.match(/\{\{[A-Z_]+\}\}/g) || []).length;

  // what businessName did it restore?
  const bn = (check.match(/businessName:\s*"([^"]*)"/) || [])[1];
  console.log('  ' + s.padEnd(32) + (ok ? 'RESTORED' : '*** FAIL ***') + '  ' + check.length + 'b  businessName="' + bn + '"');
}

console.log('\n=== verify: no placeholders anywhere in the 3 sites\' config.js ===');
let bad = 0;
for (const s of SITES) {
  const p = path.join(ROOT, 'Websites', s, 'public', 'dashboard', 'assets', 'config.js');
  const t = fs.readFileSync(p, 'utf8');
  const ph = t.match(/\{\{[A-Z_]+\}\}/g) || [];
  console.log('  ' + s.padEnd(32) + (ph.length ? ph.length + ' PLACEHOLDERS ***' : 'clean'));
  if (ph.length) bad++;
  // must define DASHBOARD_CONFIG and assign to window
  const ok = t.includes('const DASHBOARD_CONFIG') && t.includes('window.DASHBOARD_CONFIG');
  console.log('  ' + ' '.repeat(32) + (ok ? 'DASHBOARD_CONFIG + window assign present' : '*** STRUCTURE BROKEN ***'));
  if (!ok) bad++;
}

console.log('\n' + (bad === 0 ? 'RESTORE OK' : bad + ' PROBLEM(S)'));
process.exit(bad === 0 ? 0 : 1);
