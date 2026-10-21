const fs = require('fs');
const COMP = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components';
let ts;
try { ts = require('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/node_modules/typescript'); } catch (e) { ts = require('typescript'); }

for (const [name, path] of [
  ['NewsletterBlock', COMP + '/newsletter/NewsletterBlock.tsx'],
  ['QuoteSlideIn', COMP + '/features/QuoteSlideIn.tsx'],
]) {
  const src = fs.readFileSync(path, 'utf8');
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    fileName: name + '.tsx',
  });
  console.log('\n===== ' + name + ' diagnostics =====');
  (out.diagnostics || []).forEach(d => {
    let line = '?', col = '?';
    if (d.file && d.start != null) {
      const lc = d.file.getLineAndCharacterOfPosition(d.start);
      line = lc.line + 1; col = lc.character + 1;
    }
    console.log('  ' + line + ':' + col + '  ' + ts.flattenDiagnosticMessageText(d.messageText, ' '));
  });
  const lines = src.split('\n');
  console.log('  --- handleSubmit region ---');
  const i = lines.findIndex(l => /handleSubmit|const submit =/.test(l));
  console.log(lines.slice(Math.max(0, i - 2), i + 40).map((l, k) => String(i - 1 + k + 1).padStart(4) + ': ' + l).join('\n'));
}
