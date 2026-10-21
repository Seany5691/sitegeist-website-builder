const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== vsl listener bindings ===');
let pos = 0;
const hits = [];
while ((pos = app.indexOf("'#vsl'", pos + 1)) !== -1) hits.push(pos);
while ((pos = app.indexOf('"#vsl"', pos + 1)) !== -1) hits.push(pos);
hits.forEach(i => console.log('--- at ' + i + ' ---\n' + app.slice(i - 400, i + 500) + '\n'));

console.log('\n=== ensureFeatureData ===');
const e = app.indexOf('function ensureFeatureData');
console.log(app.slice(e, e + 500));

console.log('\n=== onFeaturesGridClick add/remove region ===');
const c = app.indexOf('function onFeaturesGridClick');
const body = app.slice(c, c + 3000);
console.log(body);

console.log('\n=== onFeaturesGridFileChange ===');
const f = app.indexOf('function onFeaturesGridFileChange');
console.log(app.slice(f, f + 1800));
