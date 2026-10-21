const fs = require('fs');
const SITE = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze';

console.log('=== external origins referenced in the site ===');
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const p = d + '/' + e.name;
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|js|html|css)$/.test(e.name)) files.push(p);
  }
}
walk(SITE);
const origins = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const re = /https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const o = m[1];
    if (/vercel\.com|w3\.org|schema\.org|example\.com|googleapis\.com\/ajax|localhost/.test(o)) continue;
    origins.set(o, (origins.get(o) || 0) + 1);
  }
}
[...origins.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([o, n]) => console.log('  ' + o.padEnd(42) + n));

console.log('\n=== external scripts / stylesheets actually linked ===');
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const re = /<(?:script|link)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g;
  let m;
  while ((m = re.exec(s)) !== null) console.log('  ' + f.replace(SITE + '/', '').padEnd(34) + m[1].slice(0, 90));
}

console.log('\n=== font loading ===');
const layout = fs.existsSync(SITE + '/app/layout.tsx') ? fs.readFileSync(SITE + '/app/layout.tsx', 'utf8') : '';
const gf = layout.match(/fonts\.(googleapis|gstatic)\.com[^"'`]*/g) || [];
console.log('  google fonts in layout.tsx: ' + (gf.length ? gf.join(', ') : 'none'));
console.log('  next/font usage: ' + /next\/font/.test(layout));
const css = fs.existsSync(SITE + '/app/globals.css') ? fs.readFileSync(SITE + '/app/globals.css', 'utf8') : '';
console.log('  @import/url in globals.css: ' + ((css.match(/@import|url\(https?:/g) || []).length));

console.log('\n=== inline script / event handlers (CSP impact) ===');
const dash = fs.readFileSync(SITE + '/public/dashboard/index.html', 'utf8');
console.log('  dashboard inline <script> blocks: ' + (dash.match(/<script(?![^>]*src=)/g) || []).length);
console.log('  dashboard inline onclick attrs  : ' + (dash.match(/onclick=/g) || []).length);
console.log('  dashboard inline style= attrs   : ' + (dash.match(/ style=/g) || []).length);
const app = fs.readFileSync(SITE + '/public/dashboard/assets/app.js', 'utf8');
console.log('  app.js uses eval/new Function   : ' + (/[^a-zA-Z]eval\(|new Function\(/.test(app)));
console.log('  app.js innerHTML writes         : ' + (app.match(/\.innerHTML\s*=/g) || []).length);

console.log('\n=== site components inline styles (CSP style-src impact) ===');
let styleAttr = 0;
function walk2(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + '/' + e.name;
    if (e.isDirectory()) { if (!['node_modules', '.next'].includes(e.name)) walk2(p); }
    else if (/\.tsx$/.test(e.name)) {
      const s = fs.readFileSync(p, 'utf8');
      styleAttr += (s.match(/style=\{\{/g) || []).length;
    }
  }
}
walk2(SITE + '/components');
walk2(SITE + '/app');
console.log('  style={{ … }} in components: ' + styleAttr + '  (React sets these via CSSOM — NOT blocked by style-src)');
