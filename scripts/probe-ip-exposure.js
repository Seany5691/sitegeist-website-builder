const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITE = ROOT + '/Websites/missions_ablaze';
const WB = ROOT + '/Website Builder';

function walk(d, out = [], depth = 0) {
  if (depth > 4) return out;
  let ents;
  try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of ents) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const p = d + '/' + e.name;
    if (e.isDirectory()) walk(p, out, depth + 1);
    else out.push(p);
  }
  return out;
}

console.log('=== 1. Is anything from the GENERATOR shipped to the live site? ===');
const generatorOnly = [
  'lib/industry-templates.ts', 'lib/design-seed.ts', 'lib/component-selector.ts',
  'lib/creative-brief.ts', 'lib/prompt-builder.ts', 'lib/boilerplate-generator.ts',
  'lib/scraper.ts', 'lib/hybrid-engine.ts', 'lib/logo-engine.ts', 'lib/image-processor.ts',
  'lib/media-downloader.ts', 'lib/archetype-map.json',
];
for (const f of generatorOnly) {
  const inSite = fs.existsSync(SITE + '/' + f);
  const inPublic = fs.existsSync(SITE + '/public/' + path.basename(f));
  console.log('  ' + f.padEnd(36) + 'in site=' + (inSite ? 'YES' : 'no ') + '  in public/=' + (inPublic ? 'YES' : 'no '));
}

console.log('\n=== 2. Is .build-instructions/ publicly served? ===');
const bi = SITE + '/.build-instructions';
console.log('  exists at project root: ' + fs.existsSync(bi));
console.log('  inside public/        : ' + fs.existsSync(SITE + '/public/.build-instructions'));
console.log('  (Next.js only serves public/ + app routes — project root is NOT served)');
if (fs.existsSync(bi)) console.log('  files: ' + fs.readdirSync(bi).join(', '));

console.log('\n=== 3. Source maps in production? ===');
const nc = fs.readFileSync(SITE + '/next.config.js', 'utf8');
console.log('  productionBrowserSourceMaps set: ' + /productionBrowserSourceMaps/.test(nc));
console.log('  value: ' + (nc.match(/productionBrowserSourceMaps:\s*(\w+)/) || [])[1] + '  (Next default is false)');
console.log('  .map files in public/: ' + walk(SITE + '/public').filter(f => f.endsWith('.map')).length);
console.log('  next.config has noMinify/keepNames: ' + /noMinify|keepNames|swcMinify:\s*false/.test(nc));

console.log('\n=== 4. What a visitor can download without auth ===');
const pub = walk(SITE + '/public');
console.log('  public/ files: ' + pub.length);
pub.filter(f => /\.(js|html|css|json)$/.test(f)).slice(0, 30).forEach(f => {
  const st = fs.statSync(f);
  console.log('    ' + f.replace(SITE + '/public', '').padEnd(46) + (st.size / 1024).toFixed(1) + ' KB');
});

console.log('\n=== 5. Does any API response leak generator internals? ===');
const apiFiles = walk(SITE + '/app/api');
for (const f of apiFiles) {
  const s = fs.readFileSync(f, 'utf8');
  const leaks = [];
  ['archetype', 'designSeed', 'ART_DIRECTION', 'constraint', 'prompt', 'creativeBrief', 'seedId'].forEach(k => {
    if (new RegExp(k, 'i').test(s)) leaks.push(k);
  });
  if (leaks.length) console.log('  ' + f.replace(SITE + '/', '').padEnd(42) + leaks.join(', '));
}
console.log('  (design-system panel reads designSystem from DASHBOARD_CONFIG — build-time, shown to the client by design)');

console.log('\n=== 6. Is the Website Builder engine deployed anywhere? ===');
console.log('  Website Builder has vercel.json: ' + fs.existsSync(WB + '/vercel.json'));
console.log('  Website Builder has .vercel project: ' + fs.existsSync(WB + '/.vercel'));
console.log('  Website Builder has a public/ dir: ' + fs.existsSync(WB + '/public'));
const wbApp = fs.existsSync(WB + '/app') ? walk(WB + '/app').length : 0;
console.log('  Website Builder app/ files: ' + wbApp + '  (runs LOCALLY per project rule)');

console.log('\n=== 7. Copyright / terms notices present? ===');
for (const f of ['app/layout.tsx', 'components/Footer.tsx', 'components/footers/FooterFull.tsx', 'public/dashboard/index.html']) {
  const p = fs.existsSync(SITE + '/' + f) ? SITE + '/' + f : null;
  if (!p) { console.log('  ' + f.padEnd(42) + '(absent)'); continue; }
  const s = fs.readFileSync(p, 'utf8');
  const hits = ['©', 'Copyright', 'Terms', 'Privacy', 'All rights reserved'].filter(k => s.includes(k));
  console.log('  ' + f.padEnd(42) + (hits.length ? hits.join(', ') : 'none'));
}
