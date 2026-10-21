const fs = require('fs')
const paths = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/lib/boilerplate-generator.ts',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze/app/page.tsx',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/app/page.tsx',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop/app/page.tsx',
]
const FROM = "import { FeatureHost } from '@/components/features/FeatureHost'"
const TO = "import FeatureHost from '@/components/features/FeatureHost'"
for (const p of paths) {
  if (!fs.existsSync(p)) { console.log('missing', p); continue }
  const t = fs.readFileSync(p, 'utf8')
  if (t.includes(FROM)) {
    fs.writeFileSync(p, t.split(FROM).join(TO), 'utf8')
    console.log('FIXED', p.split('/').slice(-2).join('/'))
  } else if (t.includes(TO)) {
    console.log('already ok', p.split('/').slice(-2).join('/'))
  } else {
    console.log('no match', p.split('/').slice(-2).join('/'))
  }
}
