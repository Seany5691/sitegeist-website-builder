const fs = require('fs');
const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';
const ds = fs.readFileSync(WB + '/lib/design-seed.ts', 'utf8');
const it = fs.readFileSync(WB + '/lib/industry-templates.ts', 'utf8');

console.log('=== design-seed.ts: option lists (first 260 lines) ===');
console.log(ds.slice(0, 6200));

console.log('\n\n=== INDUSTRY_ARCHETYPES top-level entries ===');
// top-level archetypes: id + name + keywords, at the start of the array
const i = it.indexOf('INDUSTRY_ARCHETYPES');
const seg = it.slice(i, i + 200);
console.log('decl at', i, ':', seg.slice(0, 120));
// find each top-level object's id/name pair by scanning for "  {\n    id: 'x',\n    name: 'Y'"
const re = /\{\s*\n\s*id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'/g;
let m; const found = [];
while ((m = re.exec(it)) !== null) found.push({ id: m[1], name: m[2], at: m.index });
console.log('candidate archetype objects: ' + found.length);
found.forEach(f => console.log('  ' + f.id.padEnd(20) + f.name));

console.log('\n=== getIndustryColorPalette signature + palettes ===');
const g = it.indexOf('export function getIndustryColorPalette');
console.log(it.slice(g, g + 1400));

console.log('\n=== getDesignSeedInstructions (what MiMo is told) ===');
const h = ds.indexOf('export function getDesignSeedInstructions');
console.log(ds.slice(h, h + 2200));
