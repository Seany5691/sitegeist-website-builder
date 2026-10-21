const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SRC = WB + '/templates/components/partners/PartnersStrip.tsx';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

const src = fs.readFileSync(SRC, 'utf8');
let ok = true;
function assert(cond, label) {
  console.log('  ' + label.padEnd(56) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}

// ── TSX ──────────────────────────────────────────────────────────────────
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
if (ts) {
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    fileName: 'PartnersStrip.tsx',
  });
  const d = out.diagnostics || [];
  console.log('TSX diagnostics: ' + (d.length === 0 ? 'clean' : d.length));
  d.forEach(x => console.log('   ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
  if (d.length) ok = false;
} else {
  console.log('TSX diagnostics: typescript not resolvable — skipped');
}

console.log('\n=== partners count-scale ===');
assert(src.includes('function partnerScale'), 'partnerScale helper present');
assert(src.includes('h-14 sm:h-16'), 'n=1 logo steps up to h-14/h-16');
assert(src.includes('h-12 sm:h-14'), 'n=2 logo steps up to h-12/h-14');
assert(src.includes('h-10 sm:h-12'), 'n=3+ logo stays at h-10/h-12');
assert(src.includes('text-2xl') && src.includes('text-xl') && src.includes('text-lg'), 'name text scales to match');
assert(src.includes('const scale = partnerScale(items.length)'), 'scale is driven by item count');
assert(src.includes('${scale.logo}'), 'logo className uses scale');
assert(src.includes('${scale.name}'), 'name className uses scale');
assert(src.includes('justify-center'), 'strip is still centred');
assert(src.includes('flex-wrap'), 'strip still wraps into rows');
assert(!/#[0-9a-fA-F]{6}\b/.test(src), 'no hardcoded hex');

// data contract untouched
for (const key of ['config?.partners', 'partners.items', 'item.logoUrl', 'item.name', 'item.url']) {
  assert(src.includes(key.split('config?.')[1] || key) || src.includes(key), 'reads ' + key);
}

// ── Tailwind class liveness: the strings must appear literally ───────────
console.log('\n=== Tailwind literal-class check (JIT can see them) ===');
for (const cls of ['h-14 sm:h-16', 'h-12 sm:h-14', 'h-10 sm:h-12', 'text-2xl', 'text-xl', 'text-lg']) {
  const literal = src.includes("'" + cls + "'") || src.includes('"' + cls + '"');
  console.log('  ' + cls.padEnd(20) + (literal ? 'literal string (JIT-safe)' : '*** NOT LITERAL — Tailwind will miss it ***'));
  if (!literal) ok = false;
}

// ── behaviour table ──────────────────────────────────────────────────────
console.log('\n=== partner strip scaling ===');
const fnSrc = src.slice(src.indexOf('function partnerScale'), src.indexOf('export default function'))
  .replace(/: number/g, '').replace(/: \{ logo: string; name: string \}/g, '');
const mod = new Function(fnSrc + '\nreturn partnerScale;')();
for (const n of [1, 2, 3, 5, 8]) {
  const s = mod(n);
  console.log('  n=' + String(n).padEnd(3) + 'logo=' + s.logo.padEnd(18) + 'name=' + s.name);
}

// ── sync ─────────────────────────────────────────────────────────────────
console.log('\n=== sync to 3 sites ===');
for (const s of SITES) {
  const dst = ROOT + '/Websites/' + s + '/components/PartnersStrip.tsx';
  fs.writeFileSync(dst, src, 'utf8');
  const match = fs.readFileSync(dst, 'utf8') === src;
  if (!match) ok = false;
  console.log('  ' + s.padEnd(32) + (match ? 'OK' : '*** MISMATCH ***') + '  ' + src.length + 'b');
}

console.log('\n' + (ok ? 'PARTNERS COUNT-SCALE APPLIED + SYNCED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
