const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

const i = app.indexOf('function getWebsiteControls() {');
const j = app.indexOf('function renderControlRows(', i);
console.log('=== getWebsiteControls ===');
console.log(app.slice(i, j));

console.log('\n=== FEATURE_DEFS definition head ===');
const f = app.indexOf('const FEATURE_DEFS');
console.log(app.slice(f, f + 400));

console.log('\n=== does getWebsiteControls or nearby reference SECTION_FIELDS? ===');
const seg = app.slice(i, j);
console.log('  SECTION_FIELDS in getWebsiteControls: ' + seg.includes('SECTION_FIELDS'));
console.log('  FEATURE_DEFS  in getWebsiteControls: ' + seg.includes('FEATURE_DEFS'));

console.log('\n=== all top-level const declarations order (first 40) ===');
const re = /^(?:const|let|var|function|async function) ([A-Za-z_$][\w$]*)/gm;
let m, n = 0;
const names = [];
while ((m = re.exec(app)) !== null && n < 60) {
  names.push(m.index + ':' + m[1]);
  n++;
}
console.log(names.join('\n'));
