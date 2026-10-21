const fs = require('fs');
const COMP = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components';

function show(label, path, needle, before, after) {
  const s = fs.readFileSync(path, 'utf8');
  const i = s.indexOf(needle);
  console.log('\n===== ' + label + ' (needle at ' + i + ') =====');
  if (i < 0) { console.log('NOT FOUND'); return; }
  console.log(s.slice(Math.max(0, i - before), i + after));
}

show('NewsletterPopup submit fn', COMP + '/features/NewsletterPopup.tsx', 'const submit', 200, 900);
show('NewsletterPopup state', COMP + '/features/NewsletterPopup.tsx', 'const [email', 300, 700);
show('QuoteSlideIn submit fn', COMP + '/features/QuoteSlideIn.tsx', 'const submit', 200, 1200);
show('QuoteSlideIn state + fields', COMP + '/features/QuoteSlideIn.tsx', 'const [', 100, 900);

// field refs in QuoteSlideIn
const qs = fs.readFileSync(COMP + '/features/QuoteSlideIn.tsx', 'utf8');
console.log('\n===== QuoteSlideIn: useRef / refs =====');
const refs = [...qs.matchAll(/ref=\{(\w+)\}/g)].map(m => m[1]);
console.log('  refs used: ' + [...new Set(refs)].join(', '));
const decls = [...qs.matchAll(/const (\w+) = useRef[^;]*/g)].map(m => m[0]);
console.log('  declared : ' + decls.join(' | '));

// data keys QuoteSlideIn reads
console.log('\n===== QuoteSlideIn data.* keys =====');
const dkeys = [...new Set(qs.match(/data\.[a-zA-Z0-9_]+/g) || [])];
console.log('  ' + dkeys.join(', '));

// FEATURE_FIELDS entry for quoteSlideIn
const app = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js', 'utf8');
const qf = app.indexOf('quoteSlideIn: [');
console.log('\n===== FEATURE_FIELDS.quoteSlideIn =====');
console.log(app.slice(qf, qf + 700));
const nf = app.indexOf('newsletterPopup: [');
console.log('\n===== FEATURE_FIELDS.newsletterPopup =====');
console.log(app.slice(nf, nf + 700));
