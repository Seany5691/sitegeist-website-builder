const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idxPath = P + '/index.html';
const appPath = P + '/assets/app.js';

// id | label | placeholder/default | showInMenu key
const ANCHORS = [
  ['navProcess', 'Process', 'Process', 'process'],
  ['navLatestWork', 'Latest Work', 'Latest Work', 'latestWork'],
  ['navPartners', 'Partners', 'Partners', 'partners'],
  ['navAwards', 'Awards', 'Awards', 'awards'],
  ['navSocial', 'Social', 'Social', 'instagram'],
  ['navNewsletter', 'Newsletter', 'Newsletter', 'newsletter'],
  ['navStats', 'Stats', 'Stats', 'statsBar'],
  ['navVideo', 'Video', 'Video', 'video'],
  ['navHours', 'Hours', 'Hours', 'hours'],
];

// ── 1. index.html — insert the section-anchor block before Save Menu Labels ──
let idx = fs.readFileSync(idxPath, 'utf8');
if (idx.includes('id="navProcess"')) {
  console.log('index.html  already patched — skipped');
} else {
  const anchor = `              <div class="editor-field">
                <label>Areas</label>
                <input type="text" id="navAreas" placeholder="Areas">
              </div>
              <button class="secondary-btn" onclick="saveNavigation()">`;
  if (!idx.includes(anchor)) throw new Error('index.html anchor not found');
  const rows = ANCHORS.map(([id, label, def, key]) => `              <div class="editor-field menu-anchor-field">
                <label>${label}</label>
                <div class="menu-anchor-row">
                  <input type="text" id="${id}" placeholder="${def}">
                  <label class="menu-anchor-toggle" title="Add ${label} to the website menu">
                    <input type="checkbox" id="showInMenu_${key}">
                    <span>In menu</span>
                  </label>
                </div>
              </div>`).join('\n');
  const insert = `              <div class="editor-field">
                <label>Areas</label>
                <input type="text" id="navAreas" placeholder="Areas">
              </div>
              <p class="help-text">Homepage sections in the menu. Tick <strong>In menu</strong> and that section becomes a menu item that jumps to it on the home page. It only shows if the section itself is switched on under Website Control.</p>
${rows}
              <button class="secondary-btn" onclick="saveNavigation()">`;
  idx = idx.replace(anchor, insert);
  fs.writeFileSync(idxPath, idx, 'utf8');
  console.log('index.html  patched  ' + idx.length + ' bytes');
}

// ── 2. app.js — hydrate the new fields on load ──────────────────────────────
let app = fs.readFileSync(appPath, 'utf8');

const hydAnchor = `      document.getElementById('navAreas').value = nav.areas || 'Areas';
    }`;
if (app.includes("getElementById('navProcess')")) {
  console.log('app.js hydration  already patched — skipped');
} else {
  if (!app.includes(hydAnchor)) throw new Error('app.js hydration anchor not found');
  const hydRows = ANCHORS.map(([id, , def, key]) =>
    `      document.getElementById('${id}').value = nav.${id} || '${def}';`
  ).join('\n');
  const menuRows = ANCHORS.map(([, , , key]) =>
    `      const sim_${key} = document.getElementById('showInMenu_${key}');\n      if (sim_${key}) sim_${key}.checked = showInMenu.${key} === true;`
  ).join('\n');
  const hydInsert = `      document.getElementById('navAreas').value = nav.areas || 'Areas';
${hydRows}
      const showInMenu = nav.showInMenu || {};
${menuRows}
    }`;
  app = app.replace(hydAnchor, hydInsert);
  console.log('app.js hydration  patched');
}

// ── 3. app.js — write the new keys in applyNavigationFields ─────────────────
const apAnchor = `    areas: navLabel('navAreas', 'Areas'),
  };
}`;
if (app.includes('navProcess:')) {
  console.log('app.js applyNavigationFields  already patched — skipped');
} else {
  if (!app.includes(apAnchor)) throw new Error('app.js applyNavigationFields anchor not found');
  const labelRows = ANCHORS.map(([id, , def]) =>
    `    ${id}: navLabel('${id}', '${def}'),`
  ).join('\n');
  const menuObj = ANCHORS.map(([, , , key]) => {
    const el = `document.getElementById('showInMenu_${key}')`;
    return `      ${key}: ${el} ? ${el}.checked === true : (prevShowInMenu.${key} === true),`;
  }).join('\n');
  const apInsert = `    areas: navLabel('navAreas', 'Areas'),
${labelRows}
  };
  // Homepage-section menu toggles. PRESERVE keys we do not render so a partial
  // form can never silently drop another section's menu setting.
  const prevShowInMenu = (siteConfig.navigation && siteConfig.navigation.showInMenu) || {};
  siteConfig.navigation.showInMenu = {
${menuObj}
  };
}`;
  app = app.replace(apAnchor, apInsert);
  console.log('app.js applyNavigationFields  patched');
}

fs.writeFileSync(appPath, app, 'utf8');

// ── verify ─────────────────────────────────────────────────────────────────
console.log('\n=== verify ===');
const idx2 = fs.readFileSync(idxPath, 'utf8');
const app2 = fs.readFileSync(appPath, 'utf8');
for (const [id, , , key] of ANCHORS) {
  console.log('  ' + id.padEnd(18) +
    (idx2.includes('id="' + id + '"') ? 'html' : 'NO-HTML') + ' | ' +
    (idx2.includes('id="showInMenu_' + key + '"') ? 'toggle' : 'NO-TOGGLE') + ' | ' +
    (app2.includes("getElementById('" + id + "')") ? 'hydrate' : 'NO-HYD') + ' | ' +
    (app2.includes(id + ': navLabel') ? 'save' : 'NO-SAVE'));
}
console.log('  showInMenu written: ' + (app2.includes('showInMenu =') ? 'yes' : '*** NO ***'));
console.log('  keys match SECTION_NAV_ANCHORS labelKey: ' + (app2.includes('navProcess') && app2.includes('navHours') ? 'yes' : '*** NO ***'));
