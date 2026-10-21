const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

function grabFn(name, nextNeedle) {
  const i = app.indexOf('function ' + name);
  if (i < 0) throw new Error('not found: ' + name);
  const j = app.indexOf(nextNeedle, i);
  return app.slice(i, j < 0 ? i + 4000 : j);
}

console.log('=== switchSection (does isSectionEditor branch exist?) ===');
const ss = app.indexOf('function switchSection');
console.log(app.slice(ss, ss + 1700));

console.log('\n=== renderSectionFields ===');
const i = app.indexOf('function renderSectionFields');
console.log(app.slice(i, i + 700));

console.log('\n=== renderFeatureCardBody ===');
const j = app.indexOf('function renderFeatureCardBody');
console.log(app.slice(j, j + 700));

// ── harness: actually render each section ─────────────────────────────────
const SECTION_FIELDS_JSON = (app.match(/const SECTION_FIELDS = (\{[\s\S]*?\n\});/) || [])[1];
if (!SECTION_FIELDS_JSON) throw new Error('SECTION_FIELDS missing');

const escapeHtmlSrc = grabFn('escapeHtml', '\nfunction ');
const isSectionEditorSrc = grabFn('isSectionEditor', '\nfunction ');
const ensureSectionViewSrc = grabFn('ensureSectionView', '\n/**');
const ensureFeatureDataSrc = grabFn('ensureFeatureData', '\nfunction renderFeatureField');
const renderFeatureFieldSrc = grabFn('renderFeatureField', '\nfunction ');
const renderFeatureListSrc = grabFn('renderFeatureList', '\n/**');
const renderFeatureCardBodySrc = grabFn('renderFeatureCardBody', '\n/** Optional per-feature');

const harness = `
${escapeHtmlSrc}
const SECTION_FIELDS = ${SECTION_FIELDS_JSON};
const FEATURE_FIELDS = {};
const SECTION_VIEWS = {};
${isSectionEditorSrc}
${ensureSectionViewSrc}
${ensureFeatureDataSrc}
function getFeatureData() { return {}; }
function renderTrustBadgesPreview() { return ''; }
${renderFeatureFieldSrc}
${renderFeatureListSrc}
${renderFeatureCardBodySrc}
module.exports = { renderFeatureCardBody, SECTION_FIELDS, ensureSectionView, isSectionEditor };
`;

const m = { exports: {} };
try {
  new Function('module', 'exports', harness)(m, m.exports);
} catch (e) {
  console.log('\n*** HARNESS EVAL FAILED: ' + e.message + ' ***');
  console.log(e.stack.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}

console.log('\n=== renderFeatureCardBody output per section ===');
let bad = 0;
for (const id of Object.keys(m.exports.SECTION_FIELDS)) {
  let html;
  try {
    html = m.exports.renderFeatureCardBody(id);
  } catch (e) {
    console.log('  ' + id.padEnd(12) + '*** THREW: ' + e.message + ' ***');
    bad++;
    continue;
  }
  const fields = (html.match(/data-feature-field=/g) || []).length;
  const adds = (html.match(/data-feature-add=/g) || []).length;
  console.log('  ' + id.padEnd(12) + 'html=' + String(html.length).padStart(6) + '  fields=' + fields + '  addBtns=' + adds + (html.trim() ? '' : '   *** EMPTY ***'));
  if (!html.trim() || fields === 0) bad++;
}

console.log('\n=== sample: process ===');
try { console.log(m.exports.renderFeatureCardBody('process').slice(0, 1200)); } catch (e) { console.log('THREW ' + e.message); }

console.log('\n' + (bad === 0 ? 'RENDER OK' : bad + ' SECTION(S) RENDER EMPTY'));
