/**
 * Design-time helper: render the react-email lead templates to HTML strings.
 * Used by preview.tsx. Generated sites do NOT use this — they render HTML at
 * runtime via templates/backend/lib/email-html.ts (keep both visually in parity).
 */
import * as React from 'react'
import { render } from '@react-email/render'
import { LeadNotification, type BrandColors, type LeadEmailData } from './LeadNotification'

export type { BrandColors, LeadEmailData }

/**
 * Render the lead notification (or test-lead when data.isTest) to a full HTML
 * document string. Mirrors the signature of the runtime renderer in
 * templates/backend/lib/email-html.ts for easy side-by-side comparison.
 */
export async function renderLeadEmailHtml(
  data: LeadEmailData,
  colors?: BrandColors
): Promise<string> {
  return render(
    React.createElement(LeadNotification, {
      ...data,
      brandColors: colors ?? data.brandColors,
    })
  )
}
