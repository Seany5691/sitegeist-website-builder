const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/lib/boilerplate-generator.ts'
let t = fs.readFileSync(p, 'utf8')

const OLD = "    'export default function Header() {',\n    '  const [isScrolled, setIsScrolled] = useState(false)',"
const NEW = [
  "    \"import { useSiteData } from '@/lib/use-site-data'\",",
  "    \"import { siteNavLinks } from '@/lib/control-flags'\",",
  "    '',",
  "    'export default function Header() {',",
  "    '  const { config } = useSiteData()',",
  "    '  const [isScrolled, setIsScrolled] = useState(false)',",
].join('\n')

if (t.includes(OLD)) {
  t = t.replace(OLD, NEW)
  fs.writeFileSync(p, t, 'utf8')
  console.log('generator header imports added')
} else {
  console.log('anchor not found — showing nearby context')
  const i = t.indexOf('export default function Header()')
  if (i >= 0) console.log(t.slice(i - 300, i + 200))
}

const check = fs.readFileSync(p, 'utf8')
console.log('useSiteData in generator:', check.includes("useSiteData"))
console.log('siteNavLinks in generator:', check.includes('siteNavLinks'))
