'use client'

/**
 * SectionRenderer — composes the homepage from the Section Registry.
 *
 * Reads site-config, resolves which sections are ON, assigns alternating
 * backgrounds from the visible order, and renders each section in turn.
 * Turning a section off removes it and the page closes the gap; the nav is
 * generated from the same list so it never links to a missing section.
 */

import { useSiteData } from '@/lib/use-site-data'
import { renderableSections, renderableNavLinks } from '@/lib/control-flags'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import Services from '@/components/Services'
import ProcessSteps from '@/components/ProcessSteps'
import Gallery from '@/components/Gallery'
import BeforeAfter from '@/components/BeforeAfter'
import LatestWork from '@/components/LatestWork'
import Testimonials from '@/components/Testimonials'
import TrustBadges from '@/components/TrustBadges'
import About from '@/components/About'
import TeamSection from '@/components/TeamSection'
import PartnersStrip from '@/components/PartnersStrip'
import VideoEmbed from '@/components/VideoEmbed'
import AreasServed from '@/components/AreasServed'
import LocationMap from '@/components/LocationMap'
import Contact from '@/components/Contact'
import PricingTable from '@/components/PricingTable'
import Faq from '@/components/Faq'
import BlogStrip from '@/components/BlogStrip'
import AwardsPress from '@/components/AwardsPress'
import SocialFeed from '@/components/SocialFeed'
import NewsletterBlock from '@/components/NewsletterBlock'
import CtaBanner from '@/components/CtaBanner'
import VslPlayer from '@/components/VslPlayer'

const SECTION_COMPONENTS: Record<string, any> = {
  Hero,
  StatsBar,
  Services,
  ProcessSteps,
  Gallery,
  BeforeAfter,
  LatestWork,
  Testimonials,
  TrustBadges,
  About,
  TeamSection,
  PartnersStrip,
  VideoEmbed,
  AreasServed,
  LocationMap,
  Contact,
  PricingTable,
  Faq,
  BlogStrip,
  AwardsPress,
  SocialFeed,
  NewsletterBlock,
  CtaBanner,
  VslPlayer,
}

const BG_STYLE: Record<string, React.CSSProperties> = {
  'section-bg-a': { background: 'var(--color-bg)' },
  'section-bg-b': { background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' },
  'section-bg-solid': { background: 'var(--color-bg)' },
  'section-bg-transparent': { background: 'transparent' },
}

interface SectionRendererProps {
  /** Which page we are rendering (e.g. 'home', 'services', 'about'). */
  pageId?: string
}

export default function SectionRenderer({ pageId = 'home' }: SectionRendererProps) {
  const { config, imageMap } = useSiteData()
  if (!config) return null

  // Per-page sections if configured; otherwise fall back to global list
  let sections = renderableSections(config, imageMap)
  const pageSecs = config?.pageSections?.[pageId]
  if (Array.isArray(pageSecs) && pageSecs.length > 0) {
    const enabled = pageSecs
      .filter((s: any) => s && s.enabled !== false)
      .map((s: any) => String(s.id || s))
    const byId = new Map(sections.map((s: any) => [s.id, s]))
    sections = enabled
      .map((id: string) => byId.get(id))
      .filter(Boolean)
      .map((s: any, i: number) => ({
        ...s,
        backgroundClass: i % 2 === 0 ? 'section-bg-a' : 'section-bg-b',
      }))
  }

  return (
    <>
      {sections.map((s) => {
        const Comp = SECTION_COMPONENTS[s.component]
        if (!Comp) return null
        const style = BG_STYLE[s.backgroundClass] || BG_STYLE['section-bg-a']
        // Hero, CTA and Contact render their own background
        const wrap =
          s.id === 'hero' || s.id === 'cta' || s.id === 'contact'
            ? {
                children: s.id === 'hero'
                  ? <div style={{ paddingTop: 'var(--header-h, 7.5rem)' }}><Comp /></div>
                  : <Comp />,
              }
            : {
                children: (
                  <div style={style}>
                    {/* Gallery homepage settings (folders vs pictures + limits) only apply in home mode */}
                    {s.component === 'Gallery' ? <Comp mode="home" /> : <Comp />}
                  </div>
                ),
              }
        return (
          <div key={s.id} id={s.navAnchor || s.id}>
            {wrap.children}
          </div>
        )
      })}
    </>
  )
}

/**
 * NavLinks — same registry, so a nav link never points at a section
 * that is switched off.
 */
export function NavLinks({ Link }: { Link: any }) {
  const { config } = useSiteData()
  if (!config) return null
  const links = renderableNavLinks(config)
  return (
    <>
      {links.map((l) => (
        <li key={l.id}>
          <Link href={`/#${l.anchor}`}>{l.label}</Link>
        </li>
      ))}
    </>
  )
}
