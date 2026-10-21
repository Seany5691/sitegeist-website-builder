const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const src = fs.readFileSync(P + '/assets/app.js', 'utf8');

// ── minimal DOM stub that records innerHTML writes ────────────────────────
const elements = new Map();
function makeEl(id) {
  if (elements.has(id)) return elements.get(id);
  const el = {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    style: {},
    dataset: {},
    files: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    querySelectorAll: () => [],
    querySelector: () => null,
    closest: () => null,
    setAttribute() {},
    getAttribute: () => null,
    dispatchEvent() {},
    click() {},
  };
  elements.set(id, el);
  return el;
}
const missingIds = [];
const documentStub = {
  getElementById(id) {
    // the dashboard knows these exist; anything else we materialise so the
    // code can run, but we log it so we can see what it looks for
    return makeEl(id);
  },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  addEventListener() {},
  removeEventListener() {},
  body: makeEl('__body'),
  createElement: () => makeEl('__created'),
};
const windowStub = {
  addEventListener() {},
  removeEventListener() {},
  DASHBOARD_CONFIG: { businessName: 'Mamma & Mia Cakes And Catering' },
  location: { href: 'https://mammamiacakesandcatering.vercel.app/dashboard/index.html' },
};
const storage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };

// ── evaluate the real app.js in a function scope with our stubs ───────────
const wrapper = `
  var document = __document;
  var window = __window;
  var localStorage = __storage;
  var sessionStorage = __storage;
  var CSS = { escape: function (s) { return String(s); } };
  var fetch = function () { return Promise.reject(new Error('offline')); };
  var FormData = function () { this.append = function () {}; };
  var Event = function (t) { this.type = t; };
  var console = { log: function () {}, warn: function () {}, error: function () {} };
  var setInterval = function () { return 0; };
  var clearInterval = function () {};
  var setTimeout = function (f) { return 0; };
  var clearTimeout = function () {};
  var URLSearchParams = function () { this.append = function () {}; };
  var navigator = { userAgent: 'node' };
  var history = { replaceState() {}, pushState() {} };
  var location = window.location;

  ${src}

  return {
    switchSection: typeof switchSection === 'function' ? switchSection : null,
    isSectionEditor: typeof isSectionEditor === 'function' ? isSectionEditor : null,
    renderSectionFields: typeof renderSectionFields === 'function' ? renderSectionFields : null,
    SECTION_FIELDS: typeof SECTION_FIELDS !== 'undefined' ? SECTION_FIELDS : null,
    renderFeatureCardBody: typeof renderFeatureCardBody === 'function' ? renderFeatureCardBody : null,
    hydrateSectionView: typeof hydrateSectionView === 'function' ? hydrateSectionView : null,
    getEl: function (id) { return __document.getElementById(id); },
  };
`;

let api;
try {
  api = new Function('__document', '__window', '__storage', wrapper)(documentStub, windowStub, storage);
} catch (e) {
  console.log('*** app.js failed to evaluate in the sandbox: ' + e.message + ' ***');
  console.log(e.stack.split('\n').slice(0, 8).join('\n'));
  process.exit(1);
}
console.log('app.js evaluated OK');
console.log('  switchSection       :', typeof api.switchSection);
console.log('  isSectionEditor     :', typeof api.isSectionEditor);
console.log('  renderSectionFields :', typeof api.renderSectionFields);
console.log('  SECTION_FIELDS      :', api.SECTION_FIELDS ? Object.keys(api.SECTION_FIELDS).join(',') : 'NULL/UNDEFINED');

// ── reproduce the nav click exactly ───────────────────────────────────────
const PANELS = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];
console.log('\n=== switchSection(id) -> does #<id>Fields get populated? ===');
let bad = 0;
for (const id of PANELS) {
  const el = makeEl(id + 'Fields');
  el.innerHTML = '(EMPTY)';
  let err = null;
  try {
    api.switchSection(id);
  } catch (e) {
    err = e.message + '  @ ' + (e.stack || '').split('\n')[1];
  }
  const filled = el.innerHTML && el.innerHTML !== '(EMPTY)';
  const fields = (el.innerHTML.match(/data-feature-field=/g) || []).length;
  const adds = (el.innerHTML.match(/data-feature-add=/g) || []).length;
  const active = makeEl(id);
  console.log('  ' + id.padEnd(12) +
    (filled ? 'FILLED ' : '*** BLANK *** ') +
    'html=' + String(el.innerHTML.length).padStart(6) +
    '  fields=' + fields + ' addBtns=' + adds +
    (err ? '  ERR: ' + err : ''));
  if (!filled || err) bad++;
}

console.log('\n=== control check: an existing tab (team) still works? ===');
const teamEl = makeEl('teamList');
try {
  api.switchSection('team');
  console.log('  switchSection("team") did not throw');
} catch (e) {
  console.log('  switchSection("team") threw: ' + e.message);
}

console.log('\n' + (bad === 0 ? 'ALL PANELS POPULATE' : bad + ' PANEL(S) BLANK'));
