const fs = require('fs');
const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';
const bw = fs.readFileSync(WB + '/app/api/build-website/route.ts', 'utf8');
const reg = fs.readFileSync(WB + '/templates/backend/lib/section-registry.ts', 'utf8');
const fr = fs.readFileSync(WB + '/templates/backend/lib/feature-registry.ts', 'utf8');
const sr = fs.readFileSync(WB + '/templates/backend/components/SectionRenderer.tsx', 'utf8');

console.log('=== copyControlSystemFolders + surrounding copy logic ===');
const i = bw.indexOf('controlSystemFolders');
console.log(bw.slice(Math.max(0, i - 1500), i + 2500));

console.log('\n\n=== SECTION_COMPONENTS import paths ===');
const re = /(\w+)\s*:\s*dynamic\(\(\)\s*=>\s*import\('([^']+)'\)/g;
let m;
const imports = [];
while ((m = re.exec(sr)) !== null) imports.push({ name: m[1], path: m[2] });
for (const im of imports) console.log('  ' + im.name.padEnd(20) + im.path);

console.log('\n=== resolve every section component to a real file ===');
const needed = new Set();
// from registry
const rre = /component:\s*'([^']+)'/g;
const comps = new Set();
while ((m = rre.exec(reg)) !== null) comps.add(m[1]);
// from SECTION_COMPONENTS imports
for (const im of imports) {
  // @/components/gallery/LatestWork -> templates/components/gallery/LatestWork.tsx
  const rel = im.path.replace('@/', '');
  const t = WB + '/templates/' + rel + '.tsx';
  const t2 = WB + '/templates/backend/' + rel + '.tsx';
  const ok = fs.existsSync(t) || fs.existsSync(t2);
  console.log('  ' + (im.name + ' -> ' + im.path).padEnd(52) + (ok ? 'RESOLVES' : '*** MISSING ***') + '  (' + (fs.existsSync(t) ? 'components/' : 'backend/') + rel + '.tsx)');
  needed.add(rel.split('/').slice(0, 1).join('/')); // family folder
  if (rel.includes('/')) needed.add(rel.split('/')[0] === 'components' ? rel.split('/')[1] : rel.split('/')[0]);
}

console.log('\n=== feature-registry component paths ===');
const fre = /component:\s*'([^']+)'/g;
while ((m = fre.exec(fr)) !== null) {
  const c = m[1];
  const candidates = [
    WB + '/templates/components/features/' + c + '.tsx',
    WB + '/templates/components/' + c + '.tsx',
    WB + '/templates/backend/components/' + c + '.tsx'
  ];
  const hit = candidates.find(p => fs.existsSync(p));
  console.log('  ' + c.padEnd(22) + (hit ? hit.replace(WB + '/templates/', '') : '*** MISSING ***'));
}

console.log('\n=== all component family folders vs the ship list ===');
const dirs = fs.readdirSync(WB + '/templates/components', { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);
const cm = bw.match(/controlSystemFolders\s*=\s*\[([\s\S]*?)\]/);
const ship = cm ? [...cm[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
console.log('  ship list: ' + ship.join(', '));
console.log('');
for (const d of dirs) {
  const inShip = ship.includes(d);
  console.log('  ' + d.padEnd(16) + (inShip ? 'SHIPPED' : 'not in ship list'));
}
