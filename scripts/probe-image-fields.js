const fs = require('fs');
const P = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== FEATURE_FIELDS field types (image-ish keys) ===');
const ff = app.indexOf('const FEATURE_FIELDS');
const ffEnd = app.indexOf('\nconst SECTION_FIELDS');
const ffBody = app.slice(ff, ffEnd > 0 ? ffEnd : ff + 20000);
const fieldRe = /\{ key: '([^']+)', label: '([^']+)', type: '([^']+)'[^}]*\}/g;
let m;
const rows = [];
while ((m = fieldRe.exec(ffBody)) !== null) {
  rows.push({ key: m[1], label: m[2], type: m[3] });
}
rows.forEach(r => {
  const looksImage = /image|photo|logo|avatar|picture|poster|badge|icon/i.test(r.key + ' ' + r.label);
  console.log('  ' + (looksImage ? 'IMG ' : '    ') + r.key.padEnd(22) + r.type.padEnd(12) + r.label);
});

console.log('\n=== SECTION_FIELDS image-ish ===');
const sm = app.match(/const SECTION_FIELDS = (\{[\s\S]*?\n\});/);
if (sm) {
  const o = JSON.parse(sm[1]);
  for (const [id, def] of Object.entries(o)) {
    for (const f of def.fields) {
      const subs = f.itemFields || [f];
      subs.forEach(s => {
        const looksImage = /image|photo|logo|avatar|picture|poster|url/i.test(s.key + ' ' + s.label) && s.type !== 'list';
        if (looksImage || s.type === 'image') {
          console.log('  ' + id.padEnd(12) + s.key.padEnd(12) + s.type.padEnd(10) + s.label);
        }
      });
    }
  }
}

console.log('\n=== index.html: input fields that look like image URLs (no upload nearby) ===');
const inputRe = /<input[^>]*type="(?:url|text)"[^>]*id="([^"]+)"[^>]*>/g;
while ((m = inputRe.exec(idx)) !== null) {
  const id = m[1];
  const looksImage = /image|photo|logo|avatar|picture|img|poster/i.test(id);
  if (looksImage) {
    // is there an upload affordance within 400 chars after?
    const after = idx.slice(m.index, m.index + 500);
    const hasUpload = /type="file"|upload|Upload/.test(after);
    console.log('  ' + id.padEnd(28) + (hasUpload ? 'has upload nearby' : '*** URL ONLY ***'));
  }
}

console.log('\n=== index.html: type="file" inputs ===');
const fileRe = /<input[^>]*type="file"[^>]*>/g;
while ((m = fileRe.exec(idx)) !== null) {
  console.log('  ' + m[0].replace(/\s+/g, ' ').slice(0, 140));
}

console.log('\n=== Team editor modal region ===');
const ti = idx.indexOf('Team Editor') >= 0 ? idx.indexOf('Team Editor') : idx.indexOf('teamEditor');
console.log('  teamEditor marker at', ti);
if (ti > 0) console.log(idx.slice(ti - 200, ti + 1800));
