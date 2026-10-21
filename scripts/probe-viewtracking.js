const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';

console.log('=== view-tracker.ts ===');
console.log(fs.readFileSync(WB + '/templates/backend/lib/view-tracker.ts', 'utf8'));

console.log('\n\n=== middleware.ts (beacon) ===');
console.log(fs.readFileSync(WB + '/templates/backend/middleware.ts', 'utf8'));

console.log('\n\n=== /api/stats/route.ts (how visits are computed) ===');
console.log(fs.readFileSync(WB + '/templates/backend/app/api/stats/route.ts', 'utf8'));
