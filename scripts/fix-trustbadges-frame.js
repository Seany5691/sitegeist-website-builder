const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js'
let t = fs.readFileSync(p, 'utf8')

console.log('=== 1. Add showFrame toggle to trustBadges fields ===')
{
  const anchor = `    trustBadges: [
      { key: 'title', label: 'Section title', type: 'text' },`
  const replacement = `    trustBadges: [
      { key: 'title', label: 'Section title', type: 'text' },
      { key: 'showFrame', label: 'Show a frame around each logo', type: 'toggle', hint: 'Turn this off to show just the logos with no boxes — every logo stays the same size.' },`
  if (t.includes(anchor)) {
    t = t.split(anchor).join(replacement)
    console.log('  showFrame toggle added')
  } else {
    console.log('  trustBadges anchor not found')
    const i = t.indexOf('trustBadges: [')
    if (i >= 0) console.log(t.slice(i, i + 220))
  }
}

console.log('')
console.log('=== 2. Feature toggles for inline sections write to controls.sections ===')
{
  // These three are ORDERABLE SECTIONS. Their visibility flag lives in
  // controls.sections so Website Control and the Features tab stay in sync.
  const anchor = `  const toggle = e.target.closest('[data-feature-toggle]');
  if (toggle) {
    const key = toggle.dataset.featureToggle;
    const controls = getWebsiteControls();
    controls.features[key] = !!toggle.checked;
    renderFeatureCards();`
  const replacement = `  const toggle = e.target.closest('[data-feature-toggle]');
  if (toggle) {
    const key = toggle.dataset.featureToggle;
    const controls = getWebsiteControls();
    // Trust Badges / Areas / Before-After are ORDERABLE SECTIONS — their
    // visibility flag lives in controls.sections so the Features tab toggle
    // and the Website Control switch stay in sync (and reordering works).
    const SECTION_FEATURE_KEY = {
      trustBadges: 'trustBadges',
      areasServedStrip: 'serviceAreas',
      beforeAfter: 'beforeAfter',
    };
    const sectionKey = SECTION_FEATURE_KEY[key];
    if (sectionKey) {
      controls.sections[sectionKey] = !!toggle.checked;
    } else {
      controls.features[key] = !!toggle.checked;
    }
    renderFeatureCards();`
  if (t.includes(anchor)) {
    t = t.split(anchor).join(replacement)
    console.log('  section-feature toggle mapping added')
  } else {
    console.log('  feature toggle anchor not found')
    const i = t.indexOf('data-feature-toggle')
    if (i >= 0) console.log(t.slice(i, i + 400))
  }
}

console.log('')
console.log('=== 3. Feature cards read the right flag for inline sections ===')
{
  // renderFeatureCards uses controls.features[f.id] === true. For the three
  // section-backed features it must read controls.sections.
  const anchor = `  grid.innerHTML = FEATURE_DEFS.map(f => {
      const on = controls.features[f.id] === true;`
  const replacement = `  grid.innerHTML = FEATURE_DEFS.map(f => {
      const SECTION_FEATURE_KEY = { trustBadges: 'trustBadges', areasServedStrip: 'serviceAreas', beforeAfter: 'beforeAfter' };
      const sk = SECTION_FEATURE_KEY[f.id];
      const on = sk ? controls.sections[sk] === true : controls.features[f.id] === true;`
  if (t.includes(anchor)) {
    t = t.split(anchor).join(replacement)
    console.log('  card flag read updated')
  } else {
    console.log('  renderFeatureCards anchor not found')
    const i = t.indexOf('FEATURE_DEFS.map(f =>')
    if (i >= 0) console.log(t.slice(i, i + 220))
  }
}

fs.writeFileSync(p, t, 'utf8')
console.log('')
console.log('written')
