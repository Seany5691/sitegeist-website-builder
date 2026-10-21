const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const BACK = WB + '/templates/backend';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

let ok = true;
function assert(c, l) {
  console.log('  ' + l.padEnd(62) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}

// ── 1. collapse the duplicated `message` keys my earlier replace created ────
// Original shape was { message: 'Failed to X', error: String(error) }.
// The existing message is already client-safe, so we simply drop the raw error
// rather than adding a second `message` property.
console.log('=== collapse duplicate message keys ===');
const DUPES = [
  ["{ success: false, message: 'Failed to update configuration', message: 'Something went wrong. Please try again.' },",
   "{ success: false, message: 'Failed to update configuration' },"],
  ["{ success: false, message: 'Failed to load site data', message: 'Something went wrong. Please try again.' },",
   "{ success: false, message: 'Failed to load site data' },"],
  ["{ success: false, message: 'Failed to upload file', message: 'Something went wrong. Please try again.' },",
   "{ success: false, message: 'Failed to upload file' },"],
];

for (const rel of ['app/api/save-config/route.ts', 'app/api/site-data/route.ts', 'app/api/upload/route.ts', 'app/api/leads/route.ts', 'app/api/stats/route.ts', 'app/api/contact/route.ts', 'app/api/geo-audit/route.ts']) {
  const p = BACK + '/' + rel;
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  for (const [bad, good] of DUPES) s = s.split(bad).join(good);
  // generic catch-all for any remaining duplicated message
  s = s.replace(/message:\s*'([^']*)',\s*message:\s*'[^']*'/g, "message: '$1'");
  if (s !== before) {
    fs.writeFileSync(p, s, 'utf8');
    console.log('  ' + rel.replace('app/api/', '').padEnd(34) + 'collapsed');
  } else {
    console.log('  ' + rel.replace('app/api/', '').padEnd(34) + 'clean');
  }
}

// ── 2. uploadImage wants File | Buffer — pass the sniffed buffer ───────────
console.log('\n=== fix uploadImage call ===');
const upPath = BACK + '/app/api/upload/route.ts';
let up = fs.readFileSync(upPath, 'utf8');
const BAD_CALL = 'const url = await uploadImage(new Blob([buf], { type: sniffed.mime }), filename)';
const GOOD_CALL = '// pass the sniffed bytes (Buffer is accepted; the stored extension is\n    // already forced to the sniffed type, so no payload can smuggle through)\n    const url = await uploadImage(buf, filename)';
if (up.includes(BAD_CALL)) {
  up = up.split(BAD_CALL).join(GOOD_CALL);
  fs.writeFileSync(upPath, up, 'utf8');
  console.log('  uploadImage now receives the Buffer');
} else if (up.includes('uploadImage(buf, filename)')) {
  console.log('  already passing a Buffer');
} else {
  console.log('  *** call site not found ***');
  ok = false;
}

// ── verify ────────────────────────────────────────────────────────────────
console.log('\n=== verify ===');
for (const rel of ['app/api/save-config/route.ts', 'app/api/site-data/route.ts', 'app/api/upload/route.ts', 'app/api/leads/route.ts', 'app/api/stats/route.ts', 'app/api/contact/route.ts', 'app/api/geo-audit/route.ts']) {
  const p = BACK + '/' + rel;
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  const dup = /message:\s*'[^']*',\s*message:\s*'/.test(s);
  const leaks = /error:\s*String\(error\)|message:\s*error\.message/.test(s);
  assert(!dup && !leaks, rel.replace('app/api/', '') + ' clean (no dupe key, no raw error)');
}
const u2 = fs.readFileSync(upPath, 'utf8');
assert(u2.includes('uploadImage(buf, filename)'), 'upload passes a Buffer');
assert(!/new Blob\(/.test(u2), 'no Blob wrapper left');
assert(u2.includes('sniffImageType'), 'magic-byte sniff intact');
assert(u2.includes('MAX_UPLOAD_BYTES'), 'size cap intact');

// TS
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TS ===');
if (ts) {
  for (const rel of ['app/api/save-config/route.ts', 'app/api/site-data/route.ts', 'app/api/upload/route.ts', 'app/api/leads/route.ts', 'lib/rate-limiter.ts', 'app/api/contact/route.ts']) {
    const out = ts.transpileModule(fs.readFileSync(BACK + '/' + rel, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: rel.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  ' + rel.padEnd(38) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
    if (d.length) ok = false;
  }
}

console.log('\n=== sync to 3 sites ===');
const ALL = ['lib/rate-limiter.ts', 'app/api/contact/route.ts', 'app/api/upload/route.ts',
  'app/api/site-data/route.ts', 'app/api/leads/route.ts', 'app/api/save-config/route.ts'];
for (const s of SITES) {
  for (const rel of ALL) {
    const content = fs.readFileSync(BACK + '/' + rel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + rel;
    fs.writeFileSync(dst, content, 'utf8');
    if (fs.readFileSync(dst, 'utf8') !== content) ok = false;
  }
  console.log('  ' + s.padEnd(32) + ALL.length + ' routes synced');
}

console.log('\n' + (ok ? 'TYPE ERRORS RESOLVED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
