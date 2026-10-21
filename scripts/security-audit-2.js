const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITE = ROOT + '/Websites/missions_ablaze';
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return '<<missing ' + p + '>>'; } };

console.log('=== A. /api/blob-urls — what does it expose? ===');
console.log(read(SITE + '/app/api/blob-urls/route.ts'));

console.log('\n\n=== B. /api/site-data — what does it return? ===');
console.log(read(SITE + '/app/api/site-data/route.ts'));

console.log('\n\n=== C. /api/upload — file validation ===');
console.log(read(SITE + '/app/api/upload/route.ts'));
