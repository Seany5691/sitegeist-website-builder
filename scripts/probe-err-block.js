const fs = require('fs');
const COMP = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components';
for (const [name, path, around] of [
  ['NewsletterBlock', COMP + '/newsletter/NewsletterBlock.tsx', 102],
  ['QuoteSlideIn', COMP + '/features/QuoteSlideIn.tsx', 249],
]) {
  const lines = fs.readFileSync(path, 'utf8').split('\n');
  console.log('\n===== ' + name + ' lines ' + (around - 18) + '-' + (around + 12) + ' =====');
  for (let i = around - 18; i <= around + 12 && i < lines.length; i++) {
    console.log(String(i + 1).padStart(4) + ': ' + lines[i]);
  }
}
