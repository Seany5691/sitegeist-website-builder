const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// Shared helper — gap-8 (2rem) card grids. Tailwind arbitrary calc needs the
// underscore form. AnimateOnScroll IS the flex item, so widths go on its className.
const HELPER_GAP8 = `
/**
 * Desktop column count for a row of n items — wraps without leaving a lonely
 * orphan card on the last row when a good split exists.
 */
function lgColCount(n: number): number {
  if (n <= 4) return Math.max(1, n)
  const last3 = n % 3
  const last4 = n % 4
  const bad3 = last3 === 1
  const bad4 = last4 === 1
  if (bad3 && !bad4) return 4
  if (bad4 && !bad3) return 3
  return last3 === 0 ? 3 : last4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each row item. The AnimateOnScroll wrapper is the flex
 * item, so the sizing must live on its className. 1-2 items get a larger card,
 * 3-4 sit in a full row, 5+ wrap into centred rows.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-md lg:max-w-lg'
  if (n === 2) return 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md'
  return lgColCount(n) === 4
    ? 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]'
}
`;

// Social photo wall — gap-4 (1rem), tiles are square so it can run 3/4/6 up.
const HELPER_GAP4 = `
/** Column count for a photo wall of n tiles — avoids a lone tile on the last row. */
function tileColCount(n: number): number {
  if (n <= 4) return Math.max(1, n)
  if (n === 5) return 3
  if (n === 6) return 3
  const candidates = [3, 4, 6]
  for (const c of candidates) if (n % c === 0) return c
  for (const c of candidates) if (n % c !== 1) return c
  return 3
}

/** Count-aware tile width (AnimateOnScroll wrapper is the flex item). */
function tileItemClass(n: number): string {
  const c = tileColCount(n)
  if (n <= 1) return 'w-full max-w-[280px]'
  if (c === 2) return 'w-[calc(50%_-_0.5rem)] max-w-[320px]'
  if (c === 3) return 'w-[calc(33.333%_-_0.667rem)]'
  if (c === 4) return 'w-[calc(25%_-_0.75rem)]'
  return 'w-[calc(16.666%_-_0.834rem)]'
}
`;

const JOBS = [
  {
    file: 'templates/components/stats/StatsBar.tsx',
    helper: HELPER_GAP8,
    lenVar: 'stats.length',
    // container: dynamic colClass grid -> centred flex
    containerOld: `        <div className={\`grid grid-cols-2 \${colClass}\`}>`,
    containerNew: `        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">`,
    // drop the now-unused colClass line
    dropOld: `\n  // Keep a single clean row of 3-4 on desktop\n  const colClass = stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'\n`,
    dropNew: '\n',
    itemOld: `            <AnimateOnScroll key={i} delay={i * 100}>`,
    itemNew: `            <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(stats.length)}>`,
  },
  {
    file: 'templates/components/pricing/PricingTable.tsx',
    helper: HELPER_GAP8,
    lenVar: 'pricing.length',
    containerOld: `        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">`,
    containerNew: `        <div className="flex flex-wrap justify-center gap-8">`,
    itemOld: `              <AnimateOnScroll key={i} delay={i * 100}>`,
    itemNew: `              <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(pricing.length)}>`,
  },
  {
    file: 'templates/components/gallery/LatestWork.tsx',
    helper: HELPER_GAP8,
    lenVar: 'caseStudies.length',
    containerOld: `        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">`,
    containerNew: `        <div className="flex flex-wrap justify-center gap-8">`,
    itemOld: `              <AnimateOnScroll key={i} delay={i * 100}>`,
    itemNew: `              <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(caseStudies.length)}>`,
  },
  {
    file: 'templates/components/blog/BlogStrip.tsx',
    helper: HELPER_GAP8,
    lenVar: 'latest.length',
    containerOld: `        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">`,
    containerNew: `        <div className="flex flex-wrap justify-center gap-8">`,
    itemOld: `              <AnimateOnScroll key={i} delay={i * 100}>`,
    itemNew: `              <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(latest.length)}>`,
  },
  {
    file: 'templates/components/social/SocialFeed.tsx',
    helper: HELPER_GAP4,
    lenVar: 'images.length',
    containerOld: `            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">`,
    containerNew: `            <div className="flex flex-wrap justify-center gap-4">`,
    itemOld: `                <AnimateOnScroll key={i} delay={i * 60}>`,
    itemNew: `                <AnimateOnScroll key={i} delay={i * 60} className={tileItemClass(images.length)}>`,
  },
];

const IMPORT_ANCHOR = "import { AnimateOnScroll } from '@/components/AnimateOnScroll'";

for (const job of JOBS) {
  const p = WB + '/' + job.file;
  let src = fs.readFileSync(p, 'utf8');
  const name = job.file.split('/').pop();
  let changed = false;

  if (src.includes('function rowItemClass') || src.includes('function tileItemClass')) {
    console.log('  ' + name.padEnd(18) + 'helper already present');
  } else if (!src.includes(IMPORT_ANCHOR)) {
    console.log('  ' + name.padEnd(18) + '*** IMPORT ANCHOR MISSING ***');
    continue;
  } else {
    src = src.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + '\n' + job.helper);
    changed = true;
  }

  if (job.dropOld && src.includes(job.dropOld)) {
    src = src.replace(job.dropOld, job.dropNew);
    changed = true;
  }

  if (!src.includes(job.containerOld)) {
    console.log('  ' + name.padEnd(18) + '*** CONTAINER ANCHOR MISSING ***');
  } else {
    src = src.replace(job.containerOld, job.containerNew);
    changed = true;
  }

  if (!src.includes(job.itemOld)) {
    console.log('  ' + name.padEnd(18) + '*** ITEM ANCHOR MISSING ***');
  } else {
    src = src.replace(job.itemOld, job.itemNew);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, src, 'utf8');
    console.log('  ' + name.padEnd(18) + 'patched  ' + src.length + 'b');
  }
}

// ── TSX diagnostics on every touched file ────────────────────────────────
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TSX diagnostics ===');
let ok = true;
for (const job of JOBS) {
  const src = fs.readFileSync(WB + '/' + job.file, 'utf8');
  const name = job.file.split('/').pop();
  if (!ts) { console.log('  ' + name.padEnd(18) + '(typescript not resolvable)'); continue; }
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    fileName: name,
  });
  const d = out.diagnostics || [];
  console.log('  ' + name.padEnd(18) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
  d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
  if (d.length) ok = false;
  // zero hardcoded hex
  const hex = (src.match(/#[0-9a-fA-F]{6}\b/g) || []).filter(h => !/var\(/.test(src.slice(Math.max(0, src.indexOf(h) - 40), src.indexOf(h))));
  if (hex.length) { console.log('      hardcoded hex: ' + hex.join(',')); ok = false; }
  // must not use left-aligned grid any more
  if (/grid sm:grid-cols-2 lg:grid-cols-3/.test(src) || /grid grid-cols-2 \$\{colClass\}/.test(src)) {
    console.log('      *** still has left-aligned grid ***');
    ok = false;
  }
  if (!src.includes('justify-center')) { console.log('      *** missing justify-center ***'); ok = false; }
}

// ── behaviour table: what happens at each count ──────────────────────────
console.log('\n=== wrap behaviour (gap-8 card grids) ===');
const src0 = fs.readFileSync(WB + '/' + JOBS[0].file, 'utf8');
const fnSrc = src0.slice(src0.indexOf('function lgColCount'), src0.indexOf('export default'));
const mod = new Function(fnSrc + '\nreturn { lgColCount, rowItemClass };')();
console.log('  n  cols  lastRow  class');
for (let n = 1; n <= 12; n++) {
  const cols = mod.lgColCount(n);
  const last = n % cols === 0 ? cols : n % cols;
  console.log('  ' + String(n).padEnd(3) + String(cols).padEnd(6) + String(last).padEnd(8) + mod.rowItemClass(n));
}

console.log('\n=== sync to 3 sites ===');
const MAP = JOBS.map(j => [j.file, 'components/' + j.file.split('/').pop()]);
for (const s of SITES) {
  for (const [srcRel, destRel] of MAP) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(30) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'ALIGNMENT FIX APPLIED + SYNCED' : 'PROBLEM(S) — see above'));
process.exit(ok ? 0 : 1);
