const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const cssPath = P + '/assets/styles.css';
const idxPath = P + '/index.html';

// ── 1. CSS for the Menu Labels "In menu" rows ───────────────────────────────
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('.menu-anchor-row')) {
  console.log('styles.css  already patched — skipped');
} else {
  css += `

/* ============================================
   Menu Labels — homepage-section anchor rows
   ============================================ */
.menu-anchor-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-anchor-row > input[type="text"] {
  flex: 1 1 auto;
  min-width: 0;
}

.menu-anchor-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.12));
  background: var(--bg-dark, #f7f7f8);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: border-color 160ms ease, background 160ms ease;
}

.menu-anchor-toggle:hover {
  border-color: var(--primary, #0ea5e9);
}

.menu-anchor-toggle input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--primary, #0ea5e9);
  cursor: pointer;
  margin: 0;
}

.menu-anchor-toggle span {
  line-height: 1;
}

/* Compact the 9 section-anchor fields so the Menu Labels card stays scannable */
.menu-anchor-field {
  margin-bottom: 10px;
}

.menu-anchor-field > label {
  font-size: 12px;
  opacity: 0.85;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('styles.css  patched  ' + css.length + ' bytes');
}

// ── 2. Bump the cache-buster — PRECISELY, never dropping the filename ───────
// The previous bump regex ate "styles.css" and produced assets/=9.0 (404, blank UI).
// Match the FULL "assets/<name>?v=<n>" token and rewrite only the version number.
let idx = fs.readFileSync(idxPath, 'utf8');
const before = idx.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
console.log('asset refs before: ' + JSON.stringify(before));

const cur = (before[0] || '').match(/\?v=([0-9.]+)/);
const curV = cur ? parseFloat(cur[1]) : 0;
const nextV = (Math.floor(curV) + 1).toFixed(1);
idx = idx.replace(/(assets\/[A-Za-z0-9._-]+\?v=)[0-9.]+/g, '$1' + nextV);
fs.writeFileSync(idxPath, idx, 'utf8');

const after = fs.readFileSync(idxPath, 'utf8').match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
console.log('asset refs after : ' + JSON.stringify(after));

// Hard assertions — this exact bug blanked the whole dashboard last time
const broken = (after.length !== 3) || after.some(r => !/^assets\/(styles\.css|app\.js|config\.js)\?v=[0-9.]+$/.test(r));
if (broken) {
  console.log('*** ASSET REF REPAIR FAILED — do not deploy ***');
  process.exit(1);
}
console.log('All 3 asset refs well-formed. Cache-buster -> v' + nextV);
