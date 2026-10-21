'use client'

import { useEffect, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { Icon } from './icons'

const FEATURE_ID = 'stickyCallBar'

export default function StickyCallBar() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const phone = data.phone || config?.contact?.phone || ''
  const whatsapp = data.whatsapp || ''
  const mapUrl = data.mapUrl || ''

  const hasCall = Boolean(phone)
  const hasWhats = Boolean(whatsapp)
  const hasMap = Boolean(mapUrl)
  const buttonCount = [hasCall, hasWhats, hasMap].filter(Boolean).length

  // Reserve space so the bar never permanently covers page content.
  useEffect(() => {
    if (!enabled || !mounted || buttonCount === 0) return
    const style = document.createElement('style')
    style.setAttribute('data-feature', FEATURE_ID)
    style.textContent =
      'body { padding-bottom: calc(4.5rem + env(safe-area-inset-bottom)); }' +
      '@media (min-width: 768px) { body { padding-bottom: 0; } }'
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [enabled, mounted, buttonCount])

  if (!enabled || !mounted || buttonCount === 0) return null

  const btnBase =
    'flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-3 rounded-full text-sm font-semibold transition-all duration-200'

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
        boxShadow: '0 -4px 24px color-mix(in srgb, var(--color-text) 8%, transparent)',
      }}
    >
      <div className="flex items-stretch gap-2 px-3 pt-2.5 pb-2.5">
        {hasCall && (
          <a
            href={`tel:${String(phone).replace(/\s+/g, '')}`}
            className={btnBase}
            style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
          >
            <Icon name="phone" size={18} />
            <span>{data.callLabel || 'Call Now'}</span>
          </a>
        )}
        {hasWhats && (
          <a
            href={`https://wa.me/${String(whatsapp).replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btnBase}
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))',
              color: 'var(--color-primary)',
            }}
          >
            <Icon name="whatsapp" size={18} />
            <span>{data.whatsappLabel || 'WhatsApp'}</span>
          </a>
        )}
        {hasMap && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnBase}
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))',
              color: 'var(--color-primary)',
            }}
          >
            <Icon name="navigation" size={18} />
            <span>{data.directionsLabel || 'Directions'}</span>
          </a>
        )}
      </div>
    </div>
  )
}
