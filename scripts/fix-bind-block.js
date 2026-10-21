const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const appPath = P + '/assets/app.js';
let app = fs.readFileSync(appPath, 'utf8');

const BLOCK_START = '  // Section editors reuse the feature-card field/list/upload handlers.';
const BLOCK_END = "document.getElementById('hours')?.addEventListener('change', onFeaturesGridFileChange);";

if (!app.includes(BLOCK_START)) {
  console.log('bind block not present — nothing to fix');
  process.exit(0);
}

const start = app.indexOf(BLOCK_START);
const end = app.indexOf(BLOCK_END, start);
if (end < 0) throw new Error('block end not found');
const blockEnd = end + BLOCK_END.length;

const block = app.slice(start, blockEnd);

// The block must be OUTSIDE the vslPanel change handler. Rebuild that region:
//   vslPanel.addEventListener('change', (e) => {
//     onFeaturesGridChange(e);
//     onFeaturesGridFileChange(e);
//   });
//   vslPanel.addEventListener('input', onFeaturesGridChange);
//   vslPanel.addEventListener('click', onFeaturesGridClick);
// }
//
//   <BLOCK>
//
//   startLeadsPolling();
const tail = app.slice(blockEnd);
const pollIdx = tail.indexOf('  startLeadsPolling();');
if (pollIdx < 0) throw new Error('startLeadsPolling not found after block');
const rest = tail.slice(pollIdx);   // from startLeadsPolling() onward

// Everything up to the block, with the trailing blank line collapsed
let head = app.slice(0, start).replace(/\n+$/, '\n');

const rebuilt =
  head +
  '    });\n' +
  '    vslPanel.addEventListener(\'input\', onFeaturesGridChange);\n' +
  '    vslPanel.addEventListener(\'click\', onFeaturesGridClick);\n' +
  '  }\n' +
  '\n' +
  block + '\n' +
  '\n' +
  rest;

fs.writeFileSync(appPath, rebuilt, 'utf8');
console.log('rebind: block moved out of the vslPanel change handler');
console.log('  before ' + app.length + ' bytes -> after ' + rebuilt.length + ' bytes');

// verify
const a2 = fs.readFileSync(appPath, 'utf8');
const i2 = a2.indexOf(BLOCK_START);
const beforeCtx = a2.slice(i2 - 260, i2);
console.log('\n--- context before the block (must show the handler properly closed) ---');
console.log(beforeCtx);

console.log('\n--- checks ---');
console.log('  block still present      : ' + a2.includes(BLOCK_START));
console.log('  block AFTER vsl close    : ' + (beforeCtx.includes('vslPanel.addEventListener(\'click\', onFeaturesGridClick);') && beforeCtx.includes('  }')));
console.log('  change handler closed    : ' + beforeCtx.includes('    });'));
console.log('  startLeadsPolling intact : ' + a2.includes('  startLeadsPolling();\n});'));
console.log('  hours listener present   : ' + a2.includes(BLOCK_END));

let depth = 0;
for (const ch of a2) { if (ch === '{') depth++; else if (ch === '}') depth--; }
console.log('  brace balance            : ' + depth);
