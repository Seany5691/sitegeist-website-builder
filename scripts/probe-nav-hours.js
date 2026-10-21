const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== CURRENT SIDEBAR NAV ORDER ===');
const navItems = [];
const parts = idx.split('data-section="');
for (let i = 1; i < parts.length; i++) {
  const id = parts[i].split('"')[0];
  const chunk = parts[i].slice(0, 400);
  const iconM = chunk.match(/fas ([a-z0-9-]+)/);
  const labelM = chunk.match(/<span>([^<]+)</);
  navItems.push({ id, icon: iconM ? iconM[1] : '?', label: labelM ? labelM[1] : '?' });
}
navItems.forEach((it, i) => console.log('  ' + String(i + 1).padStart(2) + '. ' + it.id.padEnd(14) + it.icon.padEnd(22) + it.label));

console.log('\n=== SETTINGS: Business Hours card ===');
const bh = idx.indexOf('businessHoursList');
console.log('businessHoursList at ' + bh);
console.log(idx.slice(Math.max(0, bh - 1400), bh + 1000));

console.log('\n=== HOURS PANEL (current) ===');
const hp = idx.indexOf('<section id="hours"');
console.log(idx.slice(hp, hp + 1400));

console.log('\n=== app.js business-hours functions ===');
for (const fn of ['function loadBusinessHours', 'function saveBusinessHours', 'function applyBusinessHoursToggle']) {
  const i = app.indexOf(fn);
  console.log('\n--- ' + fn + ' at ' + i + ' ---');
  if (i > 0) console.log(app.slice(i, i + 1000));
}

console.log('\n=== switchSection dispatch around isSectionEditor ===');
const ss = app.indexOf('isSectionEditor(section)) {');
console.log(app.slice(ss - 260, ss + 340));
