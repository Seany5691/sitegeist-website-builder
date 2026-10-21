const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

const start = app.indexOf('  // Section editors reuse the feature-card field/list/upload handlers.');
console.log('bind block start at', start);
// find the end: last addEventListener of the block
const endMarker = "document.getElementById('hours')?.addEventListener('change', onFeaturesGridFileChange);";
const end = app.indexOf(endMarker, start);
console.log('bind block end at', end, ' -> after:', end + endMarker.length);

console.log('\n--- 300 chars BEFORE start ---');
console.log(JSON.stringify(app.slice(start - 300, start)));

console.log('\n--- 500 chars AFTER end ---');
console.log(JSON.stringify(app.slice(end + endMarker.length, end + endMarker.length + 500)));

// where does the enclosing function / DOMContentLoaded handler start?
const dc = app.indexOf('DOMContentLoaded');
console.log('\nDOMContentLoaded at', dc);
