/**
 * Internal build-ready notification email (for Sean only — never sent to the client).
 *
 * Matches the GeistCRM / SiteGeist Resend email look:
 * dark #06090F canvas, #0F1419 card, green #10B981 accents, Inter.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const NOTIFY_EMAIL_TO = process.env.BUILD_NOTIFY_EMAIL || 'sean@sitespire.co.za'
const NOTIFY_EMAIL_FROM =
  process.env.BUILD_NOTIFY_FROM || 'SiteGeist <hello@sitespire.co.za>'

function crmBase(): string {
  // GeistCRM runs on :3001; Website Builder is on :3000
  return (process.env.CRM_BASE_URL || 'http://localhost:3001').replace(/\/$/, '')
}

export interface BuildReadyEmailPayload {
  businessName: string
  ownerName?: string
  /** Public site URL (e.g. https://mamma-mia.sitespire.co.za) */
  websiteUrl: string
  /** Underlying vercel.app URL if different */
  vercelUrl?: string
  /** Dashboard URL (websiteUrl + /dashboard) */
  dashboardUrl?: string
  username: string
  password: string
  /** GeistCRM contact id for the deep link */
  contactId?: string
  trialWebsiteId?: string
  llmJudgeScore?: number | null
  llmJudgeRecommendation?: string
  deployedAt?: string
  /** Full pipeline time (scrape → deploy), e.g. "4m 32s" */
  buildDuration?: string
}

export function buildReadyEmailHtml(p: BuildReadyEmailPayload): string {
  const dashboardUrl = p.dashboardUrl || `${p.websiteUrl}/dashboard`
  const crmContactUrl = p.contactId
    ? `${crmBase()}/contacts/${p.contactId}`
    : `${crmBase()}/trials`
  const score =
    p.llmJudgeScore != null && p.llmJudgeScore !== undefined
      ? `${p.llmJudgeScore}/10${p.llmJudgeRecommendation ? ` — ${p.llmJudgeRecommendation}` : ''}`
      : 'Not scored'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Build Complete</title>
</head>
<body style="margin:0;padding:0;background-color:#06090F;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <center style="width:100%;background-color:#06090F;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:700px;margin:0 auto;">

      <tr><td style="height:48px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Logo -->
      <tr>
        <td align="center" style="padding-bottom:48px;">
          <div style="padding:18px 36px;background:linear-gradient(135deg,#10B981 0%,#059669 100%);border-radius:18px;display:inline-block;box-shadow:0 12px 40px rgba(16,185,129,0.35);">
            <span style="font-family:'Inter',sans-serif;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;">SiteGeist</span>
          </div>
        </td>
      </tr>

      <!-- Main Card -->
      <tr>
        <td style="background-color:#0F1419;border-radius:28px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 32px 64px rgba(0,0,0,0.5);">

          <!-- Hero -->
          <div style="background:linear-gradient(180deg,#10B981 0%,#059669 40%,#047857 100%);padding:48px 56px 52px;text-align:center;position:relative;overflow:hidden;">
            <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
            <div style="font-size:56px;margin-bottom:16px;line-height:1;">&#9989;</div>
            <h1 style="margin:0 0 12px;font-family:'Inter',sans-serif;font-size:38px;font-weight:900;color:#ffffff;line-height:1.1;letter-spacing:-1.5px;">
              Build Complete
            </h1>
            <p style="margin:0;font-family:'Inter',sans-serif;font-size:18px;color:rgba(255,255,255,0.9);line-height:1.5;max-width:480px;margin:0 auto;">
              <strong style="font-weight:700;">${escapeHtml(p.businessName)}</strong> is live and ready for you to review.
            </p>
          </div>

          <!-- Content -->
          <div style="padding:48px 56px;">

            <!-- Review CTA -->
            <div style="text-align:center;margin-bottom:40px;">
              <a href="${crmContactUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#10B981 0%,#059669 100%);color:#ffffff;font-family:'Inter',sans-serif;font-size:18px;font-weight:700;text-decoration:none;padding:20px 48px;border-radius:18px;letter-spacing:0.3px;box-shadow:0 12px 32px rgba(16,185,129,0.45);">
                Open Client in CRM &rarr;
              </a>
              <p style="margin:14px 0 0;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.45);">
                Opens ${escapeHtml(p.contactId ? 'this client’s record' : 'Trials')} so you can send the email &amp; copy the WhatsApp message
              </p>
            </div>

            <!-- Links card -->
            <div style="background:linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(5,150,105,0.08) 100%);border:1px solid rgba(16,185,129,0.2);border-radius:24px;padding:32px;margin-bottom:36px;">
              <p style="margin:0 0 20px;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:2.5px;">Quick Links</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.45);">Client website</p>
                    <a href="${p.websiteUrl}" target="_blank" style="font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#10B981;text-decoration:none;word-break:break-all;">${escapeHtml(p.websiteUrl)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.45);">Dashboard (client login)</p>
                    <a href="${dashboardUrl}" target="_blank" style="font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#10B981;text-decoration:none;word-break:break-all;">${escapeHtml(dashboardUrl)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.45);">CRM client record</p>
                    <a href="${crmContactUrl}" target="_blank" style="font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#10B981;text-decoration:none;word-break:break-all;">${escapeHtml(crmContactUrl)}</a>
                  </td>
                </tr>
                ${p.vercelUrl && p.vercelUrl !== p.websiteUrl ? `
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.45);">Vercel fallback URL</p>
                    <a href="${p.vercelUrl}" target="_blank" style="font-family:'Inter',sans-serif;font-size:15px;font-weight:600;color:rgba(255,255,255,0.55);text-decoration:none;word-break:break-all;">${escapeHtml(p.vercelUrl)}</a>
                  </td>
                </tr>` : ''}
              </table>
            </div>

            <!-- Dashboard test credentials -->
            <div style="background:linear-gradient(135deg,rgba(59,130,246,0.12) 0%,rgba(37,99,235,0.08) 100%);border:1px solid rgba(59,130,246,0.2);border-radius:20px;padding:28px;margin-bottom:32px;">
              <div style="font-size:28px;margin-bottom:10px;">&#128273;</div>
              <p style="margin:0 0 14px;font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#ffffff;">Test the dashboard with these credentials</p>
              <p style="margin:0 0 6px;font-family:'Inter',sans-serif;font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;">
                <strong style="color:#ffffff;">Username:</strong> ${escapeHtml(p.username)}
              </p>
              <p style="margin:0 0 14px;font-family:'Inter',sans-serif;font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;">
                <strong style="color:#ffffff;">Password:</strong> ${escapeHtml(p.password)}
              </p>
              <p style="margin:0;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;">
                Same credentials go to the client via WhatsApp from the CRM. This email is only for you.
              </p>
            </div>

            <!-- Score / meta -->
            <div style="background-color:rgba(255,255,255,0.02);border-radius:20px;padding:24px 28px;border:1px solid rgba(255,255,255,0.04);margin-bottom:28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${p.buildDuration ? `
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;">Build time</p>
                    <p style="margin:0;font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#10B981;">${escapeHtml(p.buildDuration)} <span style="color:rgba(255,255,255,0.4);font-weight:500;font-size:13px;">(scrape → live)</span></p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:8px 0;${p.buildDuration ? 'border-top:1px solid rgba(255,255,255,0.04);' : ''}">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;">LLM Judge</p>
                    <p style="margin:0;font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(score)}</p>
                  </td>
                </tr>
                ${p.ownerName ? `
                <tr>
                  <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.04);">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;">Owner</p>
                    <p style="margin:0;font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(p.ownerName)}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.04);">
                    <p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;">Checklist</p>
                    <p style="margin:0;font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
                      1. Open the website &amp; spot-check content<br>
                      2. Log into the dashboard &amp; make sure it works<br>
                      3. Click <strong style="color:#10B981;">Open Client in CRM</strong> and send the trial email + WhatsApp
                    </p>
                  </td>
                </tr>
              </table>
            </div>

            <p style="margin:0;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.35);line-height:1.6;text-align:center;">
              This notification is internal only — the client does not receive this email.
            </p>

          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:48px 20px;text-align:center;">
          <p style="margin:0 0 20px;">
            <a href="https://www.sitespire.co.za" style="font-family:'Inter',sans-serif;font-size:15px;font-weight:600;color:#10B981;text-decoration:none;">sitespire.co.za</a>
          </p>
          <p style="margin:0 0 6px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.2);line-height:1.5;">
            SiteGeist — Professional Websites for South African Businesses
          </p>
          <p style="margin:0;font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.12);">
            &copy; 2026 SiteGeist. All rights reserved.
          </p>
        </td>
      </tr>

      <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
  </center>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildReadyEmailSubject(p: BuildReadyEmailPayload): string {
  return `✅ Build ready for review — ${p.businessName}`
}

/**
 * Send the internal build-ready notification to Sean.
 * Never call this for the client-facing welcome email.
 */
export async function sendBuildReadyEmail(
  payload: BuildReadyEmailPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('[BuildNotify] RESEND_API_KEY not set — skipping build-ready email')
    return { success: false, error: 'RESEND_API_KEY not set' }
  }

  const to = payload && process.env.BUILD_NOTIFY_EMAIL ? process.env.BUILD_NOTIFY_EMAIL : NOTIFY_EMAIL_TO

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_EMAIL_FROM,
        to: [to],
        subject: buildReadyEmailSubject(payload),
        html: buildReadyEmailHtml(payload),
      }),
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {}

    if (!res.ok) {
      console.error('[BuildNotify] Resend error', res.status, text)
      return { success: false, error: data?.message || text || `HTTP ${res.status}` }
    }

    console.log(`[BuildNotify] Build-ready email sent to ${to} (id: ${data?.id})`)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[BuildNotify] Send failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
