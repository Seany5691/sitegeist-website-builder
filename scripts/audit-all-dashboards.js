const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const NEW = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];

function analyse(html) {
  const tagRe = /<(\/?)section\b([^>]*)>/g;
  const stack = [];
  let m;
  const findings = {};
  while ((m = tagRe.exec(html)) !== null) {
    if (m[1] !== '/') {
      const idM = m[2].match(/id="([^"]+)"/);
      stack.push({ id: idM ? idM[1] : '(no id)', at: m.index });
    } else {
      const open = stack.pop();
      if (open) {
        for (const id of NEW) {
          const at = html.indexOf('<section id="' + id + '"');
          if (at > open.at && at < m.index && !findings[id]) findings[id] = open.id;
        }
      }
    }
  }
  const nested = [];
  for (const id of NEW) {
    if (html.includes('<section id="' + id + '"') && findings[id] && findings[id] !== '(no id)') {
      nested.push(id + ' in #' + findings[id]);
    }
  }
  const hasPanels = NEW.filter(id => html.includes('<section id="' + id + '"')).length;
  const opens = (html.match(/<section\b/g) || []).length;
  const closes = (html.match(/<\/section>/g) || []).length;
  return { nested, hasPanels, opens, closes };
}

const files = [];
function walk(d) {
  let ents;
  try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ents) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const p = d + '/' + e.name;
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html' && p.includes('/dashboard/')) files.push(p);
  }
}
walk(ROOT + '/Website Builder');
walk(ROOT + '/Websites');

console.log('=== every dashboard index.html on disk ===');
for (const f of files.sort()) {
  const html = fs.readFileSync(f, 'utf8');
  const r = analyse(html);
  const rel = f.replace(ROOT + '/', '');
  const isTemplate = rel.includes('templates/dashboard');
  const isLive = rel.startsWith('Websites/');
  const scope = isTemplate ? 'TEMPLATE (ships to every new site)' : isLive ? 'LIVE SITE' : 'Built Websites (historical build output)';
  console.log('  ' + rel.padEnd(72) + 'panels=' + r.hasPanels + '  sections=' + r.opens + '/' + r.closes +
    (r.nested.length ? '  NESTED: ' + r.nested.join(',') : '  root-level') +
    '   [' + scope + ']');
}

console.log('\n=== Website Builder app entry points that serve a dashboard ===');
// does the Website Builder app itself have a dashboard route?
const appDir = ROOT + '/Website Builder/app';
function walkApp(d, depth) {
  if (depth > 3) return;
  let ents;
  try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ents) {
    const p = d + '/' + e.name;
    if (e.isDirectory()) walkApp(p, depth + 1);
    else if (/dashboard/i.test(p)) console.log('  ' + p.replace(ROOT + '/', ''));
  }
}
walkApp(appDir, 0);
