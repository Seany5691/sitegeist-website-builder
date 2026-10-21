/**
 * Runtime HTML email renderer for lead notifications.
 * Pure TypeScript — no react-email dependency in generated sites.
 * Visual parity with Website Builder/templates/emails/*.tsx design-time templates.
 */

export interface BrandColors {
  primary: string
  secondary?: string
  accent: string
  bg?: string
  text?: string
}

export interface LeadEmailData {
  businessName: string
  name: string
  email: string
  phone?: string
  message: string
  pageUrl?: string
  submittedAt?: string
  isTest?: boolean
}

const DEFAULT_COLORS: BrandColors = {
  primary: '#0f172a',
  accent: '#f59e0b',
  bg: '#f8fafc',
  text: '#0f172a',
}

function esc(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderLeadEmailHtml(data: LeadEmailData, colors?: BrandColors): string {
  const c = { ...DEFAULT_COLORS, ...colors }
  const submittedAt =
    data.submittedAt ||
    new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', dateStyle: 'medium', timeStyle: 'short' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead - ${esc(data.businessName)}</title>
</head>
<body style="margin:0;padding:0;background:${esc(c.bg || '#f8fafc')};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${esc(c.bg || '#f8fafc')};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

          <tr>
            <td style="background:${esc(c.primary)};padding:28px 32px;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${esc(c.accent)};">
                ${data.isTest ? 'Test Lead' : 'New Lead'}
              </p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">
                ${esc(data.businessName)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
                ${data.isTest
                  ? 'This is a test notification. If you can read this, lead delivery to your inbox is working.'
                  : 'A new enquiry was submitted on your website.'}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;width:110px;color:#64748b;font-size:13px;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:600;">${esc(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;">
                    <a href="mailto:${esc(data.email)}" style="color:${esc(c.primary)};text-decoration:none;">${esc(data.email)}</a>
                  </td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Phone</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;">
                    <a href="tel:${esc(data.phone)}" style="color:${esc(c.primary)};text-decoration:none;">${esc(data.phone)}</a>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Received</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${esc(submittedAt)}</td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Message</p>
              <div style="background:#f1f5f9;border-left:4px solid ${esc(c.accent)};border-radius:8px;padding:16px 18px;font-size:14px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${esc(data.message)}</div>

              ${data.pageUrl ? `
              <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
                Submitted on <a href="${esc(data.pageUrl)}" style="color:${esc(c.primary)};">${esc(data.pageUrl)}</a>
              </p>` : ''}
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">
                Sent from the ${esc(data.businessName)} website contact form · leads@mail.sitespire.co.za<br>
                Hit reply to respond directly to the sender.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function renderLeadEmailText(data: LeadEmailData): string {
  return [
    `New Lead - ${data.businessName}`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    data.submittedAt ? `Received: ${data.submittedAt}` : null,
    ``,
    `Message:`,
    data.message,
    data.pageUrl ? `\nPage: ${data.pageUrl}` : null,
    ``,
    `-- Sent from the website contact form`,
  ]
    .filter(Boolean)
    .join('\n')
}
