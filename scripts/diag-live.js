const BASE = 'https://missions-ablaze.sitespire.co.za'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

;(async () => {
  const r = await fetch(BASE + '/', {
    headers: { 'user-agent': UA, accept: 'text/html' },
    cache: 'no-store',
  })
  const html = await r.text()
  console.log('homepage bytes:', html.length)
  console.log('')

  // What is actually rendered?
  const probes = [
    ['SectionRenderer', /SectionRenderer/],
    ['FeatureHost', /FeatureHost/],
    ['AnnouncementBanner', /announcement|bullhorn|holiday/i],
    ['StickyCallBar', /sticky-call|call-bar|fa-phone-volume/i],
    ['WhatsAppFab', /wa\.me|whatsapp/i],
    ['ScrollProgress', /scroll-progress|scrollProgress/],
    ['CookieBar', /cookie-consent|cookie_consent/],
    ['QuoteSlideIn', /quote-slide|request a quote|fa-file-signature/i],
    ['TeamSection', /team-section|TeamSection|Our Team/i],
    ['BlogStrip', /blog-strip|BlogStrip|Latest.*[Pp]osts/i],
    ['nav links', /nav-link|<nav/],
    ['header element', /<header/i],
  ]
  for (const [name, re] of probes) {
    console.log('  ' + name.padEnd(18), re.test(html) ? 'PRESENT' : 'absent')
  }

  // Extract nav links
  console.log('\n=== nav links rendered ===')
  const navMatches = html.match(/href="\/?#[^"]*"[^>]*>[^<]{1,40}</g) || []
  navMatches.slice(0, 15).forEach((m) => console.log('  ', m.replace(/\s+/g, ' ')))

  // Extract all section ids present
  console.log('\n=== section ids rendered ===')
  const ids = [...html.matchAll(/id="([a-zA-Z][a-zA-Z0-9-]*)"/g)].map((m) => m[1])
  const uniq = [...new Set(ids)]
  console.log('  ', uniq.filter((i) => /^(hero|services|gallery|testimonials|about|team|faq|cta|pricing|blog|stats|process|trust|partners|areas|location|hours|awards|social|newsletter|beforeAfter|latestWork|video|instagram|serviceAreas)/i.test(i)).join(', ') || '(none matched section pattern)')
  console.log('  total ids:', uniq.length)

  // Look for the feature host markers
  console.log('\n=== FeatureHost placement markers ===')
  for (const p of ['top-banner', 'header', 'footer', 'floating', 'modal']) {
    console.log('  ' + p.padEnd(12), html.includes(p) ? 'present' : 'absent')
  }
})()
