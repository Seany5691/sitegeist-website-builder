const fs = require('fs');
const R = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components';
const files = {
  Process: 'process/ProcessSteps.tsx',
  LatestWork: 'gallery/LatestWork.tsx',
  Partners: 'partners/PartnersStrip.tsx',
  Awards: 'awards/AwardsPress.tsx',
  Social: 'social/SocialFeed.tsx',
  Newsletter: 'newsletter/NewsletterBlock.tsx',
  Stats: 'stats/StatsBar.tsx',
  Video: 'video/VideoEmbed.tsx',
  Hours: 'hours/BusinessHours.tsx',
};
for (const [n, f] of Object.entries(files)) {
  console.log('\n==========================================================');
  console.log('== ' + n + '  (' + f + ')');
  console.log('==========================================================');
  console.log(fs.readFileSync(R + '/' + f, 'utf8'));
}
