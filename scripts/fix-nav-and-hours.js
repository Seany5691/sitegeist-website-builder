const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const TPL_IDX = WB + '/templates/dashboard/index.html';
const TPL_APP = WB + '/templates/dashboard/assets/app.js';
const TPL_CSS = WB + '/templates/dashboard/assets/styles.css';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// ── the new sidebar order, grouped so it reads as a workflow ──────────────
const GROUPS = [
  { title: 'Overview', items: ['overview', 'leads'] },
  {
    title: 'Website content',
    items: ['hero', 'content', 'about', 'services', 'gallery', 'pricing', 'testimonials', 'team', 'blog', 'faq'],
  },
  {
    title: 'Homepage sections',
    items: ['statsBar', 'process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'video', 'vsl'],
  },
  {
    title: 'Business & setup',
    items: ['hours', 'seo', 'design-system', 'features', 'settings'],
  },
];

let idx = fs.readFileSync(TPL_IDX, 'utf8');
let app = fs.readFileSync(TPL_APP, 'utf8');
let css = fs.readFileSync(TPL_CSS, 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. Rebuild the sidebar nav: new order + group headings.
//    Always rebuilds the INNER content of <nav class="sidebar-nav">, so it is
//    idempotent and self-heals a duplicated nav from an earlier bad patch.
// ═══════════════════════════════════════════════════════════════════════════
{
  const NAV_OPEN = '<nav class="sidebar-nav">';
  const navOpenAt = idx.indexOf(NAV_OPEN);
  if (navOpenAt < 0) {
    console.log('  *** <nav class="sidebar-nav"> not found — aborting ***');
    process.exit(1);
  }
  const navContentStart = navOpenAt + NAV_OPEN.length;
  const navCloseAt = idx.indexOf('</nav>', navContentStart);
  if (navCloseAt < 0) {
    console.log('  *** </nav> not found — aborting ***');
    process.exit(1);
  }

  // capture every nav item's exact markup (class is not always plain
  // "nav-item" — overview carries "nav-item active", leads "nav-item nav-subitem")
  const itemBodies = {};
  let searchFrom = navContentStart;
  while (searchFrom < navCloseAt) {
    const aAt = idx.indexOf('<a href="#" class="nav-item', searchFrom);
    if (aAt < 0 || aAt >= navCloseAt) break;
    const closeAt = idx.indexOf('</a>', aAt) + 4;
    const body = idx.slice(aAt, closeAt);
    const idM = body.match(/data-section="([^"]+)"/);
    // first occurrence wins — a duplicate from a bad patch must not win
    if (idM && !itemBodies[idM[1]]) itemBodies[idM[1]] = body;
    searchFrom = closeAt;
  }

  const allIds = Object.keys(itemBodies);
  const wanted = GROUPS.flatMap(g => g.items);
  const missing = wanted.filter(id => !itemBodies[id]);
  const extra = allIds.filter(id => !wanted.includes(id));
  if (missing.length || extra.length) {
    console.log('  *** nav id mismatch — missing: ' + missing.join(',') + '  extra: ' + extra.join(',') + ' ***');
    console.log('       captured: ' + allIds.join(','));
    process.exit(1);
  }

  const navHtml = '\n' + GROUPS.map(g =>
    `        <div class="nav-group" data-nav-group="${g.items.join(' ')}">${g.title}</div>\n` +
    g.items.map(id => '        ' + itemBodies[id].replace(/\n\s*/g, '\n        ').trimEnd()).join('\n')
  ).join('\n') + '\n      ';

  idx = idx.slice(0, navContentStart) + navHtml + idx.slice(navCloseAt);
  fs.writeFileSync(TPL_IDX, idx, 'utf8');
  console.log('index.html  sidebar rebuilt: ' + GROUPS.length + ' groups, ' + wanted.length + ' tabs');
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Move Business Hours out of Settings into the Hours tab
// ═══════════════════════════════════════════════════════════════════════════
idx = fs.readFileSync(TPL_IDX, 'utf8');

const SETTINGS_CARD = `            <div class="settings-card">
              <h3>Business Hours</h3>
              <div class="toggle-field">
                <label class="toggle-label">
                  <input type="checkbox" id="showBusinessHoursToggle">
                  <span class="toggle-switch"></span>
                  <span class="toggle-text">Show business hours next to the contact form</span>
                </label>
              </div>
              <p class="help-text">Hours appear beside the contact form when this is on. The form centres when it is off.</p>
              <div id="businessHoursList" class="business-hours-list"></div>
              <button class="primary-btn" onclick="saveBusinessHours()">
                <i class="fas fa-save"></i><span>Save Business Hours</span>
              </button>
            </div>`;

if (!idx.includes(SETTINGS_CARD)) {
  console.log('index.html  business hours already in the Hours tab');
} else {
  // remove from Settings
  idx = idx.replace(SETTINGS_CARD + '\n', '');

  // rebuild the Hours panel
  const OLD_HOURS = idx.slice(idx.indexOf('<section id="hours"'), idx.indexOf('</section>', idx.indexOf('<section id="hours"')) + 10);
  const NEW_HOURS = `        <section id="hours" class="section">
          <div class="section-header">
            <h2>Business Hours</h2>
            <div class="section-header-actions">
              <button class="primary-btn" onclick="saveHoursTab()">
                <i class="fas fa-save"></i><span>Save Hours</span>
              </button>
            </div>
          </div>
          <p class="help-text">Set the heading that appears over your hours, and the times for each day. Visitors see this so they know when to call.</p>
          <div class="feature-card on vsl-card">
            <div class="feature-card-body" id="hoursFields">
              <!-- Heading fields populated by JS -->
            </div>
          </div>
          <div class="settings-card">
            <h3>Opening times</h3>
            <div class="toggle-field">
              <label class="toggle-label">
                <input type="checkbox" id="showBusinessHoursToggle">
                <span class="toggle-switch"></span>
                <span class="toggle-text">Show business hours next to the contact form</span>
              </label>
            </div>
            <p class="help-text">Hours appear beside the contact form when this is on. The form centres when it is off.</p>
            <div id="businessHoursList" class="business-hours-list"></div>
          </div>
          <div class="feature-save-row">
            <button type="button" class="secondary-btn feature-save-btn" onclick="saveHoursTab()">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </section>`;
  if (!idx.includes(OLD_HOURS)) {
    console.log('  *** old Hours panel not matched — aborting ***');
    process.exit(1);
  }
  idx = idx.replace(OLD_HOURS, NEW_HOURS);
  fs.writeFileSync(TPL_IDX, idx, 'utf8');
  console.log('index.html  business hours moved into the Hours tab');
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. app.js — load the times list when the Hours tab opens, one Save button
// ═══════════════════════════════════════════════════════════════════════════
if (app.includes('function saveHoursTab')) {
  console.log('app.js  saveHoursTab already present');
} else {
  const OLD_DISPATCH = `  } else if (isSectionEditor(section)) {
    harvestSectionEditors();
    hydrateSectionView(section);
    renderSectionFields(section);
  } else if (section === 'settings') {
    loadBusinessHours();
    loadLocationIdentity();`;
  const NEW_DISPATCH = `  } else if (isSectionEditor(section)) {
    harvestSectionEditors();
    hydrateSectionView(section);
    renderSectionFields(section);
    if (section === 'hours') loadBusinessHours();
  } else if (section === 'settings') {
    loadLocationIdentity();`;
  if (!app.includes(OLD_DISPATCH)) {
    console.log('  *** switchSection dispatch anchor not found ***');
    process.exit(1);
  }
  app = app.replace(OLD_DISPATCH, NEW_DISPATCH);

  const HELPER = `

/**
 * Save the whole Hours tab in one go: the section heading fields plus the
 * per-day times and the "show beside the contact form" toggle.
 */
async function saveHoursTab() {
  writeFeatureFieldsFromDom('hours');
  applySectionView('hours');
  applyBusinessHoursToggle();
  getWebsiteControls();
  const ok = await saveSiteConfig({ silent: true });
  if (ok) showToast('Hours saved — refresh the website to see it.');
}
`;
  const anchor = 'function saveBusinessHours() {';
  app = app.replace(anchor, HELPER + '\n' + anchor);
  fs.writeFileSync(TPL_APP, app, 'utf8');
  console.log('app.js  saveHoursTab added; hours tab loads the times list');
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Hide a nav group heading when every tab in it is switched off
// ═══════════════════════════════════════════════════════════════════════════
app = fs.readFileSync(TPL_APP, 'utf8');
if (app.includes('nav-group')) {
  console.log('app.js  nav-group visibility already handled');
} else {
  const ANCHOR = `  const navItems = document.querySelectorAll('.nav-item');
  let currentTabHidden = false;`;
  const ADD = `  const navItems = document.querySelectorAll('.nav-item');
  let currentTabHidden = false;`;
  // append group-hiding right after the navItems.forEach loop ends; find the loop end
  const loopStart = app.indexOf(ANCHOR);
  if (loopStart < 0) {
    console.log('  *** setupAdaptiveNavigation anchor not found ***');
  } else {
    // find "});" that closes the forEach, then insert after it
    const afterLoop = app.indexOf('  });', loopStart);
    const insertAt = afterLoop + '  });'.length;
    const GROUP_CODE = `

  // Hide a group heading when every tab inside it is switched off, so a
  // section never leaves an orphan label floating in the sidebar.
  document.querySelectorAll('.nav-group').forEach(group => {
    const ids = (group.dataset.navGroup || '').split(' ').filter(Boolean);
    const anyVisible = ids.some(id => {
      const el = document.querySelector('.nav-item[data-section="' + id + '"]');
      return el && !el.hidden && !el.classList.contains('hidden');
    });
    group.hidden = !anyVisible;
    group.classList.toggle('hidden', !anyVisible);
  });`;
    app = app.slice(0, insertAt) + GROUP_CODE + app.slice(insertAt);
    fs.writeFileSync(TPL_APP, app, 'utf8');
    console.log('app.js  empty nav groups now auto-hide');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. CSS for the group headings
// ═══════════════════════════════════════════════════════════════════════════
if (css.includes('.nav-group')) {
  console.log('styles.css  nav-group already styled');
} else {
  css += `

/* ============================================
   Sidebar group headings
   ============================================ */
.nav-group {
  margin: 1.15rem 0 0.4rem;
  padding: 0 0.85rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted, rgba(255, 255, 255, 0.42));
  user-select: none;
  pointer-events: none;
}

.nav-group:first-child {
  margin-top: 0.35rem;
}

.nav-group.hidden,
.nav-group[hidden] {
  display: none;
}
`;
  fs.writeFileSync(TPL_CSS, css, 'utf8');
  console.log('styles.css  nav-group styled');
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. verify + sync
// ═══════════════════════════════════════════════════════════════════════════
idx = fs.readFileSync(TPL_IDX, 'utf8');
app = fs.readFileSync(TPL_APP, 'utf8');
css = fs.readFileSync(TPL_CSS, 'utf8');

console.log('\n=== verify ===');
let ok = true;
function assert(cond, label) {
  console.log('  ' + label.padEnd(58) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}

assert(!/id="businessHoursList"[\s\S]{0,400}Menu Labels/.test(idx), 'business hours no longer sits in Settings');
assert(idx.indexOf('id="businessHoursList"') > idx.indexOf('<section id="hours"'), 'business hours list lives inside the Hours tab');
assert(idx.indexOf('id="businessHoursList"') < idx.indexOf('</section>', idx.indexOf('<section id="hours"')), 'hours list is inside the hours section');
assert(idx.includes('id="hoursFields"'), 'heading fields still in Hours tab');
assert(idx.includes("saveHoursTab()"), 'single Save button in Hours tab');
assert(!idx.includes('Save Business Hours'), 'old Settings save button gone');

// nav order
const order = [];
const parts = idx.split('data-section="');
for (let i = 1; i < parts.length; i++) order.push(parts[i].split('"')[0]);
const flat = GROUPS.flatMap(g => g.items);
assert(order.join(',') === flat.join(','), 'nav order matches the plan');
console.log('       actual: ' + order.join(' > '));
const groups = [];
const gp = idx.split('data-nav-group="');
for (let i = 1; i < gp.length; i++) groups.push(gp[i].split('"')[0]);
assert(groups.length === GROUPS.length, 'all ' + GROUPS.length + ' group headings present');
GROUPS.forEach((g, i) => assert(groups[i] === g.items.join(' '), 'group "' + g.title + '" lists its ' + g.items.length + ' tabs'));

assert(app.includes('function saveHoursTab'), 'saveHoursTab defined');
assert(app.includes("if (section === 'hours') loadBusinessHours();"), 'Hours tab loads the times list');
assert(app.includes('.nav-group'), 'empty nav groups auto-hide');
assert(css.includes('.nav-group'), 'nav-group styled');

// every id still present exactly once
for (const id of flat) {
  const count = order.filter(x => x === id).length;
  if (count !== 1) { console.log('  *** id ' + id + ' appears ' + count + ' times ***'); ok = false; }
}

console.log('\n=== sync to 3 sites ===');
const DASH = [
  ['templates/dashboard/index.html', 'public/dashboard/index.html'],
  ['templates/dashboard/assets/app.js', 'public/dashboard/assets/app.js'],
  ['templates/dashboard/assets/styles.css', 'public/dashboard/assets/styles.css'],
];
for (const s of SITES) {
  for (const [srcRel, destRel] of DASH) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(32) + (match ? 'OK' : '*** MISMATCH ***'));
  }
  const cfg = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/assets/config.js', 'utf8');
  const ph = (cfg.match(/\{\{[A-Z_]+\}\}/g) || []).length;
  const bn = (cfg.match(/businessName:\s*"([^"]*)"/) || [])[1];
  console.log('  ' + s.padEnd(32) + 'config.js  businessName="' + bn + '" placeholders=' + ph);
  if (ph > 0) ok = false;
}

console.log('\n' + (ok ? 'NAV REORDER + HOURS MOVE COMPLETE' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
