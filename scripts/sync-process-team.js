const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// template (family path) -> site (flat path, matching SectionRenderer's @/components/X imports)
const MAP = [
  ['templates/components/process/ProcessSteps.tsx', 'components/ProcessSteps.tsx'],
  ['templates/components/team/TeamSection.tsx', 'components/TeamSection.tsx'],
  ['templates/components/team/TeamPage.tsx', 'components/TeamPage.tsx'],
];

console.log('=== source sanity ===');
for (const [src] of MAP) {
  const s = fs.readFileSync(WB + '/' + src, 'utf8');
  const checks = {
    'reads config.process or team': /config\??\.(process|team)/.test(s),
    'processLayout read (ProcessSteps only)': src.includes('ProcessSteps') ? s.includes('processLayout') : true,
    'no hardcoded hex': !/#[0-9a-fA-F]{6}\b/.test(s.replace(/#[0-9a-fA-F]{3,8}\b/g, (m) => (/^#[0-9a-fA-F]{6}$/.test(m) ? m : m))),
    'use client': s.startsWith("'use client'") || s.includes("'use client'"),
  };
  // simpler hex check: any 6-digit hex NOT inside a var() comment
  const hexHits = (s.match(/#[0-9a-fA-F]{6}\b/g) || []).filter(h => !/var\(/.test(s.slice(Math.max(0, s.indexOf(h) - 40), s.indexOf(h))));
  console.log('  ' + src.padEnd(46) + 'processLayout=' + (s.includes('processLayout') ? 'yes' : 'no') + '  hex=' + hexHits.length + '  lines=' + s.split('\n').length);
}

console.log('\n=== sync to 3 sites ===');
for (const s of SITES) {
  for (const [srcRel, destRel] of MAP) {
    const src = WB + '/' + srcRel;
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    const content = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dst, content, 'utf8');
    const check = fs.readFileSync(dst, 'utf8');
    console.log('  ' + s.padEnd(32) + destRel.padEnd(28) + (check === content ? 'OK' : '*** MISMATCH ***') + '  ' + check.length + 'b');
  }
}

console.log('\n=== data-contract cross-check: dashboard keys vs component reads ===');
// what the components read
const proc = fs.readFileSync(WB + '/templates/components/process/ProcessSteps.tsx', 'utf8');
const team = fs.readFileSync(WB + '/templates/components/team/TeamSection.tsx', 'utf8');
const KEYS = [
  ['process', /config\??\.process\b/, proc],
  ['processLayout', /config\??\.processLayout\b/, proc],
  ['processTitle', /processTitle/, proc],
  ['processSubtitle', /processSubtitle/, proc],
  ['team', /config\??\.team\b/, team],
  ['teamTitle', /teamTitle/, team],
  ['teamSubtitle', /teamSubtitle/, team],
];
for (const [k, re, src] of KEYS) {
  console.log('  ' + k.padEnd(18) + (re.test(src) ? 'read by component' : '*** NOT READ ***'));
}
