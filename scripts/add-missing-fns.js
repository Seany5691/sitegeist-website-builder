const fs = require('fs')
const path = require('path')

const MISSING_FNS = `
// ============================================
// UTILITY: HTML ESCAPING
// ============================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  if (str == null) return '';
  return String(str).replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'").replace(/"/g, '\\\\"').replace(/\\n/g, '\\\\n');
}

// ============================================
// PROMPT MODAL
// ============================================
function showPrompt(message, title, defaultValue, label) {
  return new Promise((resolve) => {
    const modal = document.getElementById('promptModal');
    if (!modal) { resolve(defaultValue || ''); return; }
    const msgEl = document.getElementById('promptMessage');
    const inputEl = document.getElementById('promptInput');
    const okBtn = document.getElementById('promptOk');
    const cancelBtn = document.getElementById('promptCancel');
    const titleEl = document.getElementById('promptTitle');
    if (titleEl && title) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message || '';
    if (inputEl) inputEl.value = defaultValue || '';
    if (label) {
      const labelEl = document.getElementById('promptLabel');
      if (labelEl) labelEl.textContent = label;
    }
    modal.classList.remove('hidden');

    const handleOk = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      resolve(inputEl ? inputEl.value : defaultValue || '');
    };
    const handleCancel = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      resolve(null);
    };
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
  });
}
`

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

for (const site of SITES) {
  const name = site.split('/').pop()
  const p = path.join(site, 'public', 'dashboard', 'assets', 'app.js')
  if (!fs.existsSync(p)) continue

  let app = fs.readFileSync(p, 'utf8')
  const before = app

  if (!app.includes('function escapeHtml')) {
    // Insert before the DOMContentLoaded handler
    const anchor = "document.addEventListener('DOMContentLoaded'"
    const anchorIdx = app.indexOf(anchor)
    if (anchorIdx > -1) {
      app = app.slice(0, anchorIdx) + MISSING_FNS + '\n' + app.slice(anchorIdx)
    }
  }

  if (app !== before) {
    fs.writeFileSync(p, app)
    try {
      new Function(app)
      const lineCount = app.split('\n').length
      console.log(name + ': FIXED + VALID (' + lineCount + ' lines)')
    } catch (e) {
      console.log(name + ': ERROR - ' + e.message)
    }
  } else {
    console.log(name + ': no changes')
  }
}

// Sync WB
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js', src)
console.log('WB: synced')
console.log('Done.')
