'use client'

import { useEffect, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { useFloatingRightOffset, useFloatingLeftOffset } from '@/lib/floating-stack'
import { Icon } from './icons'

const FEATURE_ID = 'clickToCallFab'

export default function ClickToCallFab() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const phone = data.phone || config?.contact?.phone || ''
  const label = data.label || 'Call'
  const isLeft = String(data.position || 'bottom-left').toLowerCase().includes('left')

  // Stack offset: joins the right-hand stack when positioned right,
  // otherwise sits on the left baseline.
  const rightBottom = useFloatingRightOffset('clickToCall')
  const leftBottom = useFloatingLeftOffset('clickToCall')

  if (!enabled || !mounted || !phone) return null

  const telHref = `tel:${String(phone).replace(/\s+/g, '')}`

  return (
    <a
      href={telHref}
      aria-label={label}
      className="fixed z-50 inline-flex items-center gap-2.5 rounded-full font-semibold text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{
        bottom: isLeft ? leftBottom : rightBottom,
        [isLeft ? 'left' : 'right']: '1.25rem',
        minHeight: '3.25rem',
        padding: '0 1.35rem',
        background: 'var(--color-primary-cta)',
        color: 'var(--color-bg)',
        boxShadow:
          '0 10px 28px color-mix(in srgb, var(--color-primary) 32%, transparent), 0 2px 8px color-mix(in srgb, var(--color-text) 14%, transparent)',
      } as React.CSSProperties}
    >
      <Icon name="phone" size={20} />
      <span>{label}</span>
    </a>
  )
}
