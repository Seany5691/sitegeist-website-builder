const fs = require('fs');
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components/features/QuoteSlideIn.tsx';
const s = fs.readFileSync(p, 'utf8');
const i = s.indexOf('<form onSubmit={submit}');
const j = s.indexOf('</form>', i);
console.log('===== QuoteSlideIn form (' + i + ' .. ' + j + ') =====');
console.log(s.slice(i, j + 7));
console.log('\n===== file length: ' + s.split('\n').length + ' lines =====');
