const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];
const src = WB + '/templates/backend/lib/leads.ts';

const content = fs.readFileSync(src, 'utf8');
let ok = true;

for (const s of SITES) {
  const dst = ROOT + '/Websites/' + s + '/lib/leads.ts';
  fs.writeFileSync(dst, content, 'utf8');
  const match = fs.readFileSync(dst, 'utf8') === content;
  if (!match) ok = false;
  console.log('  ' + s.padEnd(32) + 'lib/leads.ts  ' + (match ? 'OK' : '*** MISMATCH ***') + '  ' + content.length + 'b');
}

console.log('\n=== sanity ===');
function assert(c, l) {
  console.log('  ' + l.padEnd(58) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}
assert(content.includes('marketingConsentText?: string | null'), 'type allows null');
assert(content.includes('marketingConsent?: boolean | null'), 'consent type allows null');
assert(content.includes('const insertRow = async'), 'migration-tolerant insert present');
assert(content.includes('export async function submitLead'), 'submitLead exported');
assert((content.match(/\uFFFD/g) || []).length === 0, 'no U+FFFD corruption');

console.log('\n' + (ok ? 'leads.ts SYNCED WITH WIDENED TYPE' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
