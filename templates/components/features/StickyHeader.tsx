'use client'

import { useEffect } from 'react'
import { useSiteData } from '@/lib/use-site-data'

const FEATURE_ID = 'stickyHeader'

/**
 * Sticky Header — condenses the site header on scroll.
 *
 * Targets the REAL header markup (verified against components/Header.tsx):
 *   <header className="fixed ... z-50 ...">
 *     <div className="max-w-7xl ...">
 *       <div className="text-center py-3">          <- brand row
 *         <Link className="text-2xl font-bold">...   <- business name
 *       </div>
 *       <nav className="hidden md:flex ... py-3">   <- nav row
 *       <div className="md:hidden flex ... py-2">   <- mobile row
 *
 * `shrinkHeight` (px) controls how compact it gets: it drives the brand
 * font size and the row padding, so moving the slider in the dashboard has a
 * visible effect. The header has no fixed height of its own — the rows do —
 * so we shrink the rows rather than forcing a height on <header>.
 */
export default function StickyHeader() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  // Target compactness. 60 = default and looks clearly shrunk; 40 = very tight;
  // 100 = barely shrinks. Clamped so it can never look broken.
  const raw = Number(data.shrinkHeight)
  const shrinkHeight = Number.isFinite(raw) && raw > 0 ? Math.max(36, Math.min(120, raw)) : 60
  const showLogoWhenShrunk = data.showLogoWhenShrunk !== false

  // Derive the visual effect from shrinkHeight so the slider is meaningful.
  const brandFontSize = Math.max(14, Math.min(24, Math.round(shrinkHeight * 0.30)))
  const rowPad = Math.max(3, Math.min(12, Math.round(shrinkHeight / 12)))

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let headerEl: HTMLElement | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    const startedAt = Date.now()
    const MAX_WAIT = 3000
    const POLL_MS = 100

    const apply = () => {
      if (!headerEl) return
      headerEl.classList.toggle('header-shrunk', window.scrollY > 60)
    }

    const onScroll = () => apply()

    const attach = () => {
      if (cancelled) return
      headerEl = document.querySelector('header')
      if (headerEl) {
        window.addEventListener('scroll', onScroll, { passive: true })
        apply()
        return
      }
      if (Date.now() - startedAt < MAX_WAIT) {
        timer = setTimeout(attach, POLL_MS)
      }
    }

    attach()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      if (headerEl) headerEl.classList.remove('header-shrunk')
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const style = document.createElement('style')
    style.setAttribute('data-feature', FEATURE_ID)
    style.textContent = `
      header {
        transition: background-color 250ms ease, box-shadow 250ms ease;
      }
      header > div > div.text-center {
        transition: padding 250ms ease;
      }
      header nav.py-3,
      header > div > nav {
        transition: padding 250ms ease;
      }
      header > div > div.md\\:hidden {
        transition: padding 250ms ease;
      }
      header a.text-2xl {
        transition: font-size 250ms ease, letter-spacing 250ms ease;
      }

      header.header-shrunk {
        background-color: var(--color-bg) !important;
        box-shadow: 0 6px 24px color-mix(in srgb, var(--color-text) 12%, transparent) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
      }
      header.header-shrunk > div > div.text-center {
        padding-top: ${rowPad}px !important;
        padding-bottom: ${rowPad}px !important;
      }
      header.header-shrunk nav.py-3,
      header.header-shrunk > div > nav {
        padding-top: ${rowPad}px !important;
        padding-bottom: ${rowPad}px !important;
      }
      header.header-shrunk > div > div.md\\:hidden {
        padding-top: ${rowPad}px !important;
        padding-bottom: ${rowPad}px !important;
      }
      header.header-shrunk a.text-2xl {
        font-size: ${brandFontSize}px !important;
        letter-spacing: -0.01em !important;
      }
      ${showLogoWhenShrunk ? '' : `header.header-shrunk a.text-2xl { opacity: 0.55; }`}
    `
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [enabled, brandFontSize, rowPad, showLogoWhenShrunk])

  return null
}
