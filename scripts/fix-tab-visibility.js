const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js'
let t = fs.readFileSync(p, 'utf8')

const OLD = `  navItems.forEach(item => {
    const section = item.dataset.section;
    let shouldShow = true;

    // Template-level feature switch (DASHBOARD_CONFIG.features) still hard-disables a tab
    if (features[section] === false) {
      shouldShow = false;
    } else if (alwaysVisible.includes(section)) {
      shouldShow = true;
    } else {
      const controlKey = Object.keys(sectionTabs).find(k => sectionTabs[k] === section);
      if (controlKey) {
        shouldShow = controls.sections[controlKey] !== false;
      } else {
        shouldShow = true;
      }
    }`

const NEW = `  navItems.forEach(item => {
    const section = item.dataset.section;
    let shouldShow = true;

    if (alwaysVisible.includes(section)) {
      shouldShow = true;
    } else {
      // The client's Website Control switch always wins over the build-time
      // DASHBOARD_CONFIG flag — otherwise turning Team/Blog on in Settings
      // would never reveal the tab.
      const controlKey = Object.keys(sectionTabs).find(k => sectionTabs[k] === section);
      const hasControl = controlKey && typeof controls.sections[controlKey] === 'boolean';
      if (hasControl) {
        shouldShow = controls.sections[controlKey] === true;
      } else if (features[section] === false) {
        shouldShow = false;
      } else {
        shouldShow = true;
      }
    }`

if (t.includes(OLD)) {
  t = t.split(OLD).join(NEW)
  fs.writeFileSync(p, t, 'utf8')
  console.log('FIX 1 applied: control switchboard wins over template hard-disable')
} else {
  console.log('FIX 1 STILL not matched')
}
