const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';

console.log('=== app.js lines 500-620 (the TypeError region) ===');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8').split('\n');
for (let i = 495; i < 625 && i < app.length; i++) {
  console.log(String(i + 1).padStart(5) + ': ' + app[i]);
}

console.log('\n=== ensureSiteDataLoaded source ===');
const a = fs.readFileSync(P + '/assets/app.js', 'utf8');
const i = a.indexOf('function ensureSiteDataLoaded');
console.log(a.slice(i, i + 1400));

console.log('\n=== config.js syntax + content ===');
const cfg = fs.readFileSync(P + '/assets/config.js', 'utf8');
console.log(cfg);
