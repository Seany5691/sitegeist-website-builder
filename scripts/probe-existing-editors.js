const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== existing "Save Social Links" region in index.html ===');
const s = idx.indexOf('Save Social Links');
console.log(idx.slice(s - 1800, s + 200));

console.log('\n=== loadBusinessHours / saveBusinessHours ===');
for (const fn of ['loadBusinessHours', 'saveBusinessHours', 'loadLocationIdentity', 'saveLocationIdentity']) {
  const i = app.indexOf('function ' + fn);
  console.log('--- ' + fn + ' at ' + i + ' ---');
  if (i >= 0) console.log(app.slice(i, i + 900));
}

console.log('\n=== socialLinks write target ===');
const sl = app.indexOf('socialLinks');
let idxs = [];
let pos = 0;
while ((pos = app.indexOf('socialLinks', pos + 1)) !== -1 && idxs.length < 8) idxs.push(pos);
idxs.forEach(i => console.log('  ...' + app.slice(i - 90, i + 110).replace(/\n/g, ' | ')));

console.log('\n=== renderFeatureField types supported ===');
const rf = app.indexOf('function renderFeatureField');
const body = app.slice(rf, rf + 4200);
const cases = [...body.matchAll(/case '([^']+)'/g)].map(m => m[1]);
console.log('  cases: ' + cases.join(', '));

console.log('\n=== FEATURE_FIELDS keys ===');
const ff = app.indexOf('const FEATURE_FIELDS');
const ffBody = app.slice(ff, ff + 6000);
const keys = [...ffBody.matchAll(/^\s{2}(\w+):\s*\[/gm)].map(m => m[1]);
console.log('  ' + keys.join(', '));
