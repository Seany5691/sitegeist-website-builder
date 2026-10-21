const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const COMP = WB + '/templates/components';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

const ERR = `{formError && (`;

const FIXES = [
  {
    path: COMP + '/newsletter/NewsletterBlock.tsx',
    formOpen: '              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">',
    ternary: '            ) : (',
  },
  {
    path: COMP + '/features/QuoteSlideIn.tsx',
    formOpen: '            <form onSubmit={submit} className="space-y-4">',
    ternary: '            ) : (',
  },
];

let ok = true;
for (const f of FIXES) {
  let s = fs.readFileSync(f.path, 'utf8');
  const name = f.path.split('/').pop();

  if (s.includes('<>\n') && s.includes('</>')) {
    console.log('  ' + name.padEnd(22) + 'already wrapped');
    continue;
  }

  // 1. open a fragment right before the form
  const openIdx = s.indexOf(f.formOpen);
  if (openIdx < 0) {
    console.log('  ' + name.padEnd(22) + '*** form open not found ***');
    ok = false;
    continue;
  }
  const ternIdx = s.lastIndexOf(f.ternary, openIdx);
  if (ternIdx < 0) {
    console.log('  ' + name.padEnd(22) + '*** ternary not found ***');
    ok = false;
    continue;
  }
  // insert "<>" on its own line just after the ternary
  const afterTernary = ternIdx + f.ternary.length;
  s = s.slice(0, afterTernary) + '\n              <>' + s.slice(afterTernary);

  // 2. close the fragment just after the error block, before ")}"
  const errIdx = s.indexOf(ERR);
  if (errIdx < 0) {
    console.log('  ' + name.padEnd(22) + '*** error block not found ***');
    ok = false;
    continue;
  }
  const closeIdx = s.indexOf(')}', errIdx);
  if (closeIdx < 0) {
    console.log('  ' + name.padEnd(22) + '*** error block close not found ***');
    ok = false;
    continue;
  }
  const insertAt = closeIdx + ')}'.length;
  s = s.slice(0, insertAt) + '\n              </>' + s.slice(insertAt);

  fs.writeFileSync(f.path, s, 'utf8');
  console.log('  ' + name.padEnd(22) + 'fragment wrapped');
}

// ── TSX diagnostics ──────────────────────────────────────────────────────
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TSX ===');
if (ts) {
  for (const path of [COMP + '/newsletter/NewsletterBlock.tsx', COMP + '/features/NewsletterPopup.tsx', COMP + '/features/QuoteSlideIn.tsx']) {
    const out = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: path.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  ' + path.split('/').pop().padEnd(24) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => {
      let pos = '';
      if (x.file && x.start != null) {
        const lc = x.file.getLineAndCharacterOfPosition(x.start);
        pos = (lc.line + 1) + ':' + (lc.character + 1) + '  ';
      }
      console.log('      ' + pos + ts.flattenDiagnosticMessageText(x.messageText, ' '));
    });
    if (d.length) ok = false;
  }
} else {
  console.log('  typescript not resolvable — skipped');
}

// ── sync ─────────────────────────────────────────────────────────────────
console.log('\n=== sync to 3 sites ===');
const MAP = [
  ['templates/components/newsletter/NewsletterBlock.tsx', 'components/NewsletterBlock.tsx'],
  ['templates/components/features/QuoteSlideIn.tsx', 'components/features/QuoteSlideIn.tsx'],
];
for (const s of SITES) {
  for (const [srcRel, destRel] of MAP) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(38) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'JSX FIXED + SYNCED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
