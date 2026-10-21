const fs = require('fs')
const path = require('path')

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

// The new entries as proper JS object literal (not JSON)
const NEW_ENTRIES = `
  "beforeAfter": {
    id: 'beforeAfter',
    tab: 'Before / After',
    icon: 'fa-exchange-alt',
    help: 'Before and after comparison images.',
    fields: [
      { key: 'title', label: 'Section title', type: 'text', placeholder: 'The Transformation' },
      {
        key: 'pairs', label: 'Comparisons', type: 'list', addLabel: 'Add comparison',
        itemFields: [
          { key: 'before', label: 'Before image', type: 'image' },
          { key: 'after', label: 'After image', type: 'image' },
          { key: 'caption', label: 'Caption (optional)', type: 'text' },
        ],
      },
    ],
  },
  "trustBadges": {
    id: 'trustBadges',
    tab: 'Trust Badges',
    icon: 'fa-shield-alt',
    help: 'Logos and badges that build trust.',
    fields: [
      { key: 'title', label: 'Section title (optional)', type: 'text' },
      { key: 'showFrame', label: 'Show decorative frame', type: 'toggle', default: true },
      {
        key: 'size', label: 'Badge size', type: 'select', default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
      {
        key: 'badges', label: 'Badges', type: 'list', addLabel: 'Add badge',
        itemFields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'icon', label: 'Icon (FontAwesome)', type: 'text' },
          { key: 'image', label: 'Logo', type: 'image' },
          { key: 'url', label: 'Link (optional)', type: 'text' },
        ],
      },
    ],
  },
  "serviceAreas": {
    id: 'serviceAreas',
    tab: 'Service Areas',
    icon: 'fa-map-marker-alt',
    help: 'Cities and areas your business serves.',
    fields: [
      { key: 'title', label: 'Section title (optional)', type: 'text', mirrorPageContent: true },
      { key: 'subtitle', label: 'Small heading (optional)', type: 'text', mirrorPageContent: true },
      {
        key: 'areas', label: 'Areas', type: 'list', addLabel: 'Add area',
        itemFields: [
          { key: 'name', label: 'Area name', type: 'text', placeholder: 'Cape Town' },
        ],
      },
    ],
  },
  "location": {
    id: 'location',
    tab: 'Location / Map',
    icon: 'fa-map',
    help: 'Google Map embed and location details.',
    fields: [
      { key: 'locationHeading', label: 'Location heading', type: 'text', placeholder: 'Find Us', mirrorPageContent: true },
      { key: 'mapEmbedUrl', label: 'Map embed URL', type: 'text', placeholder: 'https://www.google.com/maps?q=...&output=embed' },
      { key: 'address', label: 'Full street address', type: 'text' },
    ],
  },
  "vsl": {
    id: 'vsl',
    tab: 'VSL',
    icon: 'fa-film',
    help: 'Video Sales Letter.',
    fields: [
      { key: 'headline', label: 'Heading', type: 'text' },
      { key: 'subheadline', label: 'Subheading', type: 'text' },
      { key: 'videoUrl', label: 'Video URL', type: 'text', placeholder: 'https://www.youtube.com/embed/...' },
      { key: 'poster', label: 'Poster image', type: 'image' },
      {
        key: 'size', label: 'Video size', type: 'select', default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
      { key: 'autoplay', label: 'Autoplay', type: 'toggle', default: false },
      { key: 'showControls', label: 'Show video controls', type: 'toggle', default: true },
      { key: 'ctaLabel', label: 'CTA button label', type: 'text' },
      { key: 'ctaUrl', label: 'CTA button link', type: 'text' },
    ],
  },
`

for (const site of SITES) {
  const name = site.split('/').pop()
  const p = path.join(site, 'public', 'dashboard', 'assets', 'app.js')
  if (!fs.existsSync(p)) continue

  let app = fs.readFileSync(p, 'utf8')
  const before = app

  if (app.includes('"beforeAfter"')) {
    // Already has the entries — need to fix the syntax
    // Find and replace the broken entries
    const sfStart = app.indexOf('"beforeAfter":')
    const sfEnd = app.indexOf('};', app.indexOf('"vsl":'))
    if (sfStart > -1 && sfEnd > -1) {
      app = app.slice(0, sfStart) + NEW_ENTRIES.trim() + '\n' + app.slice(sfEnd)
      console.log(name + ': replaced broken entries')
    }
  } else {
    // Insert before the closing of SECTION_FIELDS
    const hoursEnd = app.indexOf('"hours":')
    const afterHours = app.indexOf('};', hoursEnd)
    if (afterHours > -1) {
      app = app.slice(0, afterHours) + NEW_ENTRIES.trim() + '\n' + app.slice(afterHours)
      console.log(name + ': inserted new entries')
    }
  }

  if (app !== before) {
    fs.writeFileSync(p, app)
    try { new Function(app); console.log(name + ': VALID') } catch (e) {
      console.log(name + ': ERROR - ' + e.message)
      // Find the error line
      const lines = app.split('\n')
      for (let i = 0; i < lines.length; i++) {
        try { new Function(lines.slice(0, i + 1).join('\n') + '}') } catch (e2) {
          if (e2.message.includes('Unexpected token')) {
            console.log('  Around line ' + (i + 1) + ': ' + lines[i].trim().slice(0, 100))
            break
          }
        }
      }
    }
  }
}

// Sync WB
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js', src)
console.log('WB: synced')
