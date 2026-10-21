'use client'

import { useEffect, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { Icon } from './icons'

const FEATURE_ID = 'cookieBar'
const CONSENT_KEY = 'cookie_consent'

export default function CookieBar() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    try {
      if (window.localStorage.getItem(CONSENT_KEY) === 'accepted') return
    } catch {
      /* storage unavailable — show anyway */
    }
    setVisible(true)
  }, [enabled])

  if (!enabled || !visible) return null

  const accept = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(CONSENT_KEY, 'accepted')
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[58] transition-transform duration-300"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 96%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
        boxShadow: '0 -4px 24px color-mix(in srgb, var(--color-text) 8%, transparent)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Icon name="cookie" size={22} className="hidden sm:block flex-none" style={{ color: 'var(--color-primary)' }} />
          <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-muted)' }}>
            {data.text || 'We use cookies to improve your experience and understand our traffic.'}
            {data.privacyUrl && (
              <>
                {' '}
                <a
                  href={data.privacyUrl}
                  className="underline underline-offset-2 font-medium transition-opacity duration-200 hover:opacity-80"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Privacy policy
                </a>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={accept}
            className="flex-none h-11 px-6 rounded-full text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
            style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
          >
            {data.acceptLabel || 'Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
