const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js'
let t = fs.readFileSync(p, 'utf8')

// 1. Feature toggle -> auto-save
const FEAT_OLD = `  const toggle = e.target.closest('[data-feature-toggle]');
  if (toggle) {
    const key = toggle.dataset.featureToggle;
    const controls = getWebsiteControls();
    controls.features[key] = !!toggle.checked;
    markDirty();
    renderFeatureCards();
    return;
  }`
const FEAT_NEW = `  const toggle = e.target.closest('[data-feature-toggle]');
  if (toggle) {
    const key = toggle.dataset.featureToggle;
    const controls = getWebsiteControls();
    controls.features[key] = !!toggle.checked;
    renderFeatureCards();
    // Save immediately so the live site reflects the change without a separate
    // Save click — this is the #1 reason features "did nothing".
    saveSiteConfig().then(ok => {
      if (ok) showToast(toggle.checked ? 'Feature enabled — refresh the website to see it.' : 'Feature disabled.');
    });
    return;
  }`

if (t.includes(FEAT_OLD)) {
  t = t.split(FEAT_OLD).join(FEAT_NEW)
  console.log('feature toggle -> auto-save')
} else {
  console.log('feature toggle block NOT matched')
}

// 2. Section/page toggle -> auto-save
const CTRL_OLD = `  controls[type][id] = !!input.checked;
  markDirty();
  setupAdaptiveNavigation();
}`
const CTRL_NEW = `  controls[type][id] = !!input.checked;
  setupAdaptiveNavigation();
  // Save immediately so the website and sidebar tabs update without a
  // separate Save click.
  saveSiteConfig().then(ok => {
    if (ok) showToast(input.checked ? 'Turned on — refresh the website to see it.' : 'Turned off.');
  });
}`

if (t.includes(CTRL_OLD)) {
  t = t.split(CTRL_OLD).join(CTRL_NEW)
  console.log('control toggle -> auto-save')
} else {
  console.log('control toggle block NOT matched')
}

fs.writeFileSync(p, t, 'utf8')
console.log('written')
