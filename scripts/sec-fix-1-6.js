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

// ═══════════════════════════════════════════════════════════════════════════
// FIX 6 — never return raw error strings to the client
// ═══════════════════════════════════════════════════════════════════════════
console.log('=== FIX 6: stop leaking raw error strings ===');
const ROUTES = [
  'app/api/site-data/route.ts',
  'app/api/upload/route.ts',
  'app/api/leads/route.ts',
  'app/api/contact/route.ts',
  'app/api/save-config/route.ts',
  'app/api/stats/route.ts',
  'app/api/geo-audit/route.ts',
];

for (const rel of ROUTES) {
  const p = BACK + '/' + rel;
  if (!fs.existsSync(p)) { console.log('  ' + rel.padEnd(40) + '(absent)'); continue; }
  let s = fs.readFileSync(p, 'utf8');
  const before = s;

  // log the detail server-side, return a generic message to the client
  s = s.replace(/error:\s*String\(error\)/g, "message: 'Something went wrong. Please try again.'");
  s = s.replace(/message:\s*error\.message/g, "message: 'Something went wrong. Please try again.'");
  s = s.replace(/message:\s*err instanceof Error \? err\.message : 'Failed to load leads'/g,
    "message: 'Failed to load leads'");
  s = s.replace(/message:\s*err instanceof Error \? err\.message : 'Failed to update lead'/g,
    "message: 'Failed to update lead'");
  s = s.replace(/message:\s*error\.message\s*\|\|\s*'[^']*'/g,
    "message: 'Something went wrong. Please try again.'");

  if (s !== before) {
    fs.writeFileSync(p, s, 'utf8');
    console.log('  ' + rel.padEnd(40) + 'sanitised');
  } else {
    console.log('  ' + rel.padEnd(40) + 'already clean');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX 1 — /api/upload: type allowlist + magic-byte sniff + size cap
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== FIX 1: upload allowlist + size cap ===');
const uploadPath = BACK + '/app/api/upload/route.ts';
let up = fs.readFileSync(uploadPath, 'utf8');

if (up.includes('MAX_UPLOAD_BYTES')) {
  console.log('  upload already hardened');
} else {
  const OLD = `  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Generate safe filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = \`\${timestamp}-\${safeName}\``;

  const NEW = `  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // ── Size cap ────────────────────────────────────────────────────────
    // No limit means anyone with a login can fill Blob storage / run up cost.
    const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB
    if (typeof file.size === 'number' && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, message: 'That file is too large. The maximum is 8 MB.' },
        { status: 413 }
      )
    }

    // ── Type allowlist + magic-byte sniff ───────────────────────────────
    // The declared MIME type and the file extension are both attacker-controlled,
    // so we sniff the actual bytes. SVG/HTML are deliberately NOT allowed: they
    // execute script when opened and are a stored-XSS / phishing vector on a
    // trusted origin.
    const buf = Buffer.from(await file.arrayBuffer())
    const sniffed = sniffImageType(buf)
    if (!sniffed) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, WebP and GIF images are allowed.' },
        { status: 415 }
      )
    }

    // Generate safe filename — forced to the sniffed extension so a .svg renamed
    // to .png cannot smuggle itself through.
    const timestamp = Date.now()
    const baseName = (file.name || 'upload').replace(/\\.[^.]*$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'upload'
    const filename = \`\${timestamp}-\${baseName}.\${sniffed.ext}\``;

  if (!up.includes(OLD)) {
    console.log('  *** upload anchor not found — aborting ***');
    process.exit(1);
  }
  up = up.replace(OLD, NEW);

  // pass the buffer through instead of the raw File, so the sniffed bytes are what we store
  up = up.replace(
    '    const url = await uploadImage(file, filename)',
    '    const url = await uploadImage(new Blob([buf], { type: sniffed.mime }), filename)'
  );

  // append the sniffer helper
  up += `

/**
 * Identify an image by its leading bytes. The extension and the declared
 * Content-Type are both attacker-controlled and prove nothing; the first few
 * bytes do.
 *
 * Returns null for anything we do not want stored — notably SVG and HTML,
 * both of which can carry script.
 */
function sniffImageType(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { mime: 'image/png', ext: 'png' }
  // GIF87a / GIF89a
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return { mime: 'image/gif', ext: 'gif' }
  // WebP: 'RIFF' .... 'WEBP'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  // AVIF: '....ftypavif'
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.slice(8, 12).toString('latin1')
    if (brand.startsWith('avif') || brand.startsWith('avis')) return { mime: 'image/avif', ext: 'avif' }
  }
  return null
}
`;
  fs.writeFileSync(uploadPath, up, 'utf8');
  console.log('  upload route hardened (allowlist + sniff + 8MB cap)');
}

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
for (const rel of ROUTES) {
  const p = BACK + '/' + rel;
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  const stillLeaks = /error:\s*String\(error\)|message:\s*error\.message/.test(s);
  assert(!stillLeaks, rel.replace('app/api/', '') + ' does not return raw errors');
}

const u = fs.readFileSync(uploadPath, 'utf8');
assert(u.includes('MAX_UPLOAD_BYTES'), 'upload has a size cap');
assert(u.includes('sniffImageType'), 'upload sniffs magic bytes');
assert(u.includes('image/jpeg') && u.includes('image/png') && u.includes('image/webp') && u.includes('image/gif'), 'jpeg/png/webp/gif allowed');
assert(!/mime:\s*'image\/svg|mime:\s*'text\/html/.test(u), 'SVG and HTML are NOT in the allowlist');
assert(u.includes('.${sniffed.ext}'), 'stored extension is forced to the sniffed one');
assert(/protectRoute/.test(u), 'upload is still auth-guarded');

// TS check
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TS ===');
if (ts) {
  for (const rel of ROUTES.concat(['app/api/upload/route.ts'])) {
    const p = BACK + '/' + rel;
    if (!fs.existsSync(p)) continue;
    const out = ts.transpileModule(fs.readFileSync(p, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: rel.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  ' + rel.replace('app/api/', '').padEnd(32) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
    if (d.length) ok = false;
  }
}

console.log('\n=== sync to 3 sites ===');
for (const s of SITES) {
  for (const rel of ROUTES.concat(['app/api/upload/route.ts'])) {
    const src = WB + '/templates/backend/' + rel;
    if (!fs.existsSync(src)) continue;
    const content = fs.readFileSync(src, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + rel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + rel.padEnd(38) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'FIXES 1 + 6 APPLIED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
