import { getSupabase, getAdminClient, getTenantId } from './supabase-server'
import { renderLeadEmailHtml, renderLeadEmailText, BrandColors, LeadEmailData } from './email-html'

const RESEND_API = 'https://api.resend.com/emails'
const LEADS_FROM_ADDRESS = 'leads@mail.sitespire.co.za'

export interface SubmitLeadInput {
  name: string
  email: string
  phone?: string
  message: string
  businessName: string
  notifyTo: string
  brandColors?: BrandColors
  pageUrl?: string
  userAgent?: string
  isTest?: boolean
  subject?: string
  /**
   * Marketing opt-in. POPIA s1 requires a "voluntary, specific and informed
   * expression of will" and s11(2) puts the burden of proof on us, so we keep
   * the YES/NO plus the exact wording shown and the time it was answered.
   * null = the field did not exist when this lead was collected.
   */
  marketingConsent?: boolean | null
  marketingConsentText?: string | null
}

export type LeadResult =
  | { ok: true; id: string; messageId: string | null }
  | { ok: false; error: string }

function fromAddress(businessName: string): string {
  return `New Lead - ${businessName} <${LEADS_FROM_ADDRESS}>`
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}

async function sendViaResend(params: {
  from: string
  to: string
  replyTo: string
  subject: string
  text: string
  html: string
}): Promise<{ ok: true; messageId: string | null } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not set' }
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        text: params.text,
        html: params.html,
        // Open/click tracking so the dashboard can show which notification
        // emails were actually opened in the client's inbox (and which were missed).
        tracking: {
          open: true,
          click: true,
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { ok: false, error: `Resend ${res.status}: ${errText.slice(0, 300)}` }
    }

    const json = (await res.json().catch(() => ({}))) as { id?: string }
    return { ok: true, messageId: json.id || null }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Resend request failed' }
  }
}

/**
 * Log the lead to Supabase and deliver the notification email via Resend.
 * Never fakes success: returns { ok: false } when delivery fails.
 */
export async function submitLead(input: SubmitLeadInput): Promise<LeadResult> {
  const tenantId = getTenantId()
  const supabase = getSupabase()

  const brand = input.brandColors
  const emailData: LeadEmailData = {
    businessName: input.businessName,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    pageUrl: input.pageUrl,
    isTest: input.isTest,
    submittedAt: new Date().toISOString(),
  }

  // 1. Insert as pending BEFORE sending so the dashboard shows the lead immediately.
  //    Migration 019 adds the POPIA consent columns; if it has not been applied
  //    yet we retry without them so lead capture NEVER stops working.
  const insertRow = async (withConsent: boolean) => {
    const payload: Record<string, unknown> = {
      tenant_id: tenantId,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
      subject: input.subject || (input.isTest ? `Test Lead - ${input.businessName}` : `New Lead - ${input.businessName}`),
      business_name: input.businessName,
      page_url: input.pageUrl || null,
      user_agent: input.userAgent || null,
      status: 'pending',
      resend_from: fromAddress(input.businessName),
      resend_to: input.notifyTo,
      is_test: !!input.isTest,
      is_read: !!input.isTest,
    }
    if (withConsent) {
      payload.marketing_consent = input.marketingConsent === undefined ? null : input.marketingConsent === true
      payload.marketing_consent_at = input.marketingConsent === undefined ? null : new Date().toISOString()
      payload.marketing_consent_text = input.marketingConsentText
        ? String(input.marketingConsentText).slice(0, 500)
        : null
    }
    return supabase
      .from('form_submissions')
      .insert(payload)
      .select('id')
      .single()
  }

  let { data: row, error: insertError } = await insertRow(true)
  if (insertError && /marketing_consent/.test(insertError.message || '')) {
    console.warn('[Leads] consent columns missing — run migration 019. Inserting without them.')
    ;({ data: row, error: insertError } = await insertRow(false))
  }

  if (insertError || !row) {
    console.error('[Leads] Supabase insert failed:', insertError)
    return { ok: false, error: `Failed to log lead: ${insertError?.message || 'unknown'}` }
  }

  // 2. Send via Resend
  const subject =
    input.subject || (input.isTest ? `Test Lead - ${input.businessName}` : `New Lead - ${input.businessName}`)

  const sendResult = await sendViaResend({
    from: fromAddress(input.businessName),
    to: input.notifyTo,
    replyTo: input.email,
    subject,
    text: renderLeadEmailText(emailData),
    html: renderLeadEmailHtml(emailData, brand),
  })

  if (!sendResult.ok) {
    await supabase
      .from('form_submissions')
      .update({ status: 'failed', resend_error: sendResult.error })
      .eq('id', row.id)
    console.error('[Leads] Resend send failed:', sendResult.error)
    return { ok: false, error: sendResult.error }
  }

  // 3. Record the Resend message id for webhook tracking
  await supabase
    .from('form_submissions')
    .update({ status: 'sent', resend_message_id: sendResult.messageId })
    .eq('id', row.id)

  return { ok: true, id: row.id, messageId: sendResult.messageId }
}

/**
 * Re-send a stored lead to the client's inbox (self-service recovery).
 */
export async function redeliverLead(leadId: string): Promise<LeadResult> {
  const tenantId = getTenantId()
  const supabase = getSupabase()

  // Elevated read: lead contents are PII, so prefer the privileged client.
  // The .eq('tenant_id') filter below remains as defence in depth.
  const { data: row, error } = await getAdminClient()
    .from('form_submissions')
    .select('*')
    .eq('id', leadId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !row) {
    return { ok: false, error: 'Lead not found' }
  }

  const emailData: LeadEmailData = {
    businessName: row.business_name,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    message: row.message,
    pageUrl: row.page_url || undefined,
    isTest: !!row.is_test,
    submittedAt: row.created_at,
  }

  const sendResult = await sendViaResend({
    from: fromAddress(row.business_name),
    to: row.resend_to,
    replyTo: row.email,
    subject: `Redelivered: ${row.subject || `New Lead - ${row.business_name}`}`,
    text: renderLeadEmailText(emailData),
    html: renderLeadEmailHtml(emailData),
  })

  if (!sendResult.ok) {
    await supabase
      .from('form_submissions')
      .update({
        status: 'failed',
        resend_error: sendResult.error,
        redelivered_count: (row.redelivered_count || 0) + 1,
        last_redelivered_at: new Date().toISOString(),
      })
      .eq('id', row.id)
    return { ok: false, error: sendResult.error }
  }

  await supabase
    .from('form_submissions')
    .update({
      status: 'sent',
      resend_message_id: sendResult.messageId,
      resend_error: null,
      redelivered_count: (row.redelivered_count || 0) + 1,
      last_redelivered_at: new Date().toISOString(),
      // New email = new open cycle; track whether the redelivered copy was opened
      email_opened_at: null,
      email_opened_count: 0,
      email_clicked_at: null,
    })
    .eq('id', row.id)

  return { ok: true, id: row.id, messageId: sendResult.messageId }
}

/**
 * Send a test lead so the client can confirm delivery + whitelist leads@mail.sitespire.co.za
 * before their website goes live.
 */
export async function sendTestLead(input: {
  businessName: string
  notifyTo: string
  brandColors?: BrandColors
}): Promise<LeadResult> {
  return submitLead({
    name: 'Platform Test Lead',
    email: 'test-lead@sitespire.co.za',
    message: `This is a test lead from the SiteGeist platform.

If you are reading this email, lead notifications for ${input.businessName} are working correctly.

Please add leads@mail.sitespire.co.za to your safe senders / contacts list so future enquiries never land in spam.

— SiteGeist Platform`,
    businessName: input.businessName,
    notifyTo: input.notifyTo,
    brandColors: input.brandColors,
    isTest: true,
    subject: `Test Lead - ${input.businessName}`,
  })
}
