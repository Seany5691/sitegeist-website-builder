const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/styles.css'
const lines = fs.readFileSync(p, 'utf8').split('\n')

let depth = 0
const anomalies = []
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  // ignore braces inside comments roughly
  const stripped = line.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const ch of stripped) {
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth < 0) {
        anomalies.push({ line: i + 1, depth, text: line.trim() })
        depth = 0 // resync
      }
    }
  }
}
console.log('final depth:', depth)
console.log('anomalies (extra closing braces):', anomalies.length)
for (const a of anomalies.slice(0, 20)) {
  console.log('  line', a.line, 'depth', a.depth, '::', a.text.slice(0, 90))
}

// Also show depth at key landmarks
depth = 0
const marks = ['.gallery-grid', '.gallery-folder', ':has(#leads', '#leads.section.active']
for (let i = 0; i < lines.length; i++) {
  const stripped = lines[i].replace(/\/\*[\s\S]*?\*\//g, '')
  for (const ch of stripped) {
    if (ch === '{') depth++
    else if (ch === '}') depth--
  }
  for (const m of marks) {
    if (lines[i].includes(m)) {
      console.log('  @line', i + 1, m, '=> depth', depth)
    }
  }
}
