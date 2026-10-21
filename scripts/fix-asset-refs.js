const fs = require('fs')
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const paths = [
  ROOT + '/Website Builder/templates/dashboard/index.html',
  ROOT + '/Websites/missions_ablaze/public/dashboard/index.html',
  ROOT + '/Websites/mamma_mia_cakes_and_catering/public/dashboard/index.html',
  ROOT + '/Websites/tammy_s_sticker_shop/public/dashboard/index.html',
]

for (const p of paths) {
  if (!fs.existsSync(p)) continue
  let t = fs.readFileSync(p, 'utf8')

  // Two identical app.js scripts ended up at the bottom — the FIRST is config.js
  // (it must load before app.js). Restore the intended order.
  t = t.replace(
    '<script src="assets/app.js?v=9.0"></script>\n  <script src="assets/app.js?v=9.0"></script>',
    '<script src="assets/config.js?v=9.0"></script>\n  <script src="assets/app.js?v=9.0"></script>'
  )
  // If they are on the same line or differently spaced, fix by position
  if ((t.match(/assets\/app\.js\?v=9\.0/g) || []).length === 2) {
    const firstIdx = t.indexOf('assets/app.js?v=9.0')
    if (firstIdx >= 0) {
      t = t.slice(0, firstIdx) + 'assets/config.js?v=9.0' + t.slice(firstIdx + 'assets/app.js?v=9.0'.length)
    }
  }

  fs.writeFileSync(p, t, 'utf8')
  const refs = t.match(/(?:href|src)="assets\/[^"]+"/g) || []
  console.log(p.split('/').slice(-3).join('/'))
  refs.forEach((r) => console.log('   ', r))
}
