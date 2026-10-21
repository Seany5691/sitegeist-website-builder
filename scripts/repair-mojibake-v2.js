/**
 * Definitive mojibake repair for site-config / image-map JSON.
 *
 * Background: UTF-8 text was read as Windows-1252 and re-saved, so a real
 * em-dash (—, bytes E2 80 94) became the 3 chars â € " (E2/80/94 as separate
 * chars). A first repair pass replaced the leading â with U+FFFD, leaving
 * [U+FFFD][U+20AC][X] patterns behind.
 *
 * This pass reconstructs the original byte triple E2 80 b (where b is the
 * Windows-1252 code of X) and decodes it as UTF-8.
 */
const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites'
const SITES = ['mamma_mia_cakes_and_catering', 'missions_ablaze', 'tammy_s_sticker_shop']
const FILES = ['public/site-config.json', 'site-config.json', 'public/image-map.json', 'image-map.json', 'public/seo.json']

// Windows-1252 chars that appear as the 3rd char of a mojibake triple, -> their byte
const C1252 = {
  '\u201D': 0x94, // "
  '\u201C': 0x93, // "
  '\u2122': 0x99, // ™
  '\u0153': 0x9c, // œ
  '\u00A6': 0xa6, // ¦
  '\u0192': 0x83, // ƒ
  '\u2022': 0x95, // •
  '\u2020': 0x86, // †
  '\u2021': 0x87, // ‡
  '\u2030': 0x89, // ‰
  '\u2039': 0x8b, // ‹
  '\u203A': 0x9b, // ›
  '\u2013': 0x96, // –
  '\u2014': 0x97, // —
  '\u2018': 0x91, // '
  '\u2019': 0x92, // '
  '\u20AC': 0x80, // €
  '\u00BD': 0xbd, // ½
  '\u00BC': 0xbc, // ¼
  '\u00BE': 0xbe, // ¾
  '\u00A9': 0xa9, // ©
  '\u00AE': 0xae, // ®
  '\u00B0': 0xb0, // °
  '\u00B1': 0xb1, // ±
  '\u00B5': 0xb5, // µ
  '\u00B7': 0xb7, // ·
  '\u00A3': 0xa3, // £
  '\u00A5': 0xa5, // ¥
  '\u00A7': 0xa7, // §
  '\u00AB': 0xab, // «
  '\u00BB': 0xbb, // »
  '\u2026': 0xa6, // … (often from 0x85 too)
}

function decodeTriple(bytes) {
  try {
    return Buffer.from(bytes).toString('utf8')
  } catch {
    return null
  }
}

function repairString(s) {
  if (typeof s !== 'string') return s
  let out = ''
  let i = 0
  while (i < s.length) {
    const c0 = s[i]
    const c1 = s[i + 1]
    const c2 = s[i + 2]
    // Pattern A: [U+00E2 | U+FFFD] [U+20AC] [c2]  -> UTF-8 of E2 80 b
    const leadByte = c0 === '\u00E2' ? 0xe2 : c0 === '\uFFFD' ? 0xe2 : null
    if (leadByte !== null && c1 === '\u20AC' && c2 && C1252[c2] !== undefined) {
      const decoded = decodeTriple([leadByte, 0x80, C1252[c2]])
      if (decoded && decoded.length >= 1 && decoded !== '\uFFFD') {
        out += decoded
        i += 3
        continue
      }
    }
    // Pattern B: standalone U+FFFD left over -> drop it (replacement char)
    if (c0 === '\uFFFD') {
      i++
      continue
    }
    out += c0
    i++
  }
  return out
}

function deepRepair(v) {
  if (typeof v === 'string') return repairString(v)
  if (Array.isArray(v)) return v.map(deepRepair)
  if (v && typeof v === 'object') {
    const o = {}
    for (const [k, val] of Object.entries(v)) o[repairString(k)] = deepRepair(val)
    return o
  }
  return v
}

for (const s of SITES) {
  for (const f of FILES) {
    const p = path.join(ROOT, s, f)
    if (!fs.existsSync(p)) continue
    let buf = fs.readFileSync(p)
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.slice(3)
    const raw = buf.toString('utf8')
    let obj
    try { obj = JSON.parse(raw) } catch (e) { console.log('SKIP (bad json)', s + '/' + f); continue }

    const before = raw
    const repaired = deepRepair(obj)
    const after = JSON.stringify(repaired, null, 2)

    const badBefore = (before.match(/â|\uFFFD/g) || []).length
    const badAfter = (after.match(/â|\uFFFD/g) || []).length

    if (badBefore > 0 || badAfter < badBefore) {
      fs.writeFileSync(p, after, 'utf8')
      console.log('REPAIRED', s + '/' + f, '  bad', badBefore, '->', badAfter)
    } else {
      console.log('clean   ', s + '/' + f)
    }
  }
}

console.log('\n=== spot-check service descriptions ===')
const p = path.join(ROOT, 'missions_ablaze', 'public/site-config.json')
const obj = JSON.parse(fs.readFileSync(p, 'utf8'))
for (const s of obj.services || []) {
  console.log('-', s.title)
  console.log(' ', JSON.stringify(s.description))
}
