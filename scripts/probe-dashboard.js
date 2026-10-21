const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('index.html', idx.length, 'bytes', idx.split('\n').length, 'lines');
console.log('app.js    ', app.length, 'bytes', app.split('\n').length, 'lines');

console.log('\n=== panels / nav present? ===');
for (const id of ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'stats', 'video', 'hours', 'vsl', 'team', 'pricing']) {
  const panel = idx.includes('id="' + id + '"');
  const nav = idx.includes('data-section="' + id + '"');
  console.log('  ' + id.padEnd(14) + 'panel:' + (panel ? 'YES' : 'no ').padEnd(4) + '  nav:' + (nav ? 'YES' : 'no'));
}

console.log('\n=== sectionTabs ===');
const st = app.match(/const sectionTabs = \{([\s\S]*?)\};/);
console.log(st ? st[1].replace(/\s+/g, ' ').trim() : 'NOT FOUND');

console.log('\n=== switchSection cases mentioning the orphans ===');
for (const id of ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours']) {
  console.log('  ' + id.padEnd(14) + (app.includes("'" + id + "'") ? 'referenced' : 'not referenced'));
}

console.log('\n=== render functions ===');
for (const fn of ['renderProcessFields', 'renderLatestWorkFields', 'renderPartnersFields', 'renderAwardsFields',
  'renderSocialFields', 'renderNewsletterFields', 'renderStatsFields', 'renderVideoFields', 'renderHoursFields',
  'renderVslFields', 'renderFeatureCards', 'saveSingleFeature', 'setDirty', 'updateFloatingSave']) {
  console.log('  ' + fn.padEnd(26) + (app.includes('function ' + fn) ? 'defined' : '*** MISSING ***'));
}

console.log('\n=== menu labels state ===');
console.log('  navProcess in html: ' + idx.includes('id="navProcess"'));
console.log('  navProcess in app : ' + app.includes("getElementById('navProcess')"));
console.log('  showInMenu in app : ' + app.includes('showInMenu'));

console.log('\n=== cache-buster ===');
const refs = idx.match(/assets\/[^\"]+/g) || [];
refs.forEach(r => console.log('  ' + r));
