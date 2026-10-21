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
// rate-limiter.ts — add limiters for the public endpoints
// ═══════════════════════════════════════════════════════════════════════════
const rlPath = BACK + '/lib/rate-limiter.ts';
let rl = fs.readFileSync(rlPath, 'utf8');

if (rl.includes('contactRateLimiter')) {
  console.log('rate-limiter.ts already has the public limiters');
} else {
  rl += `

// ── Public-endpoint limiters ────────────────────────────────────────────────
// These are anonymous-facing, so they must be generous enough never to punish a
// real visitor while still stopping scripted abuse.
//
// Contact form:  a real person submits once. 20 per 10 minutes is far above any
//                genuine use and well below a spam run.
// Upload:        a dashboard user can legitimately drop a whole gallery, so this
//                is much higher — it is there to stop scripted flooding, not to
//                rate-limit a human.

export const contactRateLimiter = new RateLimiter(20, 10) // 20 submissions / 10 min / IP
export const uploadRateLimiter = new RateLimiter(120, 10) // 120 uploads / 10 min / IP

/**
 * Client IP for anonymous rate limiting. Prefers the first X-Forwarded-For
 * entry (Vercel sets it), falls back to X-Real-IP.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') || 'unknown'
}
`;
  fs.writeFileSync(rlPath, rl, 'utf8');
  console.log('rate-limiter.ts  contact + upload limiters added');
}

// ═══════════════════════════════════════════════════════════════════════════
// /api/contact — apply the contact limiter
// ═══════════════════════════════════════════════════════════════════════════
const contactPath = BACK + '/app/api/contact/route.ts';
let ct = fs.readFileSync(contactPath, 'utf8');

if (ct.includes('contactRateLimiter')) {
  console.log('contact route already rate-limited');
} else {
  ct = ct.replace(
    "import { submitLead } from '@/lib/leads'",
    "import { submitLead } from '@/lib/leads'\nimport { contactRateLimiter, clientIpFrom } from '@/lib/rate-limiter'"
  );
  const ANCHOR = `export async function POST(request: NextRequest) {
  try {`;
  const NEW = `export async function POST(request: NextRequest) {
  // Anonymous endpoint: throttle per IP so a spam run cannot flood the client's
  // inbox or burn the Resend quota. 20 submissions / 10 minutes is far above any
  // genuine visitor and far below an attack.
  const ip = clientIpFrom(request.headers)
  if (contactRateLimiter.check(ip)) {
    const remaining = contactRateLimiter.remaining(ip)
    return NextResponse.json(
      {
        success: false,
        message: \`Too many messages from this connection. Please try again in a few minutes. (\${remaining} attempts remaining)\`,
      },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  try {`;
  if (!ct.includes(ANCHOR)) { console.log('  *** contact anchor not found ***'); ok = false; }
  else {
    ct = ct.replace(ANCHOR, NEW);
    fs.writeFileSync(contactPath, ct, 'utf8');
    console.log('contact route   rate-limited');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// /api/upload — apply the upload limiter
// ═══════════════════════════════════════════════════════════════════════════
const uploadPath = BACK + '/app/api/upload/route.ts';
let up = fs.readFileSync(uploadPath, 'utf8');

if (up.includes('uploadRateLimiter')) {
  console.log('upload route already rate-limited');
} else {
  up = up.replace(
    "import { protectRoute } from '@/lib/dashboard-middleware'",
    "import { protectRoute } from '@/lib/dashboard-middleware'\nimport { uploadRateLimiter, clientIpFrom } from '@/lib/rate-limiter'"
  );
  const ANCHOR = `  try {
    const formData = await request.formData()
    const file = formData.get('file') as File`;
  const NEW = `  // Belt and braces: the route is already auth-guarded, but this stops a
  // single compromised session from flooding Blob storage.
  const ip = clientIpFrom(request.headers)
  if (uploadRateLimiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many uploads in a short time. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File`;
  if (!up.includes(ANCHOR)) { console.log('  *** upload anchor not found ***'); ok = false; }
  else {
    up = up.replace(ANCHOR, NEW);
    fs.writeFileSync(uploadPath, up, 'utf8');
    console.log('upload route    rate-limited');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
const rl2 = fs.readFileSync(rlPath, 'utf8');
const ct2 = fs.readFileSync(contactPath, 'utf8');
const up2 = fs.readFileSync(uploadPath, 'utf8');

assert(rl2.includes('export const contactRateLimiter'), 'contactRateLimiter exported');
assert(rl2.includes('export const uploadRateLimiter'), 'uploadRateLimiter exported');
assert(rl2.includes('export function clientIpFrom'), 'clientIpFrom helper exported');
assert(ct2.includes('contactRateLimiter.check'), 'contact route enforces the limit');
assert(ct2.includes('status: 429'), 'contact returns 429');
assert(ct2.includes('Retry-After'), 'contact sends Retry-After');
assert(up2.includes('uploadRateLimiter.check'), 'upload route enforces the limit');
assert(up2.includes('status: 429'), 'upload returns 429');
assert(/protectRoute/.test(up2), 'upload is still auth-guarded');
assert(up2.includes('MAX_UPLOAD_BYTES'), 'upload size cap still present');
assert(up2.includes('sniffImageType'), 'upload magic-byte sniff still present');

// login limiter untouched
assert(rl2.includes('new RateLimiter(10, 15)'), 'login limiter unchanged (10 / 15 min)');

// TS
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TS ===');
if (ts) {
  for (const rel of ['lib/rate-limiter.ts', 'app/api/contact/route.ts', 'app/api/upload/route.ts']) {
    const out = ts.transpileModule(fs.readFileSync(BACK + '/' + rel, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: rel.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  ' + rel.padEnd(32) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
    if (d.length) ok = false;
  }
}

console.log('\n=== sync to 3 sites ===');
for (const s of SITES) {
  for (const rel of ['lib/rate-limiter.ts', 'app/api/contact/route.ts', 'app/api/upload/route.ts']) {
    const content = fs.readFileSync(BACK + '/' + rel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + rel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + rel.padEnd(38) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'FIX 5 APPLIED — rate limiting live' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
