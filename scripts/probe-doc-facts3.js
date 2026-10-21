const fs = require('fs');
const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';
const sr = fs.readFileSync(WB + '/templates/backend/lib/section-registry.ts', 'utf8');
const fr = fs.readFileSync(WB + '/templates/backend/lib/feature-registry.ts', 'utf8');
const idx = fs.readFileSync(WB + '/templates/dashboard/index.html', 'utf8');
const app = fs.readFileSync(WB + '/templates/dashboard/assets/app.js', 'utf8');

function entries(src, startMarker, endMarker) {
  const i = src.indexOf(startMarker);
  const j = endMarker ? src.indexOf(endMarker, i) : src.length;
  const seg = src.slice(i, j);
  const re = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'([\s\S]*?)\n\s*\}/g;
  const out = [];
  let m;
  while ((m = re.exec(seg)) !== null) {
    const b = m[3];
    out.push({
      id: m[1], label: m[2],
      component: (b.match(/component:\s*'([^']+)'/) || [])[1] || '',
      kind: (b.match(/kind:\s*'([^']+)'/) || [])[1] || '',
      defaultOn: (b.match(/defaultOn:\s*(true|false)/) || [])[1] || '?',
      locked: /locked:\s*true/.test(b),
    });
  }
  return out;
}

console.log('=== HOMEPAGE SECTIONS ===');
const sections = entries(sr, 'HOMEPAGE_SECTIONS', 'export const PAGES');
sections.forEach(s => console.log('  ' + s.id.padEnd(14) + s.label.padEnd(34) + s.component.padEnd(18) + 'default=' + s.defaultOn + (s.locked ? '  LOCKED' : '')));
console.log('  total: ' + sections.length);

console.log('\n=== PAGES ===');
const pages = entries(sr, 'export const PAGES', 'export function');
pages.forEach(p => console.log('  ' + p.id.padEnd(16) + p.label.padEnd(34) + p.component.padEnd(18) + 'default=' + p.defaultOn + (p.locked ? '  LOCKED' : '')));
console.log('  total: ' + pages.length);

console.log('\n=== FEATURES ===');
const fr2 = fr.match(/export const FEATURES[\s\S]*?\n\]/);
const feats = [...(fr2 ? fr2[0] : '').matchAll(/id:\s*'([^']+)',\s*label:\s*'([^']+)'([\s\S]*?)\n\s*\}/g)];
feats.forEach(f => {
  const b = f[3];
  const def = (b.match(/defaultOn:\s*(true|false)/) || [])[1] || '?';
  const placement = (b.match(/placement:\s*'([^']+)'/) || [])[1] || '?';
  console.log('  ' + f[1].padEnd(20) + f[2].padEnd(38) + 'placement=' + placement.padEnd(12) + 'default=' + def);
});
console.log('  total: ' + feats.length);

console.log('\n=== DASHBOARD SIDEBAR (grouped order) ===');
const groups = idx.split('data-nav-group="');
for (let i = 1; i < groups.length; i++) {
  const ids = groups[i].split('"')[0].split(' ');
  const titleM = groups[i].match(/">([^<]+)</);
  console.log('  ' + (titleM ? titleM[1] : '?') + ':');
  ids.forEach(id => {
    const at = idx.indexOf('data-section="' + id + '"');
    const chunk = idx.slice(at, at + 300);
    const labelM = chunk.match(/<span>([^<]+)</);
    console.log('     ' + id.padEnd(14) + (labelM ? labelM[1] : ''));
  });
}

console.log('\n=== FEATURE_FIELDS keys in the dashboard ===');
const ff = app.match(/const FEATURE_FIELDS = \{([\s\S]*?)\n\};/);
if (ff) {
  const keys = [...ff[1].matchAll(/^\s{2}(\w+):\s*\[/gm)].map(m => m[1]);
  console.log('  ' + keys.join(', '));
}

console.log('\n=== build pipeline files ===');
for (const f of ['app/api/build-website/route.ts', 'app/api/build-site/route.ts', 'app/api/build-prompt/route.ts', 'lib/prompt-builder.ts', 'lib/boilerplate-generator.ts', 'lib/component-selector.ts', 'lib/design-seed.ts', 'lib/scraper.ts', 'lib/hybrid-engine.ts', 'lib/media-downloader.ts', 'lib/image-processor.ts', 'lib/logo-engine.ts', 'lib/creative-brief.ts', 'lib/schema.ts', 'lib/geo-audit.ts']) {
  const s = fs.readFileSync(WB + '/' + f, 'utf8');
  console.log('  ' + f.padEnd(42) + s.split('\n').length + ' lines');
}
