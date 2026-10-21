/**
 * Stage 1 deliverable: generate the Mamma & Mia logo preview set.
 * Run: node scripts/logo-preview.js
 */
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

// Load the TS engine at runtime
function loadTs(p) {
  const src = fs.readFileSync(p, 'utf8')
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  })
  const m = { exports: {} }
  new Function('require', 'module', 'exports', out.outputText)(require, m, m.exports)
  return m.exports
}

const engine = loadTs(path.join(__dirname, '..', 'lib', 'logo-engine.ts'))
const { generateLogoSet } = engine

const input = {
  businessName: 'Mamma & Mia Cakes And Catering',
  industry: 'Bakery',
  tagline: 'Homemade Happiness',
  palette: {
    primary: '#3C1414',   // deep maroon
    secondary: '#6B3A2E', // warm brown
    accent: '#FFD700',    // gold
    bg: '#FFF8DC',        // cream
    text: '#2C1810',
  },
  fontClass: 'serif',
}

const set = generateLogoSet(input)
console.log('seeded monogram / primary name check:')
console.log('  primary  :', engine.primaryName(input.businessName))
console.log('  secondary:', engine.secondaryName(input.businessName, engine.primaryName(input.businessName)))
console.log('  monogram :', engine.monogram(engine.primaryName(input.businessName)))

const outDir = path.join(__dirname, '..', 'temp', 'logo-preview', 'mamma-mia')
fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(path.join(outDir, 'logo-mark.svg'), set.mark, 'utf8')
fs.writeFileSync(path.join(outDir, 'logo-horizontal.svg'), set.horizontal, 'utf8')
fs.writeFileSync(path.join(outDir, 'logo-stacked.svg'), set.stacked, 'utf8')
fs.writeFileSync(path.join(outDir, 'icon.svg'), set.faviconSvg, 'utf8')
console.log('SVG files written to', outDir)

// PNG renders via sharp
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'))
const jobs = [
  { file: 'logo-mark.svg', out: 'icon-192.png', size: 192 },
  { file: 'logo-mark.svg', out: 'icon-512.png', size: 512 },
  { file: 'logo-mark.svg', out: 'apple-icon.png', size: 180 },
  { file: 'logo-horizontal.svg', out: 'logo-horizontal.png', width: 1840 },
  { file: 'logo-stacked.svg', out: 'logo-stacked.png', width: 1240 },
]

async function render() {
  for (const j of jobs) {
    const src = fs.readFileSync(path.join(outDir, j.file))
    const img = sharp(src, { density: 300 })
    if (j.size) {
      await img.resize(j.size, j.size).png().toFile(path.join(outDir, j.out))
    } else {
      await img.resize({ width: j.width }).png().toFile(path.join(outDir, j.out))
    }
    console.log('  rendered', j.out)
  }

  // Preview page
  const read = (f) => fs.readFileSync(path.join(outDir, f), 'utf8')
  const b64 = (f) => fs.readFileSync(path.join(outDir, f)).toString('base64')
  const png = (f) => `data:image/png;base64,${b64(f)}`

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Mamma & Mia — Logo Preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; font-family: Georgia, serif; background:#1a1a1a; color:#f5f5f5; padding:40px; }
  h1 { font-weight:600; letter-spacing:.5px; margin:0 0 6px; }
  h2 { font-weight:600; letter-spacing:2px; text-transform:uppercase; font-size:13px; opacity:.6; margin:44px 0 16px; }
  .lede { opacity:.65; margin:0 0 36px; font-size:15px; }
  .row { display:flex; gap:20px; flex-wrap:wrap; }
  .card { background:#fff; border-radius:14px; padding:26px; flex:1 1 300px; min-width:280px; }
  .card.dark { background:#3C1414; }
  .card.cream { background:#FFF8DC; }
  .card.gold { background:#FFD700; }
  .card.grey { background:#e8e8e8; }
  .card h3 { margin:0 0 16px; font-size:11px; letter-spacing:2px; text-transform:uppercase; opacity:.55; font-weight:600; }
  .card.dark h3, .card.cream h3 { opacity:.75; }
  .card img { max-width:100%; height:auto; display:block; }
  .icons { display:flex; gap:22px; align-items:flex-end; flex-wrap:wrap; }
  .icon-item { text-align:center; }
  .icon-item img { display:block; margin:0 auto 8px; border-radius:12px; }
  .icon-item span { font-size:11px; opacity:.6; letter-spacing:1px; }
  .wa { background:#fff; border-radius:16px; overflow:hidden; max-width:430px; box-shadow:0 18px 50px rgba(0,0,0,.5); }
  .wa-img { width:100%; height:210px; object-fit:cover; display:block; background:#FFF8DC; }
  .wa-body { padding:16px 18px; color:#111; font-family:-apple-system,Segoe UI,Roboto,sans-serif; }
  .wa-domain { font-size:12px; color:#8a8a8a; margin:0 0 4px; letter-spacing:.3px; }
  .wa-title { font-size:17px; font-weight:600; margin:0 0 5px; color:#1a1a1a; }
  .wa-desc { font-size:13.5px; color:#666; margin:0; line-height:1.45; }
  .note { margin-top:44px; padding:18px 22px; border-left:3px solid #FFD700; background:rgba(255,215,0,.08); border-radius:8px; font-size:13.5px; line-height:1.7; opacity:.9; }
</style></head>
<body>
<h1>Mamma &amp; Mia Cakes And Catering</h1>
<p class="lede">Deterministic logo set — identical input always produces an identical result.</p>

<h2>Horizontal lockup</h2>
<div class="row">
  <div class="card cream"><h3>On cream</h3><img src="${png('logo-horizontal.png')}" alt="Horizontal"></div>
  <div class="card"><h3>On white</h3><img src="${png('logo-horizontal.png')}" alt="Horizontal"></div>
</div>

<h2>Stacked lockup</h2>
<div class="row">
  <div class="card"><h3>On white</h3><img src="${png('logo-stacked.png')}" alt="Stacked"></div>
  <div class="card cream"><h3>On cream</h3><img src="${png('logo-stacked.png')}" alt="Stacked"></div>
  <div class="card dark"><h3>On maroon</h3><img src="${png('logo-stacked.png')}" alt="Stacked"></div>
</div>

<h2>Mark only &amp; favicon set</h2>
<div class="row">
  <div class="card">
    <h3>Icon set</h3>
    <div class="icons">
      <div class="icon-item"><img src="${png('icon-512.png')}" width="128" height="128" alt=""><span>512</span></div>
      <div class="icon-item"><img src="${png('icon-192.png')}" width="80" height="80" alt=""><span>192</span></div>
      <div class="icon-item"><img src="${png('apple-icon.png')}" width="64" height="64" alt=""><span>180</span></div>
      <div class="icon-item"><img src="icon.svg" width="48" height="48" alt=""><span>32 SVG</span></div>
      <div class="icon-item"><img src="icon.svg" width="24" height="24" alt=""><span>16</span></div>
    </div>
  </div>
  <div class="card grey"><h3>Mark — grey background</h3><img src="${png('logo-horizontal.png')}" alt=""></div>
</div>

<h2>WhatsApp / social link preview</h2>
<div class="row">
  <div class="wa">
    <img class="wa-img" src="${png('logo-horizontal.png')}" alt="">
    <div class="wa-body">
      <p class="wa-domain">mammamiacakesandcatering.vercel.app</p>
      <p class="wa-title">Mamma &amp; Mia Cakes &amp; Catering | Bakery North West</p>
      <p class="wa-desc">Custom cakes, event catering and personalised service. Handcrafted with love for your special moments.</p>
    </div>
  </div>
</div>

<div class="note">
  <strong>Determinism:</strong> seeded from <code>businessName + industry + palette</code>. Rebuilding this site
  tomorrow produces byte-identical SVG. <br>
  <strong>Next:</strong> if you approve this look, Stage 2 wires the engine into the builder —
  upload precedence (uploaded &gt; scraped &gt; generated), favicon generation for every site, and
  OG image with the logo.
</div>
</body></html>`

  fs.writeFileSync(path.join(outDir, 'preview.html'), html, 'utf8')
  console.log('preview.html written')
}

render().catch((e) => {
  console.error(e)
  process.exit(1)
})
