const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const APP = WB + '/templates/dashboard/assets/app.js';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

let ok = true;
function assert(c, l) {
  console.log('  ' + l.padEnd(64) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}

let app = fs.readFileSync(APP, 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// 1. helpers — escapeAttr (HTML attr) + escapeJs (inside a '...' JS string in
//    an inline onclick attribute). escapeHtml already exists.
// ═══════════════════════════════════════════════════════════════════════════
if (!app.includes('function escapeJs')) {
  const ANCHOR = 'function escapeHtml(value) {';
  const HELPERS = `/**
 * Escape for a value sitting inside a single-quoted JavaScript string that is
 * itself inside an HTML attribute — e.g. onclick="fn('\${name}')".
 * Both layers must be escaped or either one alone is breakable.
 */
function escapeJs(value) {
  return String(value ?? '')
    .replace(/\\\\/g, '\\\\\\\\')
    .replace(/'/g, "\\\\'")
    .replace(/"/g, '\\\\"')
    .replace(/\\n/g, '\\\\n')
    .replace(/\\r/g, '\\\\r')
    .replace(/\\u2028/g, '\\\\u2028')
    .replace(/\\u2029/g, '\\\\u2029')
    .replace(/<\\//g, '<\\\\/');
}

function escapeHtml(value) {`;
  if (!app.includes(ANCHOR)) { console.log('  *** escapeHtml anchor not found ***'); process.exit(1); }
  app = app.replace(ANCHOR, HELPERS);
  console.log('helpers     escapeJs added');
} else {
  console.log('helpers     already present');
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. every <img src="${X}">  →  <img src="${escapeHtml(X)}">
// ═══════════════════════════════════════════════════════════════════════════
const before = app;
app = app.replace(/(src=")\$\{([a-zA-Z_$][\w.]*)(\})"/g, '$1${escapeHtml($2)}"');
// also alt="${X}" where X is user text
app = app.replace(/(alt=")\$\{(catName|post\.title|s\.title|label)(\})"/g, '$1${escapeHtml($2)}"');
console.log('img/alt     src+alt interpolations escaped  (' + ((before.match(/src="\$\{/g) || []).length) + ' src sites)');

// ═══════════════════════════════════════════════════════════════════════════
// 3. the dangerous onclick with a JS string — folder/category name
// ═══════════════════════════════════════════════════════════════════════════
const ONCLICK_BAD = `deleteFolderImage('\${category}', \${index})`;
const ONCLICK_GOOD = `deleteFolderImage('\${escapeJs(category)}', \${index})`;
if (app.includes(ONCLICK_BAD)) {
  app = app.split(ONCLICK_BAD).join(ONCLICK_GOOD);
  console.log('onclick     deleteFolderImage category escaped');
} else if (app.includes('escapeJs(category)')) {
  console.log('onclick     already escaped');
} else {
  console.log('onclick     *** pattern not found ***');
  ok = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. blog list — post title + date
// ═══════════════════════════════════════════════════════════════════════════
app = app.replace(
  '<div class="blog-title">${post.title || \'Untitled\'}</div>',
  '<div class="blog-title">${escapeHtml(post.title || \'Untitled\')}</div>'
);
app = app.replace(
  '<div class="blog-meta">${post.date || \'\'}</div>',
  '<div class="blog-meta">${escapeHtml(post.date || \'\')}</div>'
);
console.log('blog        title + date escaped');

// ═══════════════════════════════════════════════════════════════════════════
// 5. business hours — dayOfWeek + times
// ═══════════════════════════════════════════════════════════════════════════
app = app.replace(
  '<div class="hours-day">${h.dayOfWeek}</div>',
  '<div class="hours-day">${escapeHtml(h.dayOfWeek)}</div>'
);
app = app.replace(
  'value="${h.opens || \'09:00\'}"',
  'value="${escapeHtml(h.opens || \'09:00\')}"'
);
app = app.replace(
  'value="${h.closes || \'17:00\'}"',
  'value="${escapeHtml(h.closes || \'17:00\')}"'
);
console.log('hours       dayOfWeek + times escaped');

// ═══════════════════════════════════════════════════════════════════════════
// 6. inline style values (CSS injection via colour / stroke)
// ═══════════════════════════════════════════════════════════════════════════
app = app.replace(
  'style="background: ${c.value}"',
  'style="background: ${escapeHtml(c.value)}"'
);
app = app.replace(
  "style=\"stroke:${color || 'var(--primary-light)'}\"",
  "style=\"stroke:${escapeHtml(color || 'var(--primary-light)')}\""
);
console.log('styles      colour + stroke escaped');

// ═══════════════════════════════════════════════════════════════════════════
// 7. design-system panel — seed / archetype / industry strings
// ═══════════════════════════════════════════════════════════════════════════
for (const v of [
  'resolvedSeedId', 'archetypeName', 'artDirection',
  'densityProfile', 'decorativeIntensity', 'motionIntensity',
]) {
  // wrap ${v} only when it is NOT already wrapped
  const re = new RegExp('\\$\\{' + v + '(?!\\s*\\|\\|)', 'g');
  app = app.replace(re, '${escapeHtml(' + v + '}');
  // fix the now-dangling brace: ${escapeHtml(x}  -> ${escapeHtml(x)}
  app = app.split('${escapeHtml(' + v + '}').join('${escapeHtml(' + v + ')}');
}
console.log('design-sys  seed/archetype/intensity values escaped');

// treatments / guardrails are hardcoded string arrays in source — safe already.
fs.writeFileSync(APP, app, 'utf8');

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
const a2 = fs.readFileSync(APP, 'utf8');
assert(a2.includes('function escapeJs'), 'escapeJs helper present');
assert(a2.includes('escapeJs(category)'), 'onclick category escaped');
assert(!/src="\$\{[a-zA-Z_$][\w.]*\}"/.test(a2), 'no raw src="${var}" left');
assert(a2.includes('escapeHtml(post.title'), 'blog title escaped');
assert(a2.includes('escapeHtml(h.dayOfWeek)'), 'hours day escaped');
assert(a2.includes('escapeHtml(c.value)'), 'colour value escaped');
assert(a2.includes('escapeHtml(resolvedSeedId)'), 'seed id escaped');
assert(a2.includes('escapeHtml(archetypeName)'), 'archetype escaped');

// no double-escaping introduced
assert(!/escapeHtml\(escapeHtml\(/.test(a2), 'no double-escaping');
assert(!/escapeJs\(escapeJs\(/.test(a2), 'no double-escaping (js)');
assert((a2.match(/function escapeHtml/g) || []).length === 1, 'escapeHtml defined once');
assert((a2.match(/function escapeJs/g) || []).length === 1, 'escapeJs defined once');

// structural integrity
let depth = 0, min = 0;
for (const ch of a2) { if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth < min) min = depth; } }
assert(depth === 0 && min >= 0, 'brace balance ok');

console.log('\n=== node --check ===');
fs.writeFileSync(APP + '.check.js', a2, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check "' + APP + '.check.js"', { stdio: 'pipe' });
  console.log('  SYNTAX OK');
} catch (e) {
  console.log('  *** SYNTAX ERROR ***\n' + String(e.stdout || e.stderr).slice(0, 800));
  ok = false;
}
try { fs.unlinkSync(APP + '.check.js'); } catch (e) {}

console.log('\n=== sync to 3 sites ===');
for (const s of SITES) {
  const dst = ROOT + '/Websites/' + s + '/public/dashboard/assets/app.js';
  fs.writeFileSync(dst, a2, 'utf8');
  const match = fs.readFileSync(dst, 'utf8') === a2;
  if (!match) ok = false;
  console.log('  ' + s.padEnd(32) + 'app.js  ' + (match ? 'OK' : '*** MISMATCH ***') + '  ' + a2.length + 'b');
}

console.log('\n' + (ok ? 'FIX 2 APPLIED — dashboard XSS escaping' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
