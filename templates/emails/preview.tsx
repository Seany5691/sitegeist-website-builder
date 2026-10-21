/**
 * Design-time preview: renders LeadNotification + TestLead with sample data and
 * a sample brand palette, then writes HTML to templates/emails/preview-out/.
 *
 * Run from the Website Builder folder:
 *   npx tsx templates/emails/preview.tsx
 *
 * Or browse interactively with the react-email dev server:
 *   npx email dev templates/emails
 */
import * as React from 'react'
import { render } from '@react-email/render'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { BrandColors, LeadEmailData } from './LeadNotification'
import TestLead from './TestLead'
import { renderLeadEmailHtml } from './render'

const samplePalette: BrandColors = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#f59e0b',
  bg: '#f8fafc',
  text: '#0f172a',
}

const sampleLead: LeadEmailData = {
  businessName: 'Acme Plumbing',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '+27 82 555 0123',
  message:
    'Hi, I would like a quote for a geyser replacement at our property in Sandton.\n\nPlease let me know your availability next week.',
  pageUrl: 'https://acmeplumbing.co.za/contact',
  submittedAt: '25 Sep 2026, 14:32',
}

async function main(): Promise<void> {
  const outDir = join(__dirname, 'preview-out')
  mkdirSync(outDir, { recursive: true })

  const leadHtml = await renderLeadEmailHtml(sampleLead, samplePalette)
  const leadPath = join(outDir, 'lead-notification.html')
  writeFileSync(leadPath, leadHtml, 'utf8')

  const testHtml = await render(
    <TestLead
      businessName={sampleLead.businessName}
      submittedAt={sampleLead.submittedAt}
      brandColors={samplePalette}
    />
  )
  const testPath = join(outDir, 'test-lead.html')
  writeFileSync(testPath, testHtml, 'utf8')

  console.log('Preview HTML written:')
  console.log('  ' + leadPath)
  console.log('  ' + testPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
