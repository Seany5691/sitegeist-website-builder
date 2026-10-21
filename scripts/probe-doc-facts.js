const fs = require('fs');
const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';

function read(p) { try { return fs.readFileSync(WB + '/' + p, 'utf8'); } catch (e) { return null; } }

console.log('=== archetype / industry template modules present? ===');
for (const f of ['lib/industry-templates.ts', 'lib/design-seed.ts', 'lib/component-selector.ts', 'lib/creative-brief.ts', 'archetype-map.json', 'types/site-config.ts', 'lib/logo-engine.ts', 'lib/boilerplate-generator.ts', 'lib/prompt-builder.ts']) {
  const s = read(f);
  console.log('  ' + f.padEnd(38) + (s ? s.split('\n').length + ' lines' : 'MISSING'));
}

console.log('\n=== INDUSTRY_ARCHETYPES ids + names ===');
const it = read('lib/industry-templates.ts') || '';
const arch = [...it.matchAll(/id:\s*'([^']+)',\s*\n?\s*name:\s*'([^']+)'/g)];
console.log('  found ' + arch.length);
arch.slice(0, 40).forEach(m => console.log('   ' + m[1].padEnd(18) + m[2]));

console.log('\n=== design-seed: what it decides ===');
const ds = read('lib/design-seed.ts') || '';
for (const k of ['artDirection', 'layoutStyle', 'typographyPairing', 'motionIntensity', 'colorIntensity', 'decorativeIntensity', 'spacingScale', 'cardGeometry', 'imageTreatment', 'generateDesignSeed', 'getDesignSeedInstructions', 'getArchetypeConstraintKey']) {
  const i = ds.indexOf(k);
  console.log('  ' + k.padEnd(26) + (i >= 0 ? 'present at ' + i : 'MISSING'));
}

console.log('\n=== design-seed option values ===');
for (const name of ['ART_DIRECTIONS', 'LAYOUT_STYLES', 'TYPOGRAPHY_PAIRINGS', 'CARD_GEOMETRIES', 'IMAGE_TREATMENTS', 'MOTION_LEVELS', 'COLOR_INTENSITIES', 'DECORATIVE_LEVELS', 'SPACING_SCALES']) {
  const m = ds.match(new RegExp('const ' + name + '[^=]*=\\s*\\[([^\\]]*)\\]', 's'));
  if (m) console.log('  ' + name.padEnd(22) + m[1].replace(/\s+/g, ' ').trim().slice(0, 220));
  else {
    const m2 = ds.match(new RegExp(name + '\\s*[:=][^\\n]{0,300}'));
    console.log('  ' + name.padEnd(22) + (m2 ? m2[0].replace(/\s+/g, ' ').slice(0, 200) : '(not found as array)'));
  }
}

console.log('\n=== colour priority / palette resolution ===');
for (const k of ['logoSource', 'color-extractor', 'theme.palette', 'getIndustryColorPalette', 'isDefaultColors', 'palette.primary']) {
  const hits = [];
  for (const f of ['lib/design-seed.ts', 'lib/industry-templates.ts', 'lib/boilerplate-generator.ts', 'lib/prompt-builder.ts', 'lib/logo-engine.ts']) {
    const s = read(f);
    if (s && s.includes(k)) hits.push(f.split('/').pop());
  }
  console.log('  ' + k.padEnd(24) + (hits.length ? hits.join(', ') : '(none)'));
}

console.log('\n=== component families (variants per family) ===');
const comps = WB + '/templates/components';
fs.readdirSync(comps, { withFileTypes: true }).filter(d => d.isDirectory()).forEach(d => {
  const files = fs.readdirSync(comps + '/' + d.name).filter(f => f.endsWith('.tsx'));
  console.log('  ' + d.name.padEnd(16) + String(files.length).padStart(2) + '  ' + files.map(f => f.replace('.tsx', '')).join(', '));
});

console.log('\n=== section registry: how many sections/pages ===');
const sr = read('templates/backend/lib/section-registry.ts') || '';
console.log('  entries: ' + (sr.match(/id: '/g) || []).length);
console.log('  HOMEPAGE_SECTIONS exported: ' + sr.includes('HOMEPAGE_SECTIONS'));
console.log('  PAGES exported: ' + sr.includes('PAGES'));

console.log('\n=== feature registry ===');
const fr = read('templates/backend/lib/feature-registry.ts') || '';
console.log('  features: ' + (fr.match(/id: '/g) || []).length);
console.log('  ' + [...fr.matchAll(/id: '([^']+)',\s*label: '([^']+)'/g)].map(m => m[1] + '=' + m[2]).join('\n  '));
