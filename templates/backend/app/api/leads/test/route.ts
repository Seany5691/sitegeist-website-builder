import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { loadJSON } from '@/lib/blob-storage'
import { sendTestLead } from '@/lib/leads'

export const dynamic = 'force-dynamic'

/**
 * POST /api/leads/test
 * Pre-launch onboarding check: fires a sample lead to the configured
 * notification email so the client can confirm delivery and whitelist
 * leads@mail.sitespire.co.za before the website goes live.
 */
export async function POST(request: NextRequest) {
  const guard = await protectRoute(request)
  if (guard instanceof NextResponse) return guard

  try {
    const config = await loadJSON('site-config.json')
    const notifyTo =
      config?.contactForm?.to ||
      config?.contact?.email ||
      process.env.CONTACT_FORM_FALLBACK_TO ||
      ''

    if (!notifyTo) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No notification email configured. Set the contact email in Settings first.',
        },
        { status: 400 }
      )
    }

    const businessName = config?.businessName || 'Website'
    const brandColors = config?.theme?.palette
      ? {
          primary: config.theme.palette.primary,
          secondary: config.theme.palette.secondary,
          accent: config.theme.palette.accent,
          bg: config.theme.palette.bg,
          text: config.theme.palette.text,
        }
      : undefined

    const result = await sendTestLead({ businessName, notifyTo, brandColors })

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test lead sent to ${notifyTo}. Check your inbox (and spam) for "Test Lead - ${businessName}".`,
      messageId: result.messageId,
    })
  } catch (err) {
    console.error('[Test Lead] error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to send test lead.' },
      { status: 500 }
    )
  }
}
