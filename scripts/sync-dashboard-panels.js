const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// ── 1. Data-contract check: dashboard writes vs component reads ─────────────
console.log('=== data contract: dashboard -> site components ===');
const app = fs.readFileSync(WB + '/templates/dashboard/assets/app.js', 'utf8');
const sm = app.match(/const SECTION_FIELDS = (\{[\s\S]*?\n\});/);
if (!sm) throw new Error('SECTION_FIELDS not found');
const SECTION_FIELDS = JSON.parse(sm[1]);

const COMP = {
  process: 'templates/components/process/ProcessSteps.tsx',
  latestWork: 'templates/components/gallery/LatestWork.tsx',
  partners: 'templates/components/partners/PartnersStrip.tsx',
  awards: 'templates/components/awards/AwardsPress.tsx',
  instagram: 'templates/components/social/SocialFeed.tsx',
  newsletter: 'templates/components/newsletter/NewsletterBlock.tsx',
  statsBar: 'templates/components/stats/StatsBar.tsx',
  video: 'templates/components/video/VideoEmbed.tsx',
  hours: 'templates/components/hours/BusinessHours.tsx',
};

// keys the component actually reads at the top level of its source object
const READS = {
  process: ['process', 'processTitle', 'processSubtitle', 'processLayout'],
  latestWork: ['caseStudies', 'caseStudiesTitle', 'caseStudiesSubtitle'],
  partners: ['title', 'items'],
  awards: ['awards', 'awardsTitle', 'awardsSubtitle'],
  instagram: ['instagramFeed', 'socialTitle', 'socialSubtitle'],
  newsletter: ['headline', 'body', 'ctaLabel'],
  statsBar: ['stats', 'statsTitle', 'statsSubtitle'],
  video: ['videos'],
  hours: ['businessHoursTitle', 'businessHoursSubtitle'],  // rows owned by Settings > Business Hours
};
// per-item keys the component reads
const ITEM_READS = {
  process: ['step', 'title', 'description', 'image'],
  latestWork: ['title', 'summary', 'result', 'image', 'tags'],
  partners: ['name', 'logoUrl', 'url'],
  awards: ['title', 'issuer', 'year', 'image', 'url'],
  instagram: ['url'],
  statsBar: ['value', 'label'],
  video: ['url'],
};

let fail = 0;
for (const [id, def] of Object.entries(SECTION_FIELDS)) {
  const src = fs.readFileSync(WB + '/' + COMP[id], 'utf8');
  const schemaKeys = def.fields.map(f => f.key);
  const want = READS[id] || [];

  const missingWrite = want.filter(k => !schemaKeys.includes(k));
  const extraWrite = schemaKeys.filter(k => !want.includes(k));
  const status = missingWrite.length === 0 && extraWrite.length === 0 ? 'MATCH' : 'DIFF';
  if (status === 'DIFF') fail++;
  console.log('  ' + id.padEnd(12) + status +
    (missingWrite.length ? '  not-written:' + missingWrite.join(',') : '') +
    (extraWrite.length ? '  not-read:' + extraWrite.join(',') : ''));

  // item-level
  const list = def.fields.find(f => f.type === 'list');
  if (list && ITEM_READS[id]) {
    const sub = (list.itemFields || []).map(f => f.key);
    const miss = ITEM_READS[id].filter(k => !sub.includes(k));
    const extra = sub.filter(k => !ITEM_READS[id].includes(k));
    if (miss.length || extra.length) {
      fail++;
      console.log('      items ' + (miss.length ? 'not-written:' + miss.join(',') : '') + (extra.length ? ' not-read:' + extra.join(',') : ''));
    } else {
      console.log('      items [' + sub.join(', ') + '] MATCH');
    }
  }

  // mirrorPageContent keys must be read via pageContent fallback in the component
  def.fields.filter(f => f.mirrorPageContent).forEach(f => {
    const has = src.includes('pageContent') && src.includes(f.key);
    console.log('      mirror ' + f.key.padEnd(24) + (has ? 'component has pageContent fallback' : '*** component has NO pageContent fallback ***'));
  });
}

// ── 2. Sync dashboard to the 3 sites ───────────────────────────────────────
console.log('\n=== sync dashboard to 3 sites ===');
const DASH = [
  ['templates/dashboard/index.html', 'public/dashboard/index.html'],
  ['templates/dashboard/assets/app.js', 'public/dashboard/assets/app.js'],
  ['templates/dashboard/assets/styles.css', 'public/dashboard/assets/styles.css'],
  // config.js is PER-SITE and must NEVER be synced from the template.
  // templates/dashboard/assets/config.js is a SKELETON full of {{PLACEHOLDERS}};
  // copying it over a live site makes config.js fail to parse ("Unexpected token '{'"),
  // window.DASHBOARD_CONFIG stays undefined, and the whole dashboard load chain dies
  // (TypeError on config.businessName -> no Website Control rows). The real per-site
  // config.js is generated at build time / restored from GeistBackups.
];
const FORBIDDEN_SYNC = ['config.js'];
for (const s of SITES) {
  for (const [srcRel, destRel] of DASH) {
    const src = WB + '/' + srcRel;
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    if (!fs.existsSync(src)) { console.log('  MISSING SRC ' + srcRel); continue; }
    fs.mkdirSync(require('path').dirname(dst), { recursive: true });
    const content = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dst, content, 'utf8');
    const ok = fs.readFileSync(dst, 'utf8') === content;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(32) + (ok ? 'OK' : '*** MISMATCH ***') + '  ' + content.length + 'b');
  }
}

// ── 3. Asset-ref assertion on every synced index.html ──────────────────────
console.log('\n=== asset refs on every site ===');
for (const s of SITES) {
  const h = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/index.html', 'utf8');
  const refs = h.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
  const bad = refs.length !== 3 || refs.some(r => !/^assets\/(styles\.css|app\.js|config\.js)\?v=[0-9.]+$/.test(r));
  console.log('  ' + s.padEnd(32) + JSON.stringify(refs) + (bad ? '  *** BROKEN ***' : '  OK'));
  if (bad) fail++;
}

// ── 4. config.js must stay per-site and placeholder-free ───────────────────
console.log('\n=== config.js is per-site (never templated) ===');
for (const s of SITES) {
  const p = ROOT + '/Websites/' + s + '/public/dashboard/assets/config.js';
  if (!fs.existsSync(p)) { console.log('  ' + s.padEnd(32) + '*** MISSING ***'); fail++; continue; }
  const t = fs.readFileSync(p, 'utf8');
  const ph = t.match(/\{\{[A-Z_]+\}\}/g) || [];
  const bn = (t.match(/businessName:\s*"([^"]*)"/) || [])[1];
  const ok = ph.length === 0 && t.includes('const DASHBOARD_CONFIG') && !!bn;
  console.log('  ' + s.padEnd(32) + (ok ? 'OK' : '*** BROKEN ***') + '  businessName="' + bn + '"' + (ph.length ? '  PLACEHOLDERS:' + ph.join(',') : ''));
  if (!ok) fail++;
}

console.log('\n' + (fail === 0 ? 'ALL CHECKS PASS' : fail + ' PROBLEM(S)'));
process.exit(fail === 0 ? 0 : 1);
