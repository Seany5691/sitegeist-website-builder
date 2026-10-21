const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const TPL = WB + '/templates/dashboard/index.html';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

let idx = fs.readFileSync(TPL, 'utf8');
const NEW = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];

// ── locate the mis-nested block ───────────────────────────────────────────
const BLOCK_START = '        <!-- ============== PROCESS ============== -->';
const TAIL = '      </div>\n    </main>';

if (!idx.includes(BLOCK_START)) {
  console.log('process panel marker not found — structure may already be fixed');
} else {
  const start = idx.indexOf(BLOCK_START);
  const end = idx.indexOf(TAIL, start);
  if (end < 0) throw new Error('tail marker not found after process panel');

  const region = idx.slice(start, end);
  // region = <9 panels> + "\n\n        </section>\n\n"
  const STRAY = '        </section>\n\n';
  if (!region.endsWith(STRAY)) {
    console.log('*** region does not end with the stray </section> — dumping tail ***');
    console.log(JSON.stringify(region.slice(-200)));
    process.exit(1);
  }
  const panelsBlock = region.slice(0, region.length - STRAY.length);

  // Sanity: the block must contain all 9 panels and exactly 9 </section> closes
  const opens = (panelsBlock.match(/<section\b/g) || []).length;
  const closes = (panelsBlock.match(/<\/section>/g) || []).length;
  console.log('extracted panel block: ' + panelsBlock.length + ' bytes, <section> x' + opens + ', </section> x' + closes);
  for (const id of NEW) {
    if (!panelsBlock.includes('<section id="' + id + '"')) {
      console.log('  *** ' + id + ' missing from block — aborting ***');
      process.exit(1);
    }
  }
  if (opens !== closes) {
    console.log('  *** unbalanced sections in block (' + opens + ' open / ' + closes + ' close) — aborting ***');
    process.exit(1);
  }

  // Replace: panels stay OUTSIDE the enclosing section, which now closes first.
  const rebuilt = idx.slice(0, start) + '        </section>\n\n' + panelsBlock + '\n\n' + idx.slice(end);
  fs.writeFileSync(TPL, rebuilt, 'utf8');
  console.log('restructured: panels moved out of <section id="vsl">');
}

// ── verify nesting from scratch ──────────────────────────────────────────
function analyse(html, label) {
  const tagRe = /<(\/?)section\b([^>]*)>/g;
  const stack = [];
  let m;
  const findings = {};
  while ((m = tagRe.exec(html)) !== null) {
    if (m[1] !== '/') {
      const idM = m[2].match(/id="([^"]+)"/);
      stack.push({ id: idM ? idM[1] : '(no id)', at: m.index });
    } else {
      const open = stack.pop();
      if (open) {
        for (const id of NEW) {
          const at = html.indexOf('<section id="' + id + '"');
          if (at > open.at && at < m.index && !findings[id]) findings[id] = open.id;
        }
      }
    }
  }
  const bad = [];
  for (const id of NEW) {
    const parent = findings[id];
    if (parent && parent !== '(no id)') bad.push(id + ' in #' + parent);
  }
  // doubled </section> check
  const doubled = (html.match(/<\/section>\s*\n\s*<\/section>/g) || []).length;
  const opens = (html.match(/<section\b/g) || []).length;
  const closes = (html.match(/<\/section>/g) || []).length;
  console.log('  ' + label.padEnd(26) + 'open=' + opens + ' close=' + closes + ' doubledClose=' + doubled +
    (bad.length ? '  NESTED: ' + bad.join(', ') : '  panels are ROOT-LEVEL') +
    (opens === closes ? '' : '  *** UNBALANCED ***'));
  return bad.length === 0 && doubled === 0 && opens === closes;
}

console.log('\n=== verify template ===');
let ok = analyse(fs.readFileSync(TPL, 'utf8'), 'template');

console.log('\n=== sync + verify sites ===');
for (const s of SITES) {
  const content = fs.readFileSync(TPL, 'utf8');
  const dst = ROOT + '/Websites/' + s + '/public/dashboard/index.html';
  fs.writeFileSync(dst, content, 'utf8');
  ok = analyse(fs.readFileSync(dst, 'utf8'), s) && ok;
  // config.js untouched
  const cfg = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/assets/config.js', 'utf8');
  const ph = (cfg.match(/\{\{[A-Z_]+\}\}/g) || []).length;
  const bn = (cfg.match(/businessName:\s*"([^"]*)"/) || [])[1];
  console.log('  ' + ' '.repeat(26) + 'config.js businessName="' + bn + '" placeholders=' + ph);
  if (ph > 0) ok = false;
}

console.log('\n' + (ok ? 'STRUCTURE FIXED — all 9 panels are root-level siblings' : 'PROBLEM(S) REMAIN'));
process.exit(ok ? 0 : 1);
