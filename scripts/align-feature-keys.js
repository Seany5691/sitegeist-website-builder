const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js'
let t = fs.readFileSync(p, 'utf8')

const START = 'const FEATURE_FIELDS = {'
const startIdx = t.indexOf(START)
if (startIdx < 0) { console.log('FEATURE_FIELDS not found'); process.exit(1) }

// Find the matching closing "};\n" after the start
let depth = 0
let endIdx = -1
for (let i = startIdx + START.length - 1; i < t.length; i++) {
  const ch = t[i]
  if (ch === '{') depth++
  else if (ch === '}') {
    depth--
    if (depth === 0) {
      // expect ');' or '};' after
      let j = i + 1
      while (j < t.length && (t[j] === ';' || t[j] === '\n' || t[j] === '\r')) j++
      endIdx = j
      break
    }
  }
}
if (endIdx < 0) { console.log('end not found'); process.exit(1) }

// Field keys are matched to what the feature COMPONENTS read (source of truth
// is templates/backend/lib/feature-registry.ts).
const replacement = `const FEATURE_FIELDS = {
  announcementBanner: [
    { key: 'text', label: 'Message', type: 'text' },
    { key: 'linkUrl', label: 'Link URL', type: 'text' },
    { key: 'linkLabel', label: 'Link label', type: 'text' },
    { key: 'startsAt', label: 'Start date', type: 'date' },
    { key: 'endsAt', label: 'End date', type: 'date' },
    { key: 'dismissible', label: 'Allow dismiss', type: 'toggle' },
    { key: 'bgColor', label: 'Background colour', type: 'color' },
    { key: 'textColor', label: 'Text colour', type: 'color' },
  ],
  stickyCallBar: [
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'whatsapp', label: 'WhatsApp number', type: 'text' },
    { key: 'mapUrl', label: 'Directions URL', type: 'text' },
    { key: 'callLabel', label: 'Call label', type: 'text' },
    { key: 'whatsappLabel', label: 'WhatsApp label', type: 'text' },
    { key: 'directionsLabel', label: 'Directions label', type: 'text' },
  ],
  whatsappFab: [
    { key: 'number', label: 'WhatsApp number', type: 'text' },
    { key: 'greeting', label: 'Pre-filled message', type: 'text' },
    { key: 'position', label: 'Position', type: 'select', options: ['Bottom right', 'Bottom left'] },
  ],
  newsletterPopup: [
    { key: 'headline', label: 'Headline', type: 'text' },
    { key: 'body', label: 'Body', type: 'textarea' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'ctaLabel', label: 'Button label', type: 'text' },
    { key: 'trigger', label: 'Trigger', type: 'select', options: ['scroll', 'delay'] },
    { key: 'scrollPercent', label: 'Scroll %', type: 'number' },
    { key: 'delaySeconds', label: 'Delay seconds', type: 'number' },
    { key: 'oncePerVisitor', label: 'Show once per visitor', type: 'toggle' },
  ],
  clickToCallFab: [
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'position', label: 'Position', type: 'select', options: ['Bottom right', 'Bottom left'] },
  ],
  trustBadges: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'badges', label: 'Badges', type: 'list', itemFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'url', label: 'Link', type: 'text' },
    ]},
  ],
  areasServedStrip: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'areas', label: 'Areas', type: 'list', itemFields: [
      { key: 'name', label: 'Area name', type: 'text' },
    ]},
  ],
  photoLightbox: [],
  beforeAfter: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'pairs', label: 'Image pairs', type: 'list', itemFields: [
      { key: 'before', label: 'Before image', type: 'image' },
      { key: 'after', label: 'After image', type: 'image' },
      { key: 'caption', label: 'Caption', type: 'text' },
    ]},
  ],
  stickyHeader: [
    { key: 'shrinkHeight', label: 'Shrink height (px)', type: 'number' },
    { key: 'showLogoWhenShrunk', label: 'Keep logo visible when shrunk', type: 'toggle' },
  ],
  scrollProgress: [
    { key: 'color', label: 'Bar colour', type: 'color' },
    { key: 'thickness', label: 'Thickness (px)', type: 'number' },
  ],
  quoteSlideIn: [
    { key: 'title', label: 'Panel title', type: 'text' },
    { key: 'body', label: 'Body', type: 'textarea' },
    { key: 'buttonLabel', label: 'Trigger button label', type: 'text' },
    { key: 'recipient', label: 'Send enquiries to', type: 'text' },
  ],
  cookieBar: [
    { key: 'text', label: 'Message', type: 'textarea' },
    { key: 'acceptLabel', label: 'Accept button label', type: 'text' },
    { key: 'privacyUrl', label: 'Privacy policy URL', type: 'text' },
  ],
}`

t = t.slice(0, startIdx) + replacement + t.slice(endIdx)
fs.writeFileSync(p, t, 'utf8')
console.log('FEATURE_FIELDS rewritten with registry-aligned keys')

// verify
const check = fs.readFileSync(p, 'utf8')
for (const k of ['startsAt', 'endsAt', 'dismissible', 'mapUrl', 'number', 'greeting', 'ctaLabel', 'oncePerVisitor', 'showLogoWhenShrunk', 'recipient']) {
  console.log(' ', k, check.includes(`key: '${k}'`) ? 'OK' : 'MISSING')
}
// stale keys gone from FEATURE_FIELDS region?
const seg = check.slice(check.indexOf('const FEATURE_FIELDS'), check.indexOf('const FEATURE_DEFS'))
for (const k of ['startDate', 'allowDismiss', 'directionsUrl', 'showOnce', 'barColor', 'sendTo']) {
  console.log('  stale', k, seg.includes(`key: '${k}'`) ? 'STILL PRESENT' : 'removed')
}
