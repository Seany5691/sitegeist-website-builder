const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js'
let t = fs.readFileSync(p, 'utf8')
const before = t.length
// Restore the newline(s) that the FEATURE_FIELDS rewrite consumed
t = t.replace(/\}(function |const |let |async |class )/g, '}\n\n$1')
fs.writeFileSync(p, t, 'utf8')
console.log('restored; delta', t.length - before)
