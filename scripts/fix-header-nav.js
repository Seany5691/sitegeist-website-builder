const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const targets = [
  ROOT + '/Websites/missions_ablaze/components/Header.tsx',
  ROOT + '/Websites/mamma_mia_cakes_and_catering/components/Header.tsx',
  ROOT + '/Websites/tammy_s_sticker_shop/components/Header.tsx',
]

const OLD_BLOCK = `  const navLinks = [
    { href: '/', label: nav.home || 'Home' },
    { href: '/services', label: nav.services || 'Services' },
    { href: '/portfolio', label: nav.portfolio || 'Portfolio' },
    { href: '/about', label: nav.about || 'About' },
    { href: '/contact', label: nav.contact || 'Contact' },
  ]`

const NEW_BLOCK = `  // Nav is generated from the Section Registry so it only shows what is switched on.
  const navLinks = siteNavLinks(config)`

for (const p of targets) {
  if (!fs.existsSync(p)) { console.log('missing', p); continue }
  let t = fs.readFileSync(p, 'utf8')

  // 1. Replace the hardcoded navLinks block
  if (t.includes(OLD_BLOCK)) {
    t = t.split(OLD_BLOCK).join(NEW_BLOCK)
    console.log('nav block replaced:', path.basename(path.dirname(p)))
  } else {
    // try looser match
    const re = /const navLinks = \[[\s\S]*?\]\s*\n/
    if (re.test(t)) {
      t = t.replace(re, NEW_BLOCK + '\n')
      console.log('nav block replaced (loose):', path.basename(path.dirname(p)))
    } else {
      console.log('nav block NOT FOUND:', path.basename(path.dirname(p)))
    }
  }

  // 2. Ensure the import exists
  if (!t.includes('siteNavLinks')) {
    console.log('  !! siteNavLinks not referenced after replace')
  }
  if (!t.includes("from '@/lib/control-flags'")) {
    // add the import after the first import line
    t = t.replace(/(^import[^\n]*\n)/m, `$1import { siteNavLinks } from '@/lib/control-flags'\n`)
    console.log('  import added')
  }

  // 3. Ensure `config` is available in the component. Most headers use useSiteData
  //    or receive props — check and patch if needed.
  if (!/const\s*\{\s*config/.test(t) && !/config\s*[:=]/.test(t)) {
    // add useSiteData after 'use client' / imports
    if (!t.includes("use-site-data")) {
      t = t.replace(/(^import[^\n]*\n)/m, `$1import { useSiteData } from '@/lib/use-site-data'\n`)
    }
    t = t.replace(/(export default function Header\(\)[^{]*\{\n)/, `$1  const { config } = useSiteData()\n`)
    console.log('  useSiteData added')
  }

  fs.writeFileSync(p, t, 'utf8')
}

// 4. Update the generator's generateHeader to emit the same
const genPath = ROOT + '/Website Builder/lib/boilerplate-generator.ts'
let g = fs.readFileSync(genPath, 'utf8')
const GEN_OLD = "    '  const navLinks = [',"
if (g.includes("const navLinks = [")) {
  // replace the generator's hardcoded nav lines
  g = g.replace(
    /const navLinks = \[[\s\S]{0,400}?\];/,
    `// Nav generated from the Section Registry — only shows what is switched on.\\n  const navLinks = siteNavLinks(config)`
  )
  // ensure the generated file imports siteNavLinks
  if (!g.includes('siteNavLinks')) {
    console.log('generator: siteNavLinks reference not added automatically')
  }
  fs.writeFileSync(genPath, g, 'utf8')
  console.log('generator Header updated')
} else {
  console.log('generator: navLinks block not found')
}
