import { NextRequest, NextResponse } from 'next/server'
import { loadJSON } from '@/lib/blob-storage'
import { submitLead } from '@/lib/leads'
import { contactRateLimiter, clientIpFrom } from '@/lib/rate-limiter'
import { getTenantId } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * Contact form delivery — identical across all generated sites.
 * Logs the lead to the shared Supabase form_submissions table under this
 * site's tenant_id, then delivers a notification via Resend using the
 * display format "New Lead - [Business Name] <leads@mail.sitespire.co.za>".
 * replyTo points at the customer so the client can answer from their inbox.
 *
 * Never fakes success: returns a clear error when anything is unconfigured
 * or delivery fails.
 */
export async function POST(request: NextRequest) {
  // Anonymous endpoint: throttle per IP so a spam run cannot flood the client's
  // inbox or burn the Resend quota. 20 submissions / 10 minutes is far above any
  // genuine visitor and far below an attack.
  const ip = clientIpFrom(request.headers)
  if (contactRateLimiter.check(ip)) {
    const remaining = contactRateLimiter.remaining(ip)
    return NextResponse.json(
      {
        success: false,
        message: `Too many messages from this connection. Please try again in a few minutes. (${remaining} attempts remaining)`,
      },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  try {
    const body = await request.json()
    // Lead kind — every email-collecting surface on the site posts here:
    //   'contact'    full contact form (name + email + message)
    //   'newsletter' newsletter block / lead popup (email only)
    //   'quote'      quote slide-in (name + email + phone + message)
    const kind = String(body.type || 'contact').trim().toLowerCase()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const message = String(body.message || '').trim()
    const pageUrl = String(body.pageUrl || '').trim().slice(0, 500) || null

    // Marketing opt-in (POPIA). null = the form did not show the question.
    const marketingConsent = body.marketingConsent === undefined ? null : body.marketingConsent === true
    const marketingConsentText = String(body.marketingConsentText || '').trim().slice(0, 500) || null

    // Newsletter signups are email-only; a quote may leave the message short.
    let finalName = name
    let finalMessage = message
    if (kind === 'newsletter') {
      finalName = name || 'Newsletter signup'
      finalMessage = message || 'Signed up to the newsletter on the website.'
    } else if (kind === 'quote') {
      finalName = name || 'Quote request'
      finalMessage = message || 'Requested a quote via the website.'
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'An email address is required.' },
        { status: 400 }
      )
    }

    if (kind === 'contact' && (!name || !message)) {
      return NextResponse.json(
        { success: false, message: 'Name, email and message are required.' },
        { status: 400 }
      )
    }

    if (kind === 'quote' && !name && !phone) {
      return NextResponse.json(
        { success: false, message: 'Please add your name or phone number so we can reply.' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Tenant linkage (required for dashboard lead tracking)
    let tenantId: string
    try {
      tenantId = getTenantId()
    } catch {
      console.error('CONTACT FORM: TENANT_ID is not set — cannot log lead.')
      return NextResponse.json(
        {
          success: false,
          message:
            'Contact form is not configured yet. Set the notification email in the dashboard.',
        },
        { status: 503 }
      )
    }

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
            'Contact form is not configured yet. Set the notification email in the dashboard.',
        },
        { status: 503 }
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

    if (!process.env.RESEND_API_KEY) {
      console.error('CONTACT FORM: RESEND_API_KEY is not set. Submission rejected so we never fake success.')
      console.error('CONTACT FORM payload:', { tenantId, to: notifyTo, name, email, phone, message })
      return NextResponse.json(
        {
          success: false,
          message:
            'Email delivery is not configured on the server. Please contact the site owner by phone.',
        },
        { status: 503 }
      )
    }

    // Subject line tells the client at a glance which kind of lead arrived.
    const subject =
      kind === 'newsletter'
        ? `Newsletter Signup - ${businessName}`
        : kind === 'quote'
          ? `Quote Request - ${businessName}`
          : undefined

    const result = await submitLead({
      name: finalName,
      email,
      phone: phone || undefined,
      message: finalMessage,
      businessName,
      notifyTo,
      brandColors,
      pageUrl: pageUrl || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      subject,
      marketingConsent,
      marketingConsentText,
    })

    if (!result.ok) {
      console.error('CONTACT FORM: lead delivery failed:', result.error)
      return NextResponse.json(
        { success: false, message: 'Failed to send message. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, message: 'Message sent.' })
  } catch (error) {
    console.error('CONTACT FORM error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
