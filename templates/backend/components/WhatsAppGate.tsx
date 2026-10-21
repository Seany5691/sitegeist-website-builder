'use client'

import { useSiteData } from '@/lib/use-site-data'

/**
 * Gates the legacy floating WhatsApp widget.
 *
 * The site originally shipped a single WhatsAppWidget. The Full Control System
 * adds a `whatsappFab` feature that is now the canonical WhatsApp button.
 * Rendering both would show two buttons stacked. This wrapper renders the
 * legacy widget ONLY when the feature is switched off.
 */
export default function WhatsAppGate({ children }: { children: React.ReactNode }) {
  const { config } = useSiteData()
  const fabOn = config?.controls?.features?.whatsappFab !== false
  if (fabOn) return null
  return <>{children}</>
}
