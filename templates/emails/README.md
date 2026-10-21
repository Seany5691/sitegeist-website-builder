# Email templates (design-time)

Premium HTML email templates for lead notifications, designed here with
[react-email](https://react.email/) and sent through Resend.

**Important:** generated sites do *not* use react-email. At runtime they render
HTML with the pure-TS renderer `templates/backend/lib/email-html.ts`. These
`.tsx` files exist only for local design and preview inside the Website Builder.

## Files

| File | Purpose |
| --- | --- |
| `LeadNotification.tsx` | Lead notification email (props below) |
| `TestLead.tsx` | Test-lead variant — composes `LeadNotification` with `isTest` and the whitelist instruction for `leads@mail.sitespire.co.za` |
| `render.ts` | Design-time helper: `renderLeadEmailHtml(data, colors)` → HTML string via `@react-email/render` |
| `preview.tsx` | Writes sample HTML to `preview-out/` |

## Preview

From the `Website Builder` folder (after `npm install`):

```bash
# Interactive hot-reload preview (react-email dev server)
npx email dev templates/emails

# Or render sample HTML files to templates/emails/preview-out/
npx tsx templates/emails/preview.tsx
```

## Designing with brand colors

Colors come from the site's `site-config.json` → `theme.palette` and are passed
as props:

```tsx
<LeadNotification
  businessName="Acme Plumbing"
  name="Jane Doe"
  email="jane.doe@example.com"
  phone="+27 82 555 0123"
  message="Hi, I would like a quote..."
  pageUrl="https://acmeplumbing.co.za/contact"
  submittedAt="25 Sep 2026, 14:32"
  brandColors={{
    primary: '#0f172a',   // header band, links
    secondary: '#1e293b', // reserved
    accent: '#f59e0b',    // eyebrow text, message box left border
    bg: '#f8fafc',        // page background
    text: '#0f172a',      // reserved
  }}
/>
```

Defaults (used when `brandColors` is omitted): `primary #0f172a`,
`accent #f59e0b`, `bg #f8fafc`.

## Keep visual parity with the runtime renderer

Any structural, copy, or color change made here must be mirrored in
`templates/backend/lib/email-html.ts` (and vice versa). The runtime renderer is
the source of truth for what clients actually receive — compare output side by
side:

```ts
import { renderLeadEmailHtml as renderRuntime } from '../backend/lib/email-html'
import { renderLeadEmailHtml as renderDesign } from './render'
```

## Test-send via Resend

Lead notification From line is:

```
New Lead - [Business Name] <leads@mail.sitespire.co.za>
```

with `replyTo` set to the customer's email so a plain reply reaches the sender.

### Resend CLI

```bash
# One-off test send (uses RESEND_API_KEY from the environment)
npx resend send \
  --from "New Lead - Acme Plumbing <leads@mail.sitespire.co.za>" \
  --to "you@example.com" \
  --subject "Test Lead - Acme Plumbing" \
  --html-file templates/emails/preview-out/test-lead.html \
  --reply-to "jane.doe@example.com"
```

### Resend API (script snippet)

```ts
import { Resend } from 'resend'
import { renderLeadEmailHtml } from './render'

const resend = new Resend(process.env.RESEND_API_KEY)
const html = await renderLeadEmailHtml(data, brandColors)

await resend.emails.send({
  from: `New Lead - ${data.businessName} <leads@mail.sitespire.co.za>`,
  to: 'client@example.com',
  replyTo: data.email,
  subject: `New Lead - ${data.businessName}`,
  html,
})
```

For the test-lead variant use subject `Test Lead - [Business Name]`, set
`isTest: true` in the data, and keep the whitelist instruction for
`leads@mail.sitespire.co.za` in the body.
