'use client'

import { useSiteData } from '@/lib/use-site-data'

/**
 * Floating button stack — bottom-right/left action buttons auto-align.
 *
 * The FABs (WhatsApp, Click-to-Call, Quote) each used to hardcode a `bottom`
 * offset, which left dead space whenever one of them was switched off.
 * This module computes each button's offset from what is actually enabled so
 * the stack is always flush against the bottom with no gaps.
 *
 * Right-side stack, bottom → top:
 *   1. WhatsApp (features `whatsappFab`, else the Settings `WhatsAppWidget`)
 *   2. Click-to-Call (only when positioned bottom-right)
 *   3. Quote slide-in
 *
 * The two WhatsApp buttons never coexist: WhatsAppGate hides the Settings
 * widget whenever the Features `whatsappFab` is on, so only one occupies the
 * bottom slot. Turning either off just pulls the stack down.
 */

const GAP = 0.75 // rem between stacked buttons
const BASE = 1.25 // rem from the viewport bottom
const STICKY_BAR = 4.5 // rem reserved when the sticky call bar is showing

type Slot = 'whatsapp' | 'clickToCall' | 'quote'

const SLOT_HEIGHT: Record<Slot, number> = {
  whatsapp: 3.5,
  clickToCall: 3.1,
  quote: 3.25,
}

type Config = any

/** Which right-side slots are active, bottom-first. */
function activeRightSlots(config: Config): Slot[] {
  const features = config?.controls?.features || {}

  // WhatsApp occupies one slot at most: the Features FAB when on, else the
  // Settings widget (WhatsAppGate hides the widget while the FAB is on).
  const waFabOn = features.whatsappFab !== false
  const wa = config?.whatsapp || {}
  const waNumber = String(wa.number || config?.contact?.phone || '').replace(/\D/g, '')
  const fabNumber = String(
    config?.featureData?.whatsappFab?.number || wa.number || config?.contact?.phone || ''
  ).replace(/\D/g, '')
  const whatsappOn = waFabOn
    ? fabNumber.length > 0
    : wa.enabled !== false && waNumber.length > 0

  // Click-to-Call only joins the right stack when it is positioned right.
  const ctaPos = String(config?.featureData?.clickToCallFab?.position || 'bottom-right').toLowerCase()
  const ctaPhone = String(config?.featureData?.clickToCallFab?.phone || config?.contact?.phone || '').replace(/\D/g, '')
  const clickOnRight =
    features.clickToCallFab !== false && !ctaPos.includes('left') && ctaPhone.length > 0

  const quoteOn = features.quoteSlideIn !== false

  const slots: Slot[] = []
  if (whatsappOn) slots.push('whatsapp')
  if (clickOnRight) slots.push('clickToCall')
  if (quoteOn) slots.push('quote')
  return slots
}

/**
 * `bottom` offset (CSS value) for a floating slot on the right-hand stack.
 * Returns a `calc(... + env(safe-area-inset-bottom))` string ready for `style`.
 */
export function useFloatingRightOffset(slot: Slot): string {
  const { config } = useSiteData()
  const slots = activeRightSlots(config)
  const idx = slots.indexOf(slot)

  // If somehow not in the stack, keep it above the fold rather than off-screen.
  const position = idx < 0 ? 0 : idx

  const features = config?.controls?.features || {}
  let bottom = BASE
  if (features.stickyCallBar !== false) bottom += STICKY_BAR

  for (let i = 0; i < position; i++) {
    bottom += SLOT_HEIGHT[slots[i]] + GAP
  }
  return `calc(${bottom}rem + env(safe-area-inset-bottom))`
}

/**
 * `bottom` offset for a floating slot on the left-hand stack.
 * Currently only Click-to-Call uses the left side; the same sticky-bar rule applies.
 */
export function useFloatingLeftOffset(slot: Slot): string {
  const { config } = useSiteData()
  const features = config?.controls?.features || {}
  let bottom = BASE
  if (features.stickyCallBar !== false) bottom += STICKY_BAR
  return `calc(${bottom}rem + env(safe-area-inset-bottom))`
}
