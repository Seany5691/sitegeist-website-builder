const fs = require('fs')
const path = require('path')

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

const NEW_ENTRIES = `  "beforeAfter": {
    "id": "beforeAfter",
    "tab": "Before / After",
    "icon": "fa-exchange-alt",
    "help": "Before and after comparison images.",
    "fields": [
      { "key": "title", "label": "Section title", "type": "text", "placeholder": "The Transformation" },
      {
        "key": "pairs", "label": "Comparisons", "type": "list", "addLabel": "Add comparison",
        "itemFields": [
          { "key": "before", "label": "Before image", "type": "image" },
          { "key": "after", "label": "After image", "type": "image" },
          { "key": "caption", "label": "Caption (optional)", "type": "text" }
        ]
      }
    ]
  },
  "trustBadges": {
    "id": "trustBadges",
    "tab": "Trust Badges",
    "icon": "fa-shield-alt",
    "help": "Logos and badges that build trust.",
    "fields": [
      { "key": "title", "label": "Section title (optional)", "type": "text" },
      { "key": "showFrame", "label": "Show decorative frame", "type": "toggle", "default": true },
      {
        "key": "size", "label": "Badge size", "type": "select", "default": "medium",
        "options": [
          { "value": "small", "label": "Small" },
          { "value": "medium", "label": "Medium" },
          { "value": "large", "label": "Large" }
        ]
      },
      {
        "key": "badges", "label": "Badges", "type": "list", "addLabel": "Add badge",
        "itemFields": [
          { "key": "label", "label": "Label", "type": "text" },
          { "key": "icon", "label": "Icon (FontAwesome)", "type": "text" },
          { "key": "image", "label": "Logo", "type": "image" },
          { "key": "url", "label": "Link (optional)", "type": "text" }
        ]
      }
    ]
  },
  "serviceAreas": {
    "id": "serviceAreas",
    "tab": "Service Areas",
    "icon": "fa-map-marker-alt",
    "help": "Cities and areas your business serves.",
    "fields": [
      { "key": "title", "label": "Section title (optional)", "type": "text", "mirrorPageContent": true },
      { "key": "subtitle", "label": "Small heading (optional)", "type": "text", "mirrorPageContent": true },
      {
        "key": "areas", "label": "Areas", "type": "list", "addLabel": "Add area",
        "itemFields": [
          { "key": "name", "label": "Area name", "type": "text", "placeholder": "Cape Town" }
        ]
      }
    ]
  },
  "location": {
    "id": "location",
    "tab": "Location / Map",
    "icon": "fa-map",
    "help": "Google Map embed and location details.",
    "fields": [
      { "key": "locationHeading", "label": "Location heading", "type": "text", "placeholder": "Find Us", "mirrorPageContent": true },
      { "key": "mapEmbedUrl", "label": "Map embed URL", "type": "text", "placeholder": "https://www.google.com/maps?q=...&output=embed" },
      { "key": "address", "label": "Full street address", "type": "text" }
    ]
  },
  "vsl": {
    "id": "vsl",
    "tab": "VSL",
    "icon": "fa-film",
    "help": "Video Sales Letter.",
    "fields": [
      { "key": "headline", "label": "Heading", "type": "text" },
      { "key": "subheadline", "label": "Subheading", "type": "text" },
      { "key": "videoUrl", "label": "Video URL", "type": "text", "placeholder": "https://www.youtube.com/embed/..." },
      { "key": "poster", "label": "Poster image", "type": "image" },
      {
        "key": "size", "label": "Video size", "type": "select", "default": "medium",
        "options": [
          { "value": "small", "label": "Small" },
          { "value": "medium", "label": "Medium" },
          { "value": "large", "label": "Large" }
        ]
      },
      { "key": "autoplay", "label": "Autoplay", "type": "toggle", "default": false },
      { "key": "showControls", "label": "Show video controls", "type": "toggle", "default": true },
      { "key": "ctaLabel", "label": "CTA button label", "type": "text" },
      { "key": "ctaUrl", "label": "CTA button link", "type": "text" }
    ]
  }`

for (const site of SITES) {
  const name = site.split('/').pop()
  console.log('=== ' + name + ' ===')

  const p = path.join(site, 'public', 'dashboard', 'assets', 'app.js')
  if (!fs.existsSync(p)) continue
  let app = fs.readFileSync(p, 'utf8')
  const before = app

  if (app.includes('"beforeAfter"')) {
    console.log('  ~ already has entries')
    continue
  }

  // Find the "hours" entry end — it's the last entry in SECTION_FIELDS
  // Look for the pattern: "hours": { ... }  followed by }; (closing SECTION_FIELDS)
  const hoursIdx = app.indexOf('"hours":')
  if (hoursIdx === -1) { console.log('  ✗ hours entry not found'); continue }

  // Find the }; that closes SECTION_FIELDS after "hours"
  // The hours entry ends with },  then there might be a blank line then };
  // Search for the pattern: },\n}; or },\n\n}; or },\n\n  };
  const searchFrom = hoursIdx
  const closeMatch = app.slice(searchFrom).match(/\},\s*\n\s*\}/)
  if (!closeMatch) { console.log('  ✗ SECTION_FIELDS closing not found'); continue }

  const insertPos = searchFrom + closeMatch.index + 2 // after the },\n
  const result = app.slice(0, insertPos) + ',\n' + NEW_ENTRIES + '\n' + app.slice(insertPos)
  // Wait, the closeMatch is `},\n}`  so insertPos is at the `}`. Let me insert before the closing `}`
  // Actually closeMatch[0] is "},\n}" and we want to insert between "," and "}"
  // Let me find the exact position of the `}` of SECTION_FIELDS

  // Better approach: find "hours": ... },  then the next line is };
  // Insert our entries after the },
  const afterHoursClose = searchFrom + closeMatch.index + 2 // position of \n after },
  app = app.slice(0, afterHoursClose) + NEW_ENTRIES + ',\n' + app.slice(afterHoursClose)

  fs.writeFileSync(p, app)
  try { new Function(app); console.log('  ✓ added 5 entries + VALID') } catch (e) {
    console.log('  ✗ ERROR - ' + e.message)
    // Restore from before
    fs.writeFileSync(p, before)
    console.log('  restored')
  }
}

// Sync WB
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
try { new Function(src); console.log('\nWB source: VALID') } catch (e) { console.log('\nWB source: ERROR - ' + e.message) }
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js', src)
console.log('WB: synced')
