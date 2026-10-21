const fs = require('fs');
const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';

const SOURCES = {
  'template (local)': null, // filled below
  'LIVE mamma_mia': 'https://mammamiacakesandcatering.vercel.app/dashboard/assets/app.js',
  'LIVE missions_ablaze': 'https://missions-ablaze.sitespire.co.za/dashboard/assets/app.js',
  'LIVE tammy': 'https://tammy-s-sticker-shop.sitespire.co.za/dashboard/assets/app.js',
};
const LOCAL = WB + '/templates/dashboard/assets/app.js';

function runHarness(label, src) {
  const elements = new Map();
  function makeEl(id) {
    if (elements.has(id)) return elements.get(id);
    const el = {
      id, innerHTML: '', textContent: '', value: '', checked: false,
      style: {}, dataset: {}, files: [],
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      addEventListener() {}, removeEventListener() {}, appendChild() {},
      querySelectorAll: () => [], querySelector: () => null, closest: () => null,
      setAttribute() {}, getAttribute: () => null, dispatchEvent() {}, click() {},
    };
    elements.set(id, el);
    return el;
  }
  const documentStub = {
    getElementById: (id) => makeEl(id),
    querySelectorAll: () => [], querySelector: () => null,
    addEventListener() {}, removeEventListener() {},
    body: makeEl('__body'), createElement: () => makeEl('__created'),
  };
  const windowStub = {
    addEventListener() {}, removeEventListener() {},
    DASHBOARD_CONFIG: { businessName: 'X' },
    location: { href: '' },
  };
  const storage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };

  const wrapper = `
  var document = __document, window = __window, localStorage = __storage, sessionStorage = __storage;
  var CSS = { escape: function (s) { return String(s); } };
  var fetch = function () { return Promise.reject(new Error('offline')); };
  var FormData = function () { this.append = function () {}; };
  var Event = function (t) { this.type = t; };
  var console = { log: function () {}, warn: function () {}, error: function () {} };
  var setInterval = function () { return 0; }, clearInterval = function () {};
  var setTimeout = function () { return 0; }, clearTimeout = function () {};
  var URLSearchParams = function () { this.append = function () {}; };
  var navigator = { userAgent: 'node' }, history = { replaceState() {}, pushState() {} };
  var location = window.location;
  ${src}
  return {
    switchSection: typeof switchSection === 'function' ? switchSection : null,
    SECTION_FIELDS: typeof SECTION_FIELDS !== 'undefined' ? SECTION_FIELDS : null,
    isSectionEditor: typeof isSectionEditor === 'function' ? isSectionEditor : null,
  };
  `;

  let api;
  try {
    api = new Function('__document', '__window', '__storage', wrapper)(documentStub, windowStub, storage);
  } catch (e) {
    console.log('  ' + label.padEnd(22) + '*** EVAL FAILED: ' + e.message + ' ***');
    return 1;
  }

  const PANELS = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];
  if (!api.switchSection) { console.log('  ' + label.padEnd(22) + '*** no switchSection ***'); return 1; }
  if (!api.SECTION_FIELDS) { console.log('  ' + label.padEnd(22) + '*** no SECTION_FIELDS ***'); return 1; }

  const results = [];
  let bad = 0;
  for (const id of PANELS) {
    const el = makeEl(id + 'Fields');
    el.innerHTML = '';
    try { api.switchSection(id); } catch (e) { results.push(id + ':ERR'); bad++; continue; }
    const ok = el.innerHTML.length > 40;
    if (!ok) bad++;
    results.push(id + ':' + (ok ? el.innerHTML.length : 'BLANK'));
  }
  console.log('  ' + label.padEnd(22) + (bad === 0 ? 'ALL FILL  ' : bad + ' BLANK  ') + results.join(' '));
  return bad;
}

(async () => {
  let total = 0;
  console.log('=== sandbox: does switchSection populate the 9 panels? ===');
  total += runHarness('template (local)', fs.readFileSync(LOCAL, 'utf8'));
  for (const [label, url] of Object.entries(SOURCES)) {
    if (!url) continue;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const src = await res.text();
      console.log('  [' + label + ' fetched: HTTP ' + res.status + ', ' + src.length + ' bytes]');
      total += runHarness(label, src);
    } catch (e) {
      console.log('  ' + label.padEnd(22) + 'FETCH FAIL ' + e.message);
      total++;
    }
  }
  console.log('\n' + (total === 0 ? 'EVERY SOURCE POPULATES ALL 9 PANELS' : total + ' PROBLEM(S)'));
})();
