const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SRC = WB + '/templates/components/process/ProcessSteps.tsx';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

const src = fs.readFileSync(SRC, 'utf8');

// ── 1. TSX diagnostics ───────────────────────────────────────────────────
let ts;
try { ts = require(WB + '/node_modules/typescript'); }
catch (e) { try { ts = require('typescript'); } catch (e2) { ts = null; } }
if (ts) {
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
    fileName: 'ProcessSteps.tsx',
  });
  const diags = out.diagnostics || [];
  console.log('TSX diagnostics: ' + (diags.length === 0 ? 'NONE (clean)' : diags.length));
  diags.forEach(d => {
    const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
    console.log('  ' + (pos ? (pos.line + 1) + ':' + (pos.character + 1) + ' ' : '') + ts.flattenDiagnosticMessageText(d.messageText, ' '));
  });
  if (diags.length) process.exit(1);
} else {
  console.log('TSX diagnostics: typescript not resolvable — SKIPPED');
}

// ── 2. the fix is present and correct ───────────────────────────────────
console.log('\n=== ghost numeral fix ===');
const checks = {
  'numeral has z-20 (above image layer)': /absolute top-2 right-5 z-20/.test(src),
  'contrast colour when image present': /color-mix\(in srgb, var\(--color-bg\) 82%, transparent\)/.test(src),
  'quiet watermark when no image': /color-mix\(in srgb, var\(--color-primary\) 10%, transparent\)/.test(src),
  'halo only over image': /textShadow: s\.image/.test(src),
  'no hardcoded hex colour': !/#[0-9a-fA-F]{3,8}\b/.test(src),
  'image still renders': /s\.image && \(/.test(src),
};
let ok = true;
for (const [k, v] of Object.entries(checks)) {
  console.log('  ' + k.padEnd(42) + (v ? 'ok' : '*** FAIL ***'));
  if (!v) ok = false;
}

// data contract must be untouched
for (const key of ['config?.process', 'processLayout', 'processTitle', 'processSubtitle']) {
  const present = src.includes(key);
  console.log('  ' + ('reads ' + key).padEnd(42) + (present ? 'ok' : '*** LOST ***'));
  if (!present) ok = false;
}

// ── 3. sync to the 3 sites ───────────────────────────────────────────────
console.log('\n=== sync ProcessSteps.tsx -> sites ===');
for (const s of SITES) {
  const dst = ROOT + '/Websites/' + s + '/components/ProcessSteps.tsx';
  fs.writeFileSync(dst, src, 'utf8');
  const match = fs.readFileSync(dst, 'utf8') === src;
  console.log('  ' + s.padEnd(32) + (match ? 'OK' : '*** MISMATCH ***') + '  ' + src.length + 'b');
  if (!match) ok = false;
}

console.log('\n' + (ok ? 'GHOST NUMERAL FIX VERIFIED + SYNCED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
