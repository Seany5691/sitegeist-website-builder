const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

const MAP = [
  ['templates/backend/lib/leads.ts', 'lib/leads.ts'],
  ['templates/backend/app/api/contact/route.ts', 'app/api/contact/route.ts'],
  ['templates/backend/app/api/leads/route.ts', 'app/api/leads/route.ts'],
  ['templates/components/newsletter/NewsletterBlock.tsx', 'components/NewsletterBlock.tsx'],
  ['templates/components/features/NewsletterPopup.tsx', 'components/features/NewsletterPopup.tsx'],
  ['templates/components/features/QuoteSlideIn.tsx', 'components/features/QuoteSlideIn.tsx'],
  ['templates/dashboard/index.html', 'public/dashboard/index.html'],
  ['templates/dashboard/assets/app.js', 'public/dashboard/assets/app.js'],
  ['templates/dashboard/assets/styles.css', 'public/dashboard/assets/styles.css'],
];

let ok = true;
for (const s of SITES) {
  for (const [srcRel, destRel] of MAP) {
    const src = WB + '/' + srcRel;
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    const content = fs.readFileSync(src, 'utf8');
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(42) + (match ? 'OK' : '*** MISMATCH ***'));
  }
  const cfg = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/assets/config.js', 'utf8');
  const ph = (cfg.match(/\{\{[A-Z_]+\}\}/g) || []).length;
  const refs = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/index.html', 'utf8').match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
  console.log('  ' + s.padEnd(32) + 'config.js placeholders=' + ph + '  refs=' + JSON.stringify(refs));
  if (ph > 0 || refs.length !== 3) ok = false;
}

console.log('\n' + (ok ? 'ALL FILES SYNCED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
