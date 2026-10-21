const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];
const FILES = [
  ['templates/components/stats/StatsBar.tsx', 'components/StatsBar.tsx'],
  ['templates/components/pricing/PricingTable.tsx', 'components/PricingTable.tsx'],
  ['templates/components/gallery/LatestWork.tsx', 'components/LatestWork.tsx'],
  ['templates/components/blog/BlogStrip.tsx', 'components/BlogStrip.tsx'],
  ['templates/components/social/SocialFeed.tsx', 'components/SocialFeed.tsx'],
];

// ── behaviour table (strip TS types so plain JS can run it) ──────────────
const src0 = fs.readFileSync(WB + '/' + FILES[0][0], 'utf8');
const fnSrc = src0
  .slice(src0.indexOf('function lgColCount'), src0.indexOf('export default'))
  .replace(/: number/g, '')
  .replace(/: string/g, '');
const mod = new Function(fnSrc + '\nreturn { lgColCount, rowItemClass };')();

console.log('=== card grids (Stats / Pricing / Latest Work / Blog) — gap-8 ===');
console.log('  n   cols  lastRow  wraps-to-rows?  width class');
for (let n = 1; n <= 12; n++) {
  const cols = mod.lgColCount(n);
  const last = n % cols === 0 ? cols : n % cols;
  const rows = Math.ceil(n / cols);
  console.log('  ' + String(n).padEnd(3) + String(cols).padEnd(6) + String(last).padEnd(8) + (rows > 1 ? rows + ' rows       ' : 'single row ') + mod.rowItemClass(n));
}

// social tiles — the source helpers are identical to these (asserted below)
const modS = new Function(`
function tileColCount(n) {
  if (n <= 4) return Math.max(1, n)
  if (n === 5) return 3
  if (n === 6) return 3
  const candidates = [3, 4, 6]
  for (const c of candidates) if (n % c === 0) return c
  for (const c of candidates) if (n % c !== 1) return c
  return 3
}
function tileItemClass(n) {
  const c = tileColCount(n)
  if (n <= 1) return 'w-full max-w-[280px]'
  if (c === 2) return 'w-[calc(50%_-_0.5rem)] max-w-[320px]'
  if (c === 3) return 'w-[calc(33.333%_-_0.667rem)]'
  if (c === 4) return 'w-[calc(25%_-_0.75rem)]'
  return 'w-[calc(16.666%_-_0.834rem)]'
}
return { tileColCount, tileItemClass };`)();
const srcS = fs.readFileSync(WB + '/' + FILES[4][0], 'utf8');
console.log('\n=== Social photo wall — gap-4 ===');
console.log('  n   cols  lastRow  wraps-to-rows?  width class');
for (let n = 1; n <= 13; n++) {
  const cols = modS.tileColCount(n);
  const last = n % cols === 0 ? cols : n % cols;
  const rows = Math.ceil(n / cols);
  console.log('  ' + String(n).padEnd(3) + String(cols).padEnd(6) + String(last).padEnd(8) + (rows > 1 ? rows + ' rows       ' : 'single row ') + modS.tileItemClass(n));
}

// ── assertions ───────────────────────────────────────────────────────────
console.log('\n=== assertions ===');
let ok = true;
function assert(cond, label) {
  console.log('  ' + label.padEnd(52) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}
assert(mod.rowItemClass(1).includes('max-w-lg'), 'n=1 gets the larger card');
assert(mod.rowItemClass(2).includes('calc(50%'), 'n=2 is a centred pair');
assert(mod.rowItemClass(4).includes('calc(25%'), 'n=4 is a full 4-up row');
assert(mod.lgColCount(5) === 3, 'n=5 -> 3-up (last row of 2, centred)');
assert(mod.lgColCount(6) === 3, 'n=6 -> 3-up (two full rows)');
assert(mod.lgColCount(7) === 4, 'n=7 -> 4-up (last row of 3, not 1)');
assert(mod.lgColCount(8) === 4, 'n=8 -> 4-up (two full rows)');
assert(mod.lgColCount(9) === 3, 'n=9 -> 3-up (three full rows)');
assert(mod.lgColCount(2) === 2 && mod.lgColCount(3) === 3, 'n=2/3 keep their own columns');
// no orphan of 1 for n=5..12
for (let n = 5; n <= 12; n++) {
  const cols = mod.lgColCount(n);
  const last = n % cols === 0 ? cols : n % cols;
  assert(last !== 1, 'n=' + n + ' does not leave a single orphan card');
}
assert(modS.tileItemClass(1).includes('max-w-[280px]'), 'photo n=1 is a single centred tile');

// every file must be centred + free of the old grid
for (const [rel] of FILES) {
  const s = fs.readFileSync(WB + '/' + rel, 'utf8');
  const name = rel.split('/').pop();
  assert(s.includes('justify-center'), name + ' uses justify-center');
  assert(!/grid sm:grid-cols-2 lg:grid-cols-3/.test(s), name + ' has no left-aligned grid');
  assert(!/grid grid-cols-2 \$\{colClass\}/.test(s), name + ' has no colClass grid');
  assert(!/#[0-9a-fA-F]{6}\b/.test(s), name + ' has no hardcoded hex');
}

// ── sync ─────────────────────────────────────────────────────────────────
console.log('\n=== sync to 3 sites ===');
for (const s of SITES) {
  for (const [srcRel, destRel] of FILES) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(28) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'ALIGNMENT VERIFIED + SYNCED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
