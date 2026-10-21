const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';

const nextConfig = fs.readFileSync(WB + '/templates/backend/next.config.js', 'utf8');
const genPath = WB + '/lib/boilerplate-generator.ts';
let gen = fs.readFileSync(genPath, 'utf8');

const START = 'function generateNextConfig(): string {';
const END = '\nfunction generateTsConfig(): string {';
const start = gen.indexOf(START);
const end = gen.indexOf(END, start);
if (start < 0 || end < 0) {
  console.log('*** generateNextConfig anchor not found ***');
  process.exit(1);
}

// Emit the template verbatim via a template literal. Escape backticks and
// ${ so the generator's own string cannot be broken by the config body.
const escaped = nextConfig
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const replacement = `function generateNextConfig(): string {
  // Single source of truth: templates/backend/next.config.js carries the
  // security headers (CSP / X-Frame-Options / HSTS / …). It is emitted here too
  // because the generator writes next.config.js AFTER copyBackendDir(), so a
  // header-less version would otherwise overwrite the shipped one.
  return \`${escaped}\`
}`;

gen = gen.slice(0, start) + replacement + gen.slice(end);
fs.writeFileSync(genPath, gen, 'utf8');
console.log('generateNextConfig now emits the security headers');

// ── verify ───────────────────────────────────────────────────────────────
const g2 = fs.readFileSync(genPath, 'utf8');
const fn = g2.slice(g2.indexOf('function generateNextConfig'), g2.indexOf('\nfunction generateTsConfig'));
let ok = true;
function assert(c, l) {
  console.log('  ' + l.padEnd(58) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}
assert(fn.includes('X-Frame-Options'), 'emits X-Frame-Options');
assert(fn.includes('Content-Security-Policy'), 'emits CSP');
assert(fn.includes('Strict-Transport-Security'), 'emits HSTS');
assert(fn.includes('Permissions-Policy'), 'emits Permissions-Policy');
assert(fn.includes('frame-ancestors'), 'emits frame-ancestors');
assert(fn.includes('fonts.googleapis.com'), 'allows Google Fonts');
assert(fn.includes('cdnjs.cloudflare.com'), 'allows Font Awesome');
assert(fn.includes('unoptimized: true'), 'keeps images config');
assert(fn.includes('optimizeFonts: false'), 'keeps optimizeFonts');

// the generator must still parse
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
if (ts) {
  const out = ts.transpileModule(g2, {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    fileName: 'boilerplate-generator.ts',
  });
  const d = out.diagnostics || [];
  console.log('  ' + 'TS boilerplate-generator.ts'.padEnd(58) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
  d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
  if (d.length) ok = false;

  // and the emitted string must itself be valid JS
  const body = fn.slice(fn.indexOf('return `') + 'return `'.length, fn.lastIndexOf('`'));
  const unescaped = body.replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\\\\/g, '\\');
  fs.writeFileSync(WB + '/scripts/.emit-check.js', unescaped, 'utf8');
  const { execSync } = require('child_process');
  try {
    execSync('node --check "' + WB + '/scripts/.emit-check.js"', { stdio: 'pipe' });
    console.log('  ' + 'emitted next.config.js parses'.padEnd(58) + 'ok');
  } catch (e) {
    console.log('  ' + 'emitted next.config.js parses'.padEnd(58) + '*** FAIL ***');
    console.log(String(e.stdout || e.stderr).slice(0, 500));
    ok = false;
  }
  try { fs.unlinkSync(WB + '/scripts/.emit-check.js'); } catch (e) {}

  // and it must match the shipped template
  const matches = unescaped.trim() === nextConfig.trim();
  assert(matches, 'emitted output identical to templates/backend/next.config.js');
}

console.log('\n' + (ok ? 'GENERATOR FIXED — every new build gets the security headers' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
