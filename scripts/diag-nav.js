const fs = require('fs');
const R = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder';

const files = [
  'process/ProcessSteps.tsx', 'gallery/LatestWork.tsx', 'partners/PartnersStrip.tsx',
  'awards/AwardsPress.tsx', 'social/SocialFeed.tsx', 'newsletter/NewsletterBlock.tsx',
  'stats/StatsBar.tsx', 'video/VideoEmbed.tsx', 'hours/BusinessHours.tsx'
];
console.log('=== section anchors ===');
for (const f of files) {
  const s = fs.readFileSync(R + '/templates/components/' + f, 'utf8');
  const m = s.match(/<section id="([^"]+)"/);
  console.log('  ' + f.padEnd(34) + (m ? m[1] : 'NO-ANCHOR'));
}

console.log('\n=== control-flags.ts (full) ===');
console.log(fs.readFileSync(R + '/templates/backend/lib/control-flags.ts', 'utf8'));

console.log('\n=== Header.tsx (missions_ablaze) nav block ===');
const h = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze/components/Header.tsx', 'utf8');
console.log(h);
