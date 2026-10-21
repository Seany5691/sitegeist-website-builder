'use client'

import type { ComponentType } from 'react'
import { useSiteData } from '@/lib/use-site-data'

import AnnouncementBanner from './AnnouncementBanner'
import StickyCallBar from './StickyCallBar'
import WhatsAppFab from './WhatsAppFab'
import ClickToCallFab from './ClickToCallFab'
import NewsletterPopup from './NewsletterPopup'
import TrustBadges from './TrustBadges'
import AreasServed from './AreasServed'
import BeforeAfter from './BeforeAfter'
import ScrollProgress from './ScrollProgress'
import QuoteSlideIn from './QuoteSlideIn'
import CookieBar from './CookieBar'
import StickyHeader from './StickyHeader'
import PhotoLightbox from './PhotoLightbox'

export type FeaturePlacement =
  | 'top-banner'
  | 'floating'
  | 'inline'
  | 'footer'
  | 'modal'
  | 'header'

type FeatureEntry = {
  id: string
  placement: FeaturePlacement
  Component: ComponentType
}

/**
 * Static registry of every optional module and where it mounts.
 * Order here is the render order inside a placement slot.
 */
const FEATURE_REGISTRY: FeatureEntry[] = [
  { id: 'announcementBanner', placement: 'top-banner', Component: AnnouncementBanner },
  { id: 'scrollProgress', placement: 'header', Component: ScrollProgress },
  { id: 'stickyHeader', placement: 'header', Component: StickyHeader },
        { id: 'photoLightbox', placement: 'inline', Component: PhotoLightbox },
  { id: 'stickyCallBar', placement: 'floating', Component: StickyCallBar },
  { id: 'whatsappFab', placement: 'floating', Component: WhatsAppFab },
  { id: 'clickToCallFab', placement: 'floating', Component: ClickToCallFab },
  { id: 'quoteSlideIn', placement: 'floating', Component: QuoteSlideIn },
  { id: 'newsletterPopup', placement: 'modal', Component: NewsletterPopup },
  { id: 'cookieBar', placement: 'footer', Component: CookieBar },
]

export default function FeatureHost({ placement }: { placement: FeaturePlacement }) {
  const { config } = useSiteData()
  const flags = config?.controls?.features || {}

  const entries = FEATURE_REGISTRY.filter(
    (entry) => entry.placement === placement && flags[entry.id] !== false
  )

  if (entries.length === 0) return null

  return (
    <>
      {entries.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </>
  )
}

export { FEATURE_REGISTRY }
