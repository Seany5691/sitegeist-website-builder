const fs = require('fs')
const base = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components/features/'

// ClickToCall: stack above WhatsApp when on the right (WhatsApp = 5rem)
{
  const p = base + 'ClickToCallFab.tsx'
  let t = fs.readFileSync(p, 'utf8')
  t = t.replace(
    "bottom: 'calc(5rem + env(safe-area-inset-bottom))',",
    "bottom: isLeft ? 'calc(5rem + env(safe-area-inset-bottom))' : 'calc(10.5rem + env(safe-area-inset-bottom))',"
  )
  fs.writeFileSync(p, t, 'utf8')
  console.log('ClickToCallFab stacked')
}

// QuoteSlideIn: stack above both (16rem clears WhatsApp 5rem + ClickToCall 10.5rem)
{
  const p = base + 'QuoteSlideIn.tsx'
  let t = fs.readFileSync(p, 'utf8')
  const re = /bottom: 'calc\([0-9.]+rem \+ env\(safe-area-inset-bottom\)\)'/
  if (re.test(t)) {
    t = t.replace(re, "bottom: 'calc(16rem + env(safe-area-inset-bottom))'")
    fs.writeFileSync(p, t, 'utf8')
    console.log('QuoteSlideIn stacked')
  } else {
    console.log('QuoteSlideIn: no bottom match')
  }
}

console.log('')
for (const f of ['WhatsAppFab.tsx', 'ClickToCallFab.tsx', 'QuoteSlideIn.tsx', 'StickyCallBar.tsx']) {
  const t = fs.readFileSync(base + f, 'utf8')
  const m = t.match(/bottom:[^,\n]+/)
  console.log(' ', f.padEnd(22), '->', m ? m[0].trim() : 'n/a')
}
