const fs = require('fs')
const path = require('path')

const root = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites'
const sites = ['mamma_mia_cakes_and_catering', 'missions_ablaze', 'tammy_s_sticker_shop']
const files = ['site-config.json', 'public/site-config.json']

// Targeted mojibake reversals (UTF-8-read-as-Windows-1252 damage).
const MAP = {
  'â€”': '—', // em dash  (shown as a-circumflex euro n-rdquo in some renderings)
  'â€“': '–', // en dash
  'â€”': '—',
  'â„¢': '™',
  'â€™': '\u2019', // right single quote / apostrophe
  'â€œ': '\u201c', // left double quote
  'â€\u009d': '\u201d', // right double quote
  'â€\u0098': '\u2018', // left single quote
  'â€¦': '…', // ellipsis
  'â€¢': '•', // bullet
  'â†’': '→', // rightwards arrow
  'â†“': '↓',
  'Â·': '·', // middle dot
  'Â°': '°', // degree
  'Â±': '±',
  'Â½': '½',
  'Â©': '©',
  'Â®': '®',
  'â‚¬': '€', // euro
  'Â£': '£',
  'Â¥': '¥',
  'Â§': '§',
  'Â': '', // stray broken prefix
  'Ã': 'À', // fallback, refined below
}

// More precise: decode sequences of (C3 A2)(E2 82 AC)(E2 80 xx) etc.
// Build a decoder that walks char-by-char and unmangles only mojibake runs.
function unmangleRun(s) {
  // Interpret these chars as their latin1 byte values and decode as UTF-8
  const bytes = []
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i)
    if (cp > 0xff) {
      // multi-byte char inside a mojibake run -> its UTF-8 bytes ARE the original latin1 bytes
      const b = Buffer.from(String.fromCodePoint(cp), 'utf8')
      for (const x of b) bytes.push(x)
    } else {
      bytes.push(cp)
    }
  }
  return Buffer.from(bytes).toString('utf8')
}

// Find runs that start with 'â' (U+00E2) or 'Ã' (U+00C3) and are mojibake-ish
const RUN = /[âÂ][^\s\"{}\[\],:]{0,6}/g

function repair(text) {
  return text.replace(RUN, (m) => {
    try {
      const out = unmangleRun(m)
      // Only accept if it produced sane printable text (no control chars, no 'â')
      if (out && !out.includes('â') && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(out)) {
        return out
      }
    } catch (e) { /* fall through */ }
    return m
  })
}

for (const s of sites) {
  for (const f of files) {
    const p = path.join(root, s, f)
    if (!fs.existsSync(p)) continue
    let buf = fs.readFileSync(p)
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.slice(3)
    const before = buf.toString('utf8')
    const aBefore = (before.match(/â/g) || []).length
    const after = repair(before)
    const aAfter = (after.match(/â/g) || []).length
    let valid = false
    try { JSON.parse(after); valid = true } catch (e) { valid = false }
    console.log(
      (valid && aAfter < aBefore ? 'FIXED' : 'SKIP '),
      s + '/' + f,
      ' â', aBefore, '->', aAfter,
      ' validJson=' + valid,
      ' lenDelta=' + (after.length - before.length)
    )
    if (valid && aAfter < aBefore) {
      fs.writeFileSync(p, after, 'utf8')
    }
  }
}

console.log('\n=== verify ===')
for (const s of sites) {
  const p = path.join(root, s, 'public/site-config.json')
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  console.log(s, ' â=' + (t.match(/â/g) || []).length, ' Ã=' + (t.match(/Ã/g) || []).length)
}
