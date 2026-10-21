const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== required functions present? ===');
for (const fn of [
  'renderControlRows', 'hydrateWebsiteControl', 'getWebsiteControls', 'onSectionOrderClick',
  'moveSectionOrder', 'makeDraggable', 'reorderArray', 'setupAdaptiveNavigation',
  'loadDashboardData', 'renderFeatureCards', 'renderVslFields', 'renderSectionFields',
  'saveSectionData', 'writeFeatureFieldsFromDom', 'ensureFeatureData', 'escapeHtml',
  'onFeaturesGridChange', 'onFeaturesGridClick', 'onFeaturesGridFileChange',
  'harvestSectionEditors', 'hydrateSectionView', 'applySectionView', 'isSectionEditor',
]) {
  const def = app.includes('function ' + fn) || app.includes('const ' + fn + ' =') || app.includes('async function ' + fn);
  console.log('  ' + fn.padEnd(28) + (def ? 'defined' : '*** MISSING ***'));
}

console.log('\n=== CONTROL_SECTIONS / CONTROL_SECTION_DEFAULTS intact? ===');
const cs = app.match(/const CONTROL_SECTIONS = \[([\s\S]*?)\n\];/);
console.log('  CONTROL_SECTIONS: ' + (cs ? (cs[1].match(/id: '/g) || []).length + ' entries' : '*** NOT FOUND / MALFORMED ***'));
const cd = app.match(/const CONTROL_SECTION_DEFAULTS = \{([\s\S]*?)\n\};/);
console.log('  DEFAULTS: ' + (cd ? 'ok' : '*** NOT FOUND ***'));
const cp = app.match(/const CONTROL_PAGES = \[([\s\S]*?)\n\];/);
console.log('  CONTROL_PAGES: ' + (cp ? (cp[1].match(/id: '/g) || []).length + ' entries' : '*** NOT FOUND ***'));

console.log('\n=== SECTION_FIELDS JSON valid? ===');
const sm = app.match(/const SECTION_FIELDS = (\{[\s\S]*?\n\});/);
if (!sm) console.log('  *** SECTION_FIELDS not matched ***');
else {
  try {
    const o = JSON.parse(sm[1]);
    console.log('  parses OK, ' + Object.keys(o).length + ' sections: ' + Object.keys(o).join(', '));
  } catch (e) {
    console.log('  *** JSON PARSE FAIL: ' + e.message + ' ***');
  }
}

console.log('\n=== the vsl/section listener bind block ===');
const bi = app.indexOf('Section editors reuse the feature-card');
console.log('  at char ' + bi);
if (bi > 0) {
  // what function/block is it inside? walk backwards for the enclosing function
  const before = app.slice(Math.max(0, bi - 2500), bi);
  const fnMatches = [...before.matchAll(/function (\w+)/g)];
  console.log('  nearest preceding functions: ' + fnMatches.slice(-4).map(m => m[1]).join(', '));
  console.log('--- 400 chars before ---');
  console.log(before.slice(-400));
  console.log('--- bind block + 200 after ---');
  console.log(app.slice(bi, bi + 1400));
}

console.log('\n=== brace balance ===');
let depth = 0, min = 0;
for (const ch of app) { if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth < min) min = depth; } }
console.log('  final depth ' + depth + ' (0 = balanced), min ' + min);

console.log('\n=== look for doubled/stray tokens from patching ===');
for (const pat of ['}function ', '}const ', '}  function ', ';;', '}};', 'SECTION_FIELDS = { const']) {
  const n = (app.split(pat).length - 1);
  if (n) console.log('  ' + JSON.stringify(pat) + ' x' + n);
}
