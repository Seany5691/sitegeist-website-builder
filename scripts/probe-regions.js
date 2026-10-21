const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

function region(label, needle, before, after) {
  const i = app.indexOf(needle);
  console.log('\n########## ' + label + '  (at ' + i + ') ##########');
  if (i < 0) { console.log('  NOT FOUND'); return; }
  console.log(app.slice(Math.max(0, i - before), i + after));
}

region('VSL BIND + MY INSERT', '// VSL panel reuses the feature-field handlers', 0, 2600);

region('hydrateSectionView / applySectionView end + ensureFeatureData', 'function ensureFeatureData(key) {', 900, 400);

region('nav hydration insert', "getElementById('navProcess')", 900, 1200);

region('applyNavigationFields', 'function applyNavigationFields()', 0, 1500);

region('hydrateWebsiteControl', 'function hydrateWebsiteControl()', 0, 1200);

region('renderControlRows', 'function renderControlRows(', 0, 1600);
