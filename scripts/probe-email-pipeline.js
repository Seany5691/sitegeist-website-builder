const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const COMP = WB + '/templates/components';
const BACK = WB + '/templates/backend';

console.log('========== lib/leads.ts ==========');
console.log(fs.readFileSync(BACK + '/lib/leads.ts', 'utf8'));

console.log('\n========== app/api/contact/route.ts (rest) ==========');
const c = fs.readFileSync(BACK + '/app/api/contact/route.ts', 'utf8');
console.log(c.slice(1700));

console.log('\n========== NewsletterBlock submit ==========');
const nb = fs.readFileSync(COMP + '/newsletter/NewsletterBlock.tsx', 'utf8');
console.log(nb);

console.log('\n========== NewsletterPopup (submit region) ==========');
const np = fs.readFileSync(COMP + '/features/NewsletterPopup.tsx', 'utf8');
const i = np.indexOf('onSubmit');
console.log(np.slice(Math.max(0, i - 1500), i + 1200));

console.log('\n========== QuoteSlideIn (submit region) ==========');
const qs = fs.readFileSync(COMP + '/features/QuoteSlideIn.tsx', 'utf8');
const j = qs.indexOf('onSubmit');
console.log(qs.slice(Math.max(0, j - 1800), j + 1400));
console.log('\n--- QuoteSlideIn data keys it reads ---');
console.log((qs.match(/data\??\.[a-zA-Z0-9_.]+/g) || [...new Set(qs.match(/d\??\.[a-zA-Z0-9_.]+/g) || [])]).slice(0, 20).join(' '));
const dkeys = [...new Set(qs.match(/\bd\.[a-zA-Z0-9_]+/g) || [])];
console.log('d.* keys: ' + dkeys.join(' '));
