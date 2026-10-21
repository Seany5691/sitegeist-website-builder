/**
 * Feature Registry — optional premium modules a client can switch on/off.
 *
 * Each feature has its own edit panel in the dashboard's Features tab. A feature
 * that needs images gets an upload slot; one that needs copy gets text fields.
 * Every feature inherits the site's CSS variables so it never looks like a
 * bolted-on third-party widget.
 */

export type FeatureFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'toggle'
  | 'date'
  | 'url'
  | 'phone'
  | 'image'
  | 'list'
  | 'color'

export interface FeatureField {
  key: string
  label: string
  type: FeatureFieldType
  placeholder?: string
  help?: string
  /** For 'list' — the shape of each row */
  itemFields?: Array<{ key: string; label: string; type: FeatureFieldType; placeholder?: string }>
  default?: unknown
}

export interface FeatureDef {
  id: string
  label: string
  description: string
  /** Icon class (Font Awesome) for the card */
  icon: string
  /** Component name rendered on the site */
  component: string
  /** Tier for build priority */
  tier: 1 | 2 | 3
  /** Shipped on by default */
  defaultOn: boolean
  /** Editing fields */
  fields: FeatureField[]
  /** Where the feature renders on the page */
  placement: 'top-banner' | 'floating' | 'inline' | 'footer' | 'modal' | 'header'
  notes?: string
}

export const FEATURES: FeatureDef[] = [
  /* ── Tier 1 ─────────────────────────────────────────────────────────── */
  {
    id: 'announcementBanner',
    label: 'Announcement / Holiday Banner',
    description: 'Dismissible bar at the top of the site. Schedule start/end dates so holiday closures set and forget.',
    icon: 'fa-bullhorn',
    component: 'AnnouncementBanner',
    tier: 1,
    defaultOn: false,
    placement: 'top-banner',
    fields: [
      { key: 'text', label: 'Message', type: 'text', placeholder: 'We are closed 24 Dec – 2 Jan. Happy holidays!' },
      { key: 'linkUrl', label: 'Link URL', type: 'url', placeholder: 'https://… (optional)' },
      { key: 'linkLabel', label: 'Link label', type: 'text', placeholder: 'See our holiday hours' },
      { key: 'startsAt', label: 'Start date', type: 'date' },
      { key: 'endsAt', label: 'End date', type: 'date' },
      { key: 'dismissible', label: 'Allow visitors to dismiss', type: 'toggle', default: true },
      { key: 'bgColor', label: 'Background colour', type: 'color' },
      { key: 'textColor', label: 'Text colour', type: 'color' },
    ],
    notes: 'When start/end dates are blank the banner is always live.',
  },
  {
    id: 'stickyCallBar',
    label: 'Sticky "Call Now" Bar',
    description: 'Bottom bar on mobile with Call · WhatsApp · Directions. Thumb-reachable, the highest-converting local action.',
    icon: 'fa-phone-volume',
    component: 'StickyCallBar',
    tier: 1,
    defaultOn: true,
    placement: 'floating',
    fields: [
      { key: 'phone', label: 'Phone number', type: 'phone' },
      { key: 'whatsapp', label: 'WhatsApp number', type: 'phone' },
      { key: 'mapUrl', label: 'Directions URL', type: 'url', placeholder: 'https://maps.google.com/…' },
      { key: 'callLabel', label: 'Call button label', type: 'text', default: 'Call Now' },
      { key: 'whatsappLabel', label: 'WhatsApp label', type: 'text', default: 'WhatsApp' },
      { key: 'directionsLabel', label: 'Directions label', type: 'text', default: 'Directions' },
    ],
  },
  {
    id: 'whatsappFab',
    label: 'WhatsApp Button',
    description: 'Floating WhatsApp button that opens a chat with a pre-filled greeting.',
    icon: 'fa-whatsapp',
    component: 'WhatsAppFab',
    tier: 1,
    defaultOn: true,
    placement: 'floating',
    fields: [
      { key: 'number', label: 'WhatsApp number', type: 'phone' },
      { key: 'greeting', label: 'Pre-filled message', type: 'text', placeholder: 'Hi, I found you online and would like to enquire.' },
      { key: 'position', label: 'Position', type: 'text', placeholder: 'bottom-right / bottom-left' },
    ],
  },
  {
    id: 'newsletterPopup',
    label: 'Newsletter / Lead Popup',
    description: 'Modal that appears once per visitor after a scroll or delay. Builds a mailing list without being annoying.',
    icon: 'fa-envelope-open-text',
    component: 'NewsletterPopup',
    tier: 1,
    defaultOn: false,
    placement: 'modal',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Get 10% off your first order' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Join our list for seasonal specials and news.' },
      { key: 'image', label: 'Image (optional)', type: 'image' },
      { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Sign me up' },
      { key: 'trigger', label: 'Trigger', type: 'text', placeholder: 'scroll / delay' },
      { key: 'scrollPercent', label: 'Scroll % (if scroll trigger)', type: 'number', default: 50 },
      { key: 'delaySeconds', label: 'Delay seconds (if delay trigger)', type: 'number', default: 8 },
      { key: 'oncePerVisitor', label: 'Show only once per visitor', type: 'toggle', default: true },
    ],
  },
  {
    id: 'clickToCallFab',
    label: 'Click-to-Call Button',
    description: 'Floating phone button. Turn off if the sticky call bar is already covering calls.',
    icon: 'fa-phone',
    component: 'ClickToCallFab',
    tier: 1,
    defaultOn: false,
    placement: 'floating',
    fields: [
      { key: 'phone', label: 'Phone number', type: 'phone' },
      { key: 'label', label: 'Label', type: 'text', default: 'Call' },
      { key: 'position', label: 'Position', type: 'text', placeholder: 'bottom-left / bottom-right' },
    ],
    notes: 'Redundant when the Sticky Call Bar is on — default off.',
  },
  {
    id: 'trustBadges',
    label: 'Trust Badges Strip',
    description: 'Certifications, memberships, insurance and guarantees. Converts sceptical buyers.',
    icon: 'fa-shield-alt',
    component: 'TrustBadges',
    tier: 1,
    defaultOn: false,
    placement: 'inline',
    fields: [
      { key: 'title', label: 'Section title', type: 'text', default: 'Why people trust us' },
      {
        key: 'badges', label: 'Badges', type: 'list',
        itemFields: [
          { key: 'label', label: 'Label', type: 'text', placeholder: 'Fully insured' },
          { key: 'icon', label: 'Icon', type: 'text', placeholder: 'fa-shield-alt' },
          { key: 'url', label: 'Link (optional)', type: 'url' },
        ],
      },
    ],
  },
  {
    id: 'areasServedStrip',
    label: 'Areas We Serve Strip',
    description: 'City and suburb chips. Local search and AI answer fuel.',
    icon: 'fa-map-marker-alt',
    component: 'AreasServed',
    tier: 1,
    defaultOn: true,
    placement: 'inline',
    fields: [
      { key: 'title', label: 'Section title', type: 'text', default: 'Areas we serve' },
      {
        key: 'areas', label: 'Areas', type: 'list',
        itemFields: [{ key: 'name', label: 'Area name', type: 'text', placeholder: 'Tongaat' }],
      },
    ],
  },
  {
    id: 'photoLightbox',
    label: 'Photo Lightbox',
    description: 'Click any gallery photo to view it full-screen with keyboard navigation.',
    icon: 'fa-expand',
    component: 'PhotoLightbox',
    tier: 1,
    defaultOn: true,
    placement: 'inline',
    fields: [],
    notes: 'Operates on the existing gallery. No configuration needed.',
  },
  {
    id: 'beforeAfter',
    label: 'Before / After Slider',
    description: 'Drag-to-compare transformation slider. Renovations, dentistry, cleaning, restoration.',
    icon: 'fa-exchange-alt',
    component: 'BeforeAfter',
    tier: 1,
    defaultOn: false,
    placement: 'inline',
    fields: [
      { key: 'title', label: 'Section title', type: 'text', default: 'See the difference' },
      {
        key: 'pairs', label: 'Image pairs', type: 'list',
        itemFields: [
          { key: 'before', label: 'Before image', type: 'image' },
          { key: 'after', label: 'After image', type: 'image' },
          { key: 'caption', label: 'Caption', type: 'text' },
        ],
      },
    ],
  },

  /* ── Tier 2 (selected additions) ────────────────────────────────────── */
  {
    id: 'stickyHeader',
    label: 'Sticky Header (shrink on scroll)',
    description: 'The header condenses once the visitor scrolls, keeping navigation reachable.',
    icon: 'fa-window-maximize',
    component: 'StickyHeader',
    tier: 2,
    defaultOn: true,
    placement: 'header',
    fields: [
      { key: 'shrinkHeight', label: 'Shrunk height (px)', type: 'number', default: 60 },
      { key: 'showLogoWhenShrunk', label: 'Keep logo visible when shrunk', type: 'toggle', default: true },
    ],
  },
  {
    id: 'scrollProgress',
    label: 'Scroll Progress Indicator',
    description: 'Thin bar at the top showing reading progress. Editorial polish.',
    icon: 'fa-grip-lines',
    component: 'ScrollProgress',
    tier: 2,
    defaultOn: false,
    placement: 'header',
    fields: [
      { key: 'color', label: 'Bar colour', type: 'color' },
      { key: 'thickness', label: 'Thickness (px)', type: 'number', default: 3 },
    ],
  },
  {
    id: 'quoteSlideIn',
    label: 'Request a Quote — Slide-in Panel',
    description: 'Slide-out enquiry form from the side. Less intrusive than a popup, still converts.',
    icon: 'fa-file-signature',
    component: 'QuoteSlideIn',
    tier: 2,
    defaultOn: false,
    placement: 'floating',
    fields: [
      { key: 'title', label: 'Panel title', type: 'text', default: 'Request a quote' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Tell us what you need and we will get back to you.' },
      { key: 'buttonLabel', label: 'Trigger button label', type: 'text', default: 'Get a Quote' },
      { key: 'recipient', label: 'Send enquiries to', type: 'text', placeholder: 'Your notification email' },
    ],
  },
  {
    id: 'cookieBar',
    label: 'Cookie / Privacy Consent Bar',
    description: 'Required when analytics are on. Lets visitors accept before tracking.',
    icon: 'fa-cookie-bite',
    component: 'CookieBar',
    tier: 2,
    defaultOn: false,
    placement: 'footer',
    fields: [
      { key: 'text', label: 'Message', type: 'textarea', default: 'We use cookies to improve your experience and understand our traffic.' },
      { key: 'acceptLabel', label: 'Accept button label', type: 'text', default: 'Accept' },
      { key: 'privacyUrl', label: 'Privacy policy URL', type: 'url', default: '/privacy' },
    ],
    notes: 'Turn on automatically when analytics is enabled.',
  },
]

/* ────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────────── */

export function featureById(id: string): FeatureDef | undefined {
  return FEATURES.find((f) => f.id === id)
}

export function featuresByTier(tier: 1 | 2 | 3): FeatureDef[] {
  return FEATURES.filter((f) => f.tier === tier)
}

export function defaultFeatureFlags(): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const f of FEATURES) out[f.id] = f.defaultOn
  return out
}

/** Features that render in the same slot, for grouped rendering. */
export function featuresByPlacement(
  flags: Record<string, boolean>
): Record<string, FeatureDef[]> {
  const out: Record<string, FeatureDef[]> = {}
  for (const f of FEATURES) {
    if (flags[f.id] === false) continue
    if (!out[f.placement]) out[f.placement] = []
    out[f.placement].push(f)
  }
  return out
}

/** Empty default values for a feature's edit form. */
export function defaultFeatureValues(f: FeatureDef): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of f.fields) {
    if (field.default !== undefined) out[field.key] = field.default
    else if (field.type === 'toggle') out[field.key] = false
    else if (field.type === 'number') out[field.key] = 0
    else if (field.type === 'list') out[field.key] = []
    else out[field.key] = ''
  }
  return out
}
