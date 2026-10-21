const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components';
const files = {
  Process: 'process/ProcessSteps.tsx',
  LatestWork: 'gallery/LatestWork.tsx',
  Partners: 'partners/PartnersStrip.tsx',
  Awards: 'awards/AwardsPress.tsx',
  Social: 'social/SocialFeed.tsx',
  Newsletter: 'newsletter/NewsletterBlock.tsx',
  Team: 'team/TeamSection.tsx',
  Stats: 'stats/StatsBar.tsx',
  Video: 'video/VideoEmbed.tsx',
  Areas: 'areas/AreasServed.tsx',
  Hours: 'hours/BusinessHours.tsx',
  Location: 'location/LocationMap.tsx',
  Trust: 'trust/TrustBadges.tsx',
  BeforeAfter: 'gallery/BeforeAfter.tsx',
  BlogStrip: 'blog/BlogStrip.tsx'
};
for (const [n, f] of Object.entries(files)) {
  const src = fs.readFileSync(ROOT + '/' + f, 'utf8');
  const lines = src.split('\n');
  console.log('##### ' + n + '  (' + f + ', ' + lines.length + ' lines)');
  // top 25 lines
  console.log('  --- head ---');
  console.log(lines.slice(0, 22).map(l => '  ' + l).join('\n'));
  console.log('  --- end head ---');
  const ds = src.match(/config(?:\?)?\.[a-zA-Z0-9_.]+/g) || [];
  console.log('  config refs: ' + [...new Set(ds)].join(' '));
  const g = src.match(/grid-cols[^"'\s]*/g) || [];
  console.log('  grids: ' + [...new Set(g)].join(','));
  const ret = src.match(/return null|return \(null|return;|\.length === 0|!items|if \(![a-zA-Z]/g) || [];
  console.log('  empty guards: ' + ret.join(' | '));
  console.log('');
}
