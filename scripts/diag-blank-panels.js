const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');

const NEW_PANELS = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];

// ── 1. duplicate ids ──────────────────────────────────────────────────────
console.log('=== duplicate id attributes in index.html ===');
const ids = [];
const re = /\sid="([^"]+)"/g;
let m;
while ((m = re.exec(idx)) !== null) ids.push({ id: m[1], at: m.index });
const counts = {};
ids.forEach(x => { counts[x.id] = (counts[x.id] || 0) + 1; });
let dups = 0;
for (const [id, n] of Object.entries(counts)) {
  if (n > 1) {
    dups++;
    console.log('  *** "' + id + '" appears ' + n + ' times ***');
  }
}
console.log('  total ids: ' + ids.length + ', duplicates: ' + dups);

// ── 2. nesting of the 9 panels ────────────────────────────────────────────
console.log('\n=== panel nesting: is each <section id="X" class="section"> inside the main sections container? ===');
// find the container: the div that holds <section id="overview" ...
const overviewAt = idx.indexOf('id="overview"');
const containerOpen = idx.lastIndexOf('<div', overviewAt);
console.log('  overview at ' + overviewAt + ', preceding <div at ' + containerOpen);
console.log('  context: ' + JSON.stringify(idx.slice(containerOpen, containerOpen + 120)));

for (const id of NEW_PANELS) {
  const at = idx.indexOf('<section id="' + id + '"');
  const fieldsAt = idx.indexOf('id="' + id + 'Fields"');
  // count open/close of section + div between containerOpen and at
  const seg = idx.slice(containerOpen, at);
  const openDivs = (seg.match(/<div\b/g) || []).length;
  const closeDivs = (seg.match(/<\/div>/g) || []).length;
  const openSections = (seg.match(/<section\b/g) || []).length;
  const closeSections = (seg.match(/<\/section>/g) || []).length;
  const netDiv = openDivs - closeDivs;
  const netSection = openSections - closeSections;
  console.log('  ' + id.padEnd(12) + 'panelAt=' + String(at).padEnd(7) + ' fieldsAt=' + String(fieldsAt).padEnd(7) + ' netDiv=' + netDiv + ' netSection=' + netSection + (netSection === 1 ? '' : '   *** NESTING SUSPECT ***'));
}

// ── 3. where does the sections container close? ───────────────────────────
console.log('\n=== the region where panels were inserted ===');
const vslEnd = idx.indexOf('</section>', idx.indexOf('id="vsl"'));
console.log('  ...from just before VSL close to +900 chars:');
console.log(idx.slice(Math.max(0, vslEnd - 200), vslEnd + 900));

// ── 4. CSS for .section / .section.active ─────────────────────────────────
console.log('\n=== CSS: .section rules ===');
const css = fs.readFileSync(P + '/assets/styles.css', 'utf8');
const cssRe = /(^|\n)\s*\.section[^,{]*\{[^}]*\}/g;
let c;
while ((c = cssRe.exec(css)) !== null) {
  const t = c[0].trim().replace(/\s+/g, ' ');
  if (t.length < 300) console.log('  ' + t);
}

console.log('\n=== CSS: .dashboard-section / .feature-card-body / .vsl-card ===');
for (const sel of ['.dashboard-section', '.feature-card-body', '.vsl-card', '.section-header', '.feature-card ']) {
  const i = css.indexOf(sel);
  if (i < 0) { console.log('  ' + sel + ' : NOT FOUND'); continue; }
  console.log('  ' + sel + ' : ' + css.slice(i, i + 220).replace(/\s+/g, ' ').slice(0, 200));
}

// ── 5. is there a separate demo dashboard in the Website Builder app? ─────
console.log('\n=== other dashboard copies under Website Builder ===');
const { execSync } = require('child_process');
try {
  const out = execSync('cmd /c dir /s /b "C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Website Builder\\index.html"', { encoding: 'utf8' });
  out.split('\n').filter(Boolean).forEach(l => console.log('  ' + l.trim()));
} catch (e) {
  console.log('  (none found)');
}
