const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

function dump(label, needle, len) {
  const i = app.indexOf(needle);
  console.log('\n########## ' + label + ' (at ' + i + ') ##########');
  if (i < 0) { console.log('NOT FOUND'); return; }
  console.log(app.slice(i, i + len));
}

dump('loadDashboardData', 'async function loadDashboardData', 2600);
dump('loadSiteConfig', 'async function loadSiteConfig', 1200);
dump('checkAuth', 'async function checkAuth', 1200);
dump('showDashboard', 'function showDashboard', 900);
dump('DOMContentLoaded wiring', "DOMContentLoaded", 2200);
dump('setupAdaptiveNavigation', 'function setupAdaptiveNavigation', 1800);
