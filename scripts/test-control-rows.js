const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

// Extract the exact source of the pieces that build the Website Control rows.
function grab(startMarker, endMarker) {
  const i = app.indexOf(startMarker);
  if (i < 0) throw new Error('not found: ' + startMarker);
  const j = app.indexOf(endMarker, i);
  if (j < 0) throw new Error('end not found: ' + endMarker);
  return app.slice(i, j);
}

// Pull the constants + the two functions verbatim
const pieces = [
  grab('const CONTROL_SECTIONS = [', '\nconst CONTROL_PAGES = ['),
  grab('const CONTROL_PAGES = [', '\nconst CONTROL_SECTION_DEFAULTS = {'),
  grab('const CONTROL_SECTION_DEFAULTS = {', '\nconst CONTROL_PAGE_DEFAULTS = {'),
  grab('const CONTROL_PAGE_DEFAULTS = {', '\n/**'),
  grab('function getWebsiteControls() {', '\nfunction renderControlRows('),
  grab('function renderControlRows(', '\nfunction hydrateWebsiteControl('),
  grab('function hydrateWebsiteControl(', '\n/** Up / down arrows'),
];

const src = pieces.join('\n\n');

// Minimal stubs
const harness = `
let siteConfig = null;
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function markDirty() {}
function showToast() {}

${src}

module.exports = { getWebsiteControls, renderControlRows, hydrateWebsiteControl, CONTROL_SECTIONS, CONTROL_PAGES };
`;

const mod = { exports: {} };
try {
  new Function('module', 'exports', harness)(mod, mod.exports);
} catch (e) {
  console.log('*** HARNESS EVAL FAILED: ' + e.message + ' ***');
  console.log(e.stack.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}
const api = mod.exports;
console.log('harness loaded OK');

// Fake DOM
function fakeEl() {
  return {
    innerHTML: '',
    querySelectorAll: () => [],
    classList: { add() {}, remove() {}, toggle() {} },
  };
}

// Test 1: getWebsiteControls with null siteConfig
global.siteConfig = null;
// re-run through a getter pattern: the harness captured siteConfig by value, so
// instead re-evaluate with a mutable holder
const harness2 = `
var siteConfig = null;
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function markDirty() {}
function showToast() {}
function getFeatureData() { return (siteConfig && siteConfig.featureData) || {}; }

${src}

module.exports = {
  setCfg: function (v) { siteConfig = v; },
  getCfg: function () { return siteConfig; },
  getWebsiteControls: getWebsiteControls,
  renderControlRows: renderControlRows,
  hydrateWebsiteControl: hydrateWebsiteControl,
  CONTROL_SECTIONS: CONTROL_SECTIONS,
};
`;

const m2 = { exports: {} };
try {
  new Function('module', 'exports', harness2)(m2, m2.exports);
} catch (e) {
  console.log('*** HARNESS2 EVAL FAILED: ' + e.message + ' ***');
  console.log(e.stack.split('\n').slice(0, 8).join('\n'));
  process.exit(1);
}

console.log('\n=== Test A: null siteConfig ===');
m2.exports.setCfg(null);
let c;
try {
  c = m2.exports.getWebsiteControls();
  console.log('  getWebsiteControls OK');
  console.log('  sections keys : ' + Object.keys(c.sections).length);
  console.log('  sectionOrder  : ' + JSON.stringify(c.sectionOrder));
  console.log('  pages keys    : ' + Object.keys(c.pages).length);
} catch (e) {
  console.log('  *** THREW: ' + e.message + ' ***');
  console.log('  ' + e.stack.split('\n').slice(0, 5).join('\n  '));
}

console.log('\n=== Test B: with live-like sectionOrder ===');
m2.exports.setCfg({
  controls: {
    sections: { hero: true, cta: true, services: true },
    pages: { home: true, contact: true },
    features: {},
    sectionOrder: ['hero', 'statsBar', 'services', 'process', 'gallery', 'beforeAfter', 'latestWork', 'testimonials', 'trustBadges', 'about', 'team', 'partners', 'video', 'serviceAreas', 'location', 'hours', 'pricing', 'faq', 'blogStrip', 'awards', 'instagram', 'newsletter', 'vsl', 'cta'],
  },
});
try {
  c = m2.exports.getWebsiteControls();
  console.log('  sectionOrder len: ' + c.sectionOrder.length);
  const ordered = c.sectionOrder.map(id => m2.exports.CONTROL_SECTIONS.find(s => s.id === id)).filter(Boolean);
  console.log('  orderedSections : ' + ordered.length);
  const el = fakeEl();
  m2.exports.renderControlRows(el, ordered, 'sections');
  const rows = (el.innerHTML.match(/data-control-id=/g) || []).length;
  console.log('  rendered rows   : ' + rows);
  const el2 = fakeEl();
  m2.exports.renderControlRows(el2, m2.exports.CONTROL_PAGES, 'pages');
  console.log('  rendered pages  : ' + (el2.innerHTML.match(/data-control-id=/g) || []).length);
  if (rows === 0) console.log('  *** ZERO SECTION ROWS — repro ***');
} catch (e) {
  console.log('  *** THREW: ' + e.message + ' ***');
  console.log('  ' + e.stack.split('\n').slice(0, 5).join('\n  '));
}

console.log('\n=== Test C: sectionOrder missing / garbage ===');
m2.exports.setCfg({ controls: { sections: {}, pages: {}, features: {}, sectionOrder: [] } });
try {
  c = m2.exports.getWebsiteControls();
  console.log('  sectionOrder after normalise (empty input): ' + JSON.stringify(c.sectionOrder));
  const ordered = (c.sectionOrder || []).map(id => m2.exports.CONTROL_SECTIONS.find(s => s.id === id)).filter(Boolean);
  console.log('  orderedSections : ' + ordered.length + (ordered.length === 0 ? '   *** THIS IS THE BUG ***' : ''));
} catch (e) {
  console.log('  *** THREW: ' + e.message + ' ***');
}

console.log('\n=== Test D: sectionOrder is a string (corrupted) ===');
m2.exports.setCfg({ controls: { sections: {}, pages: {}, features: {}, sectionOrder: 'hero,cta' } });
try {
  c = m2.exports.getWebsiteControls();
  console.log('  sectionOrder type: ' + typeof c.sectionOrder + '  value: ' + JSON.stringify(c.sectionOrder));
} catch (e) {
  console.log('  *** THREW: ' + e.message + ' ***');
}
