const fs = require('fs')
const paths = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze/components/PageHero.tsx',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/components/PageHero.tsx',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop/components/PageHero.tsx',
]
for (const p of paths) {
  if (!fs.existsSync(p)) { console.log('missing', p); continue }
  let t = fs.readFileSync(p, 'utf8')
  const before = t
  t = t.replace(/page:\s*'services'\s*\|\s*'portfolio'\s*\|\s*'about'\s*\|\s*'contact'/, 'page: string')
  if (t !== before) {
    fs.writeFileSync(p, t, 'utf8')
    console.log('FIXED', p.split('/').slice(-3).join('/'))
  } else {
    const m = t.match(/page\??:.*/)
    console.log('nochange', p.split('/').slice(-3).join('/'), '::', m ? m[0].slice(0, 90) : 'no match')
  }
}
