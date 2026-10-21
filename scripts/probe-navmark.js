const fs = require('fs');
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/index.html';
const t = fs.readFileSync(p, 'utf8');
for (const id of ['overview', 'leads', 'hero']) {
  const i = t.indexOf('data-section="' + id + '"');
  console.log('\n===== ' + id + ' (at ' + i + ') =====');
  console.log(t.slice(Math.max(0, i - 420), i + 260));
}
console.log('\n===== sidebar nav open tag =====');
const n = t.indexOf('<nav');
console.log(t.slice(n, n + 400));
