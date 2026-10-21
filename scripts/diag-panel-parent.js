const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');

const NEW = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];

// Walk the raw HTML tracking <section> open/close to find each panel's enclosing section.
console.log('=== enclosing <section> for each new panel ===');
const tagRe = /<(\/?)section\b([^>]*)>/g;
const stack = [];
let m;
const findings = {};
while ((m = tagRe.exec(idx)) !== null) {
  const closing = m[1] === '/';
  if (!closing) {
    const idM = m[2].match(/id="([^"]+)"/);
    stack.push({ id: idM ? idM[1] : '(no id)', at: m.index });
  } else {
    const open = stack.pop();
    if (open) {
      // any new panel inside this section?
      for (const id of NEW) {
        const at = idx.indexOf('<section id="' + id + '"');
        if (at > open.at && at < m.index && !findings[id]) {
          findings[id] = open.id;
        }
      }
    }
  }
}
for (const id of NEW) {
  console.log('  ' + id.padEnd(12) + 'is inside <section id="' + (findings[id] || 'NOTHING/ROOT') + '">');
}

console.log('\n=== does the HTML place panels BEFORE a closing </section>? ===');
const firstPanel = idx.indexOf('<section id="process"');
console.log('  400 chars before process panel:');
console.log(JSON.stringify(idx.slice(firstPanel - 400, firstPanel)));

console.log('\n=== the </div></main> tail of .content ===');
const tail = idx.indexOf('      </div>\n    </main>');
console.log('  tail marker at ' + tail);
console.log(JSON.stringify(idx.slice(tail - 300, tail + 60)));
