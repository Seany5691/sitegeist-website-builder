'use client'

import { useEffect, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { useFloatingRightOffset, useFloatingLeftOffset } from '@/lib/floating-stack'
import { Icon } from './icons'

const FEATURE_ID = 'whatsappFab'

// Brand green — required by WhatsApp, the one exception to theme tokens.
const WHATSAPP_GREEN = '#25D366'

export default function WhatsAppFab() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const rawNumber = data.number || config?.whatsapp?.number || config?.contact?.phone || ''
  const number = String(rawNumber).replace(/\D/g, '')
  const greeting = data.greeting || 'Hi! I would like to enquire about your services.'
  const label = data.label || 'WhatsApp'
  const isLeft = String(data.position || '').toLowerCase().includes('left')

  // Stack offset: right side joins the WhatsApp/ClickToCall/Quote stack,
  // left side sits on its own baseline.
  const rightBottom = useFloatingRightOffset('whatsapp')
  const leftBottom = useFloatingLeftOffset('whatsapp')

  if (!enabled || !mounted || !number) return null

  const href = `https://wa.me/${number}?text=${encodeURIComponent(greeting)}`

  // Canonical WhatsApp button when this feature is on: brand green,
  // round on small screens, icon + label pill on wider ones.
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed z-50 inline-flex items-center justify-center gap-2.5 w-14 h-14 md:w-auto md:px-6 rounded-full font-semibold text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{
        bottom: isLeft ? leftBottom : rightBottom,
        [isLeft ? 'left' : 'right']: '1.25rem',
        background: WHATSAPP_GREEN,
        color: '#ffffff',
        boxShadow:
          '0 10px 28px color-mix(in srgb, #25D366 40%, transparent), 0 2px 8px color-mix(in srgb, var(--color-text) 14%, transparent)',
      } as React.CSSProperties}
    >
      <Icon name="whatsapp" size={26} className="flex-none" />
      <span className="hidden md:inline whitespace-nowrap">{label}</span>
    </a>
  )
}
