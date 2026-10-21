const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== the 7 URL-only image inputs (with 250 chars context each) ===');
for (const id of ['servicesHeroImage', 'portfolioHeroImage', 'aboutHeroImage', 'contactHeroImage', 'serviceImageUrl', 'blogImageUrl', 'teamImageUrl']) {
  const i = idx.indexOf('id="' + id + '"');
  console.log('\n--- ' + id + ' (at ' + i + ') ---');
  if (i < 0) { console.log('  NOT FOUND'); continue; }
  console.log(idx.slice(Math.max(0, i - 320), i + 180));
}

console.log('\n\n=== handleHeroImageUpload + handleAboutImageUpload ===');
for (const fn of ['handleHeroImageUpload', 'handleAboutImageUpload']) {
  const i = app.indexOf('function ' + fn);
  console.log('\n--- ' + fn + ' at ' + i + ' ---');
  if (i > 0) console.log(app.slice(i, i + 900));
}

console.log('\n\n=== beforeAfter FEATURE_FIELDS entry ===');
const bf = app.indexOf('beforeAfter: [');
console.log(app.slice(bf, bf + 900));

console.log('\n\n=== trustBadges FEATURE_FIELDS entry ===');
const tb = app.indexOf('trustBadges: [');
console.log(app.slice(tb, tb + 900));

console.log('\n\n=== newsletterPopup image field ===');
const np = app.indexOf('newsletterPopup: [');
console.log(app.slice(np, np + 700));
