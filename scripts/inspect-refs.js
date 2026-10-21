const fs = require('fs')
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const paths = [
  ROOT + '/Website Builder/templates/dashboard/index.html',
  ROOT + '/Websites/missions_ablaze/public/dashboard/index.html',
  ROOT + '/Websites/mamma_mia_cakes_and_catering/public/dashboard/index.html',
  ROOT + '/Websites/tammy_s_sticker_shop/public/dashboard/index.html',
]

for (const p of paths) {
  if (!fs.existsSync(p)) { console.log('missing', p); continue }
  const t = fs.readFileSync(p, 'utf8')
  const refs = t.match(/(?:href|src)="[^"]+"/g) || []
  console.log('--- ' + p.split('/').slice(-3).join('/') + ' ---')
  refs.slice(0, 6).forEach((r) => console.log('   ', r))
}
