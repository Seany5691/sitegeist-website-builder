const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

console.log('=== headers use siteNavLinks? ===');
for (const s of SITES) {
  const p = ROOT + '/Websites/' + s + '/components/Header.tsx';
  const src = fs.readFileSync(p, 'utf8');
  const uses = src.includes("siteNavLinks") && src.includes("from '@/lib/control-flags'");
  console.log('  ' + s.padEnd(32) + (uses ? 'YES' : '*** NO — needs rewrite ***'));
}

console.log('\n=== sync control-flags.ts to 3 sites ===');
const src = fs.readFileSync(WB + '/templates/backend/lib/control-flags.ts', 'utf8');
if (!src.includes('SECTION_NAV_ANCHORS')) throw new Error('SECTION_NAV_ANCHORS missing from template!');
for (const s of SITES) {
  const dst = ROOT + '/Websites/' + s + '/lib/control-flags.ts';
  fs.writeFileSync(dst, src, 'utf8');
  const check = fs.readFileSync(dst, 'utf8');
  console.log('  ' + s.padEnd(32) + 'written  ' + (check.includes('SECTION_NAV_ANCHORS') ? 'OK' : 'FAIL') + '  ' + check.length + ' bytes');
}

console.log('\n=== control-flags syntax (tsc-less sanity: exports present) ===');
for (const k of ['SECTION_NAV_ANCHORS', 'siteNavLinks', 'resolveControls', 'renderableSections', 'isFeatureEnabled']) {
  console.log('  ' + k.padEnd(24) + (src.includes('export function ' + k) || src.includes('export const ' + k) ? 'exported' : '*** MISSING ***'));
}

console.log('\n=== anchor id cross-check vs section components ===');
const ANCHORS = {
  process: 'process', latestWork: 'latest-work', partners: 'partners', awards: 'awards',
  instagram: 'social', newsletter: 'newsletter', statsBar: 'stats', video: 'videos', hours: 'hours'
};
const FILES = {
  process: 'process/ProcessSteps.tsx', latestWork: 'gallery/LatestWork.tsx',
  partners: 'partners/PartnersStrip.tsx', awards: 'awards/AwardsPress.tsx',
  instagram: 'social/SocialFeed.tsx', newsletter: 'newsletter/NewsletterBlock.tsx',
  statsBar: 'stats/StatsBar.tsx', video: 'video/VideoEmbed.tsx', hours: 'hours/BusinessHours.tsx'
};
for (const [id, anchor] of Object.entries(ANCHORS)) {
  const f = WB + '/templates/components/' + FILES[id];
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/<section id="([^"]+)"/);
  const actual = m ? m[1] : 'NONE';
  console.log('  ' + id.padEnd(14) + 'want=#' + anchor.padEnd(14) + 'got=#' + actual.padEnd(14) + (actual === anchor ? 'MATCH' : '*** MISMATCH ***'));
}
