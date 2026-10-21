const fs = require('fs');
const R = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components';
const F = {
  Team: 'team/TeamSection.tsx',
  TeamPage: 'team/TeamPage.tsx',
  TrustBadges: 'trust/TrustBadges.tsx',
  Partners: 'partners/PartnersStrip.tsx',
  Awards: 'awards/AwardsPress.tsx',
  Areas: 'areas/AreasServed.tsx',
  Process: 'process/ProcessSteps.tsx',
};

for (const [name, f] of Object.entries(F)) {
  const src = fs.readFileSync(R + '/' + f, 'utf8');
  console.log('\n########## ' + name + '  (' + f + ', ' + src.split('\n').length + ' lines) ##########');
  console.log('  justify-center : ' + /justify-center/.test(src));
  console.log('  flex-wrap      : ' + /flex-wrap/.test(src));
  console.log('  rowItemClass   : ' + /function rowItemClass|rowItemClass\(/.test(src));
  console.log('  lgColCount     : ' + /function lgColCount|lgColCount\(/.test(src));
  console.log('  orphan guard   : ' + /last3|last4|% 3|% 4|orphan/.test(src));
  const grids = src.match(/grid-cols[^"'\s]*/g) || [];
  console.log('  grid classes   : ' + (grids.length ? [...new Set(grids)].join(', ') : '(none — flex layout)'));
  // container + item lines
  const lines = src.split('\n');
  lines.forEach((l, i) => {
    if (/flex flex-wrap|grid |justify-center|rowItemClass|tileItemClass|className=\{row|AnimateOnScroll key=\{i\}/.test(l)) {
      console.log('    ' + String(i + 1).padStart(4) + ': ' + l.trim().slice(0, 150));
    }
  });
}
