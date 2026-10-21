const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const BACK = WB + '/templates/backend';

console.log('=== duplicate message keys ===');
for (const f of ['app/api/save-config/route.ts', 'app/api/site-data/route.ts', 'app/api/upload/route.ts']) {
  const lines = fs.readFileSync(BACK + '/' + f, 'utf8').split('\n');
  console.log('\n--- ' + f + ' ---');
  lines.forEach((l, i) => {
    if (/message:/.test(l) || /success: false/.test(l) || /status: \d+/.test(l)) {
      console.log(String(i + 1).padStart(5) + ': ' + l.slice(0, 150));
    }
  });
}

console.log('\n\n=== uploadImage signature ===');
const bs = fs.readFileSync(BACK + '/lib/blob-storage.ts', 'utf8');
const i = bs.indexOf('export async function uploadImage');
console.log(bs.slice(i, i + 1200));
