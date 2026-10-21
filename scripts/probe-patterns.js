const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

function show(label, src, start, len) {
  console.log('\n========== ' + label + ' ==========');
  console.log(src.slice(start, start + len));
}

const i = idx.indexOf('id="vsl"');
show('#vsl panel', idx, i - 220, 1300);

const j = idx.indexOf('id="team"');
show('#team panel', idx, j - 220, 1500);

const a = app.indexOf('function renderVslFields');
show('renderVslFields', app, a, 2000);

const b = app.indexOf('function switchSection');
show('switchSection', app, b, 2400);

const c = app.indexOf('const sectionTabs');
show('sectionTabs', app, c, 500);

const d = app.indexOf('function renderFeatureCardBody');
show('renderFeatureCardBody', app, d, 1800);

const e = app.indexOf('function renderFeatureList');
show('renderFeatureList', app, e, 2000);

// nav item markup
const n = idx.indexOf('data-section="vsl"');
show('nav item vsl', idx, n - 300, 500);

// CONTROL_SECTIONS + SECTION_FEATURE_KEY
const f = app.indexOf('const CONTROL_SECTIONS');
show('CONTROL_SECTIONS', app, f, 2600);

const g = app.indexOf('const CONTROL_SECTION_DEFAULTS');
show('CONTROL_SECTION_DEFAULTS', app, g, 1400);
