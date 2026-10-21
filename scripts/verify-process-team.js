/**
 * Verify JOB 1/2 edits: process variants + team centering.
 * Run: node scripts/verify-process-team.js
 */
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const ROOT = path.join(__dirname, '..')

const files = [
  'templates/components/process/ProcessSteps.tsx',
  'templates/components/team/TeamSection.tsx',
  'templates/components/team/TeamPage.tsx',
]

console.log('=== TSX diagnostics (transpileModule, jsx: Preserve) ===')
let totalDiags = 0
for (const rel of files) {
  const p = path.join(ROOT, rel)
  const src = fs.readFileSync(p, 'utf8')
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
    fileName: rel,
  })
  const diags = out.diagnostics || []
  totalDiags += diags.length
  console.log(`${rel}: ${diags.length} diagnostic(s)`)
  for (const d of diags) {
    const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null
    const where = pos ? `:${pos.line + 1}:${pos.character + 1}` : ''
    console.log(`  ${rel}${where} -> ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`)
  }
}
console.log(`TOTAL diagnostics: ${totalDiags}`)

console.log('\n=== Hardcoded hex colours / font-family check ===')
const hexRe = /#[0-9a-fA-F]{3,8}\b/g
const fontCssRe = /font-family\s*:\s*([^;'"}]+)/gi
const fontJsxRe = /fontFamily:\s*'([^']+)'|fontFamily:\s*"([^"]+)"/g
let issues = 0
for (const rel of files) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8')
  const srcNoComments = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

  const hexMatches = srcNoComments.match(hexRe) || []
  for (const m of hexMatches) {
    console.log(`HEX in ${rel}: ${m}`)
    issues++
  }

  let fm
  while ((fm = fontCssRe.exec(srcNoComments)) !== null) {
    const value = fm[1].trim()
    if (!/^var\(--font-(heading|body)\)$/.test(value)) {
      console.log(`FONT in ${rel}: font-family: ${value}`)
      issues++
    }
  }
  while ((fm = fontJsxRe.exec(srcNoComments)) !== null) {
    const value = (fm[1] || fm[2] || '').trim()
    if (!/^var\(--font-(heading|body)\)$/.test(value)) {
      console.log(`FONT in ${rel}: fontFamily: ${value}`)
      issues++
    }
  }
}
console.log(issues === 0 ? 'clean — no hardcoded hex / font-family' : `${issues} issue(s)`)

console.log('\n=== processLayout is the only new data key ===')
const procSrc = fs.readFileSync(path.join(ROOT, files[0]), 'utf8')
const configKeyRe = /config\??\.([A-Za-z0-9_]+)/g
const keys = new Set()
let mk
while ((mk = configKeyRe.exec(procSrc)) !== null) keys.add(mk[1])
console.log('config keys read by ProcessSteps:', [...keys].join(', '))
const allowed = new Set(['process', 'processTitle', 'processSubtitle', 'pageContent', 'processLayout'])
const extra = [...keys].filter((k) => !allowed.has(k))
console.log(extra.length === 0 ? 'ok — no unexpected config keys' : `UNEXPECTED: ${extra.join(', ')}`)
if (extra.length) issues++

console.log('\n=== Team centering strategy (1..5 members) ===')
// Mirror of the layout helpers in the team components.
function lgColCount(n) {
  if (n <= 1) return 1
  if (n === 2) return 2
  if (n === 3) return 3
  if (n === 4) return 4
  return n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 3
}
function rowItemClass(n) {
  if (n <= 1) return 'w-full max-w-xs'
  if (n === 2) return 'w-full max-w-xs sm:max-w-sm sm:w-[calc(50%_-_1rem)]'
  return lgColCount(n) === 4
    ? 'w-full max-w-xs sm:max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-xs sm:max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md lg:w-[calc(33.333%_-_1.334rem)]'
}
for (let n = 1; n <= 5; n++) {
  const cols = lgColCount(n)
  const rows = Math.ceil(n / cols)
  const last = n - (rows - 1) * cols
  console.log(`  ${n} member(s): lg ${cols}-up -> ${rows} row(s), last row ${last} card(s) centred via justify-center`)
  console.log(`    item classes: ${rowItemClass(n)}`)
}
const teamSrcs = [files[1], files[2]].map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8'))
for (const [i, src] of teamSrcs.entries()) {
  const has = src.includes('flex flex-wrap justify-center gap-8') && src.includes('w-full max-w-xs')
  console.log(`  ${files[i + 1]}: ${has ? 'count-aware centered layout present' : 'MISSING count-aware layout'}`)
  if (!has) issues++
}

console.log('\n=== RESULT ===')
console.log(totalDiags === 0 && issues === 0 ? 'PASS' : `FAIL (diags=${totalDiags}, issues=${issues})`)
process.exit(totalDiags === 0 && issues === 0 ? 0 : 1)
