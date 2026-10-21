const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';

const reg = fs.readFileSync(ROOT + '/templates/backend/lib/section-registry.ts', 'utf8');
const sr = fs.readFileSync(ROOT + '/templates/backend/components/SectionRenderer.tsx', 'utf8');
const app = fs.readFileSync(ROOT + '/templates/dashboard/assets/app.js', 'utf8');
const idx = fs.readFileSync(ROOT + '/templates/dashboard/index.html', 'utf8');
const bw = fs.readFileSync(ROOT + '/app/api/build-website/route.ts', 'utf8');

// Parse every registry entry properly
const entries = [];
const re = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)',\s*component:\s*'([^']+)'([\s\S]*?)\n\s*\}/g;
let m;
while ((m = re.exec(reg)) !== null) {
  const body = m[4];
  const kind = (body.match(/kind:\s*'([^']+)'/) || [])[1] || '?';
  const tab = (body.match(/dashboardTab:\s*'([^']+)'/) || [])[1] || (body.match(/dashboardTab:\s*null/) ? 'null' : '?');
  const req = (body.match(/requiresContent:\s*'([^']+)'/) || [])[1] || '';
  const def = (body.match(/defaultOn:\s*(true|false)/) || [])[1] || '?';
  entries.push({ id: m[1], label: m[2], component: m[3], kind, tab, req, def });
}

console.log('=== ALL registry entries (' + entries.length + ') ===');
for (const e of entries) {
  // component file search across templates/components/**/<component>.tsx
  let file = null;
  const dirs = fs.readdirSync(ROOT + '/templates/components', { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
  for (const d of dirs) {
    const p = ROOT + '/templates/components/' + d + '/' + e.component + '.tsx';
    if (fs.existsSync(p)) { file = 'components/' + d + '/' + e.component + '.tsx'; break; }
  }
  if (!file) {
    // flat?
    const p = ROOT + '/templates/components/' + e.component + '.tsx';
    if (fs.existsSync(p)) file = 'components/' + e.component + '.tsx';
  }
  // renderer map
  const mapped = new RegExp('\\b' + e.component + '\\s*:').test(sr);
  // dashboard panel
  const panel = idx.includes('id="' + e.id + '"') ? 'panel' : 'NO-PANEL';
  // nav tab
  const navTab = idx.includes('data-section="' + e.id + '"') ? 'nav' : 'no-nav';
  // sectionTabs (auto-hide)
  const st = app.match(/const sectionTabs = \{([\s\S]*?)\};/);
  const inAuto = st ? st[1].includes(e.id + ':') : false;

  const flags = [
    file ? 'file' : 'NO-FILE',
    mapped ? 'rendered' : 'NOT-RENDERED',
    panel,
    navTab,
    inAuto ? 'autohide' : 'no-autohide'
  ];
  console.log('  ' + e.id.padEnd(14) + e.component.padEnd(18) + e.kind.padEnd(8) + 'tab=' + e.tab.padEnd(12) + flags.join(' | ') + (file ? '  ' + file : ''));
}

console.log('\n=== CONTROL_SECTIONS (dashboard switchboard) ===');
const cs = app.match(/const CONTROL_SECTIONS = \[([\s\S]*?)\];/);
const csIds = [];
if (cs) {
  const re2 = /id: '([^']+)',\s*label: '([^']+)'/g;
  while ((m = re2.exec(cs[1])) !== null) csIds.push({ id: m[1], label: m[2] });
}
for (const c of csIds) {
  const inReg = entries.find(e => e.id === c.id);
  // also try alias matches
  console.log('  ' + c.id.padEnd(14) + c.label.padEnd(32) + (inReg ? 'registry:' + inReg.component : '*** NOT IN REGISTRY ***'));
}

console.log('\n=== registry ids NOT in CONTROL_SECTIONS ===');
for (const e of entries) {
  if (!csIds.find(c => c.id === e.id)) console.log('  ' + e.id + ' (' + e.component + ')');
}

console.log('\n=== copyControlSystemFolders ===');
const cm = bw.match(/controlSystemFolders\s*=\s*\[([\s\S]*?)\]/);
console.log('  ' + (cm ? cm[1].replace(/\s+/g, ' ').trim() : 'NOT FOUND'));

console.log('\n=== all .tsx under templates/components (families) ===');
const dirs = fs.readdirSync(ROOT + '/templates/components', { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);
for (const d of dirs) {
  const files = fs.readdirSync(ROOT + '/templates/components/' + d).filter(f => f.endsWith('.tsx'));
  console.log('  ' + d + '/: ' + files.map(f => f.replace('.tsx', '')).join(', '));
}

console.log('\n=== Team section alignment (single-member) ===');
const teamDirs = dirs.filter(d => d.includes('team'));
for (const d of teamDirs) {
  const files = fs.readdirSync(ROOT + '/templates/components/' + d).filter(f => f.endsWith('.tsx'));
  for (const f of files) {
    const src = fs.readFileSync(ROOT + '/templates/components/' + d + '/' + f, 'utf8');
    const grid = src.match(/grid-cols[^\s"']*/g) || [];
    const justify = src.match(/justify-(start|center|end)/g) || [];
    const cols = src.match(/grid-cols-[^"'\s]*/g) || [];
    console.log('  ' + d + '/' + f + '  cols=' + [...new Set(cols)].join(',') + '  justify=' + [...new Set(justify)].join(','));
  }
}

console.log('\n=== Menu Labels fields in index.html ===');
const ml = idx.match(/Menu Labels[\s\S]{0,2500}/);
if (ml) {
  const labels = [...ml[0].matchAll(/data-(?:nav|field)[a-zA-Z-]*=\"([a-zA-Z]+)\"/g)].map(x => x[1]);
  const keys = [...ml[0].matchAll(/name=\"(nav[A-Za-z]+)\"/g)].map(x => x[1]);
  console.log('  nav keys: ' + keys.join(', '));
}

console.log('\n=== siteNavLinks in control-flags.ts ===');
const cf = fs.readFileSync(ROOT + '/templates/backend/lib/control-flags.ts', 'utf8');
const sl = cf.match(/export function siteNavLinks[\s\S]*?\n\}/);
if (sl) console.log(sl[0]);
