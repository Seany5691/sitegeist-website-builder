const fs = require('fs')
const d = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard'
const t = fs.readFileSync(d + '/index.html', 'utf8')
console.log('contentMaster section:', t.includes('id="contentMaster"'))
console.log('pageComposer section:', t.includes('id="pageComposer"'))
console.log('navigation section:', t.includes('id="navigation"'))
console.log('contentMasterContainer:', t.includes('contentMasterContainer'))
console.log('pageComposerContainer:', t.includes('pageComposerContainer'))
console.log('nav contentMaster:', t.includes('data-section="contentMaster"'))
console.log('nav pageComposer:', t.includes('data-section="pageComposer"'))
console.log('nav navigation:', t.includes('data-section="navigation"'))

const app = fs.readFileSync(d + '/assets/app.js', 'utf8')
console.log('initContentMaster:', app.includes('initContentMaster'))
console.log('initPageComposer:', app.includes('initPageComposer'))
console.log('initDashboardExtras:', app.includes('__initDashboardExtras'))

const enh = fs.readFileSync(d + '/assets/dashboard-enhancements.js', 'utf8')
console.log('renderContentMasterList:', enh.includes('renderContentMasterList'))
console.log('renderNavigationEditor:', enh.includes('renderNavigationEditor'))

const pc = fs.readFileSync(d + '/assets/page-composer.js', 'utf8')
console.log('renderPageComposer:', pc.includes('renderPageComposer'))
