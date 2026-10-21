const fs = require('fs');
const SITE = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze';
const app = fs.readFileSync(SITE + '/public/dashboard/assets/app.js', 'utf8');
const lines = app.split('\n');
const targets = [813, 1212, 1345, 1355, 1531, 1563, 1625, 1884, 2100, 3186, 3200, 3218, 3240, 3264, 3282, 3388];

for (const n of targets) {
  console.log('\n===== line ' + n + ' =====');
  for (let i = n - 4; i <= n + 2; i++) {
    if (i > 0 && i <= lines.length) console.log(String(i).padStart(5) + (i === n ? '>>' : '  ') + ': ' + lines[i - 1].slice(0, 170));
  }
}

console.log('\n\n===== how does the dashboard escape? =====');
const e = app.indexOf('function escapeHtml');
console.log(app.slice(e, e + 500));

console.log('\n===== session cookie config in next-auth route =====');
console.log(fs.readFileSync(SITE + '/app/api/auth/[...nextauth]/route.ts', 'utf8'));
