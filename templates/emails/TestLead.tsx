/**
 * Design-time test-lead email (react-email). Composes LeadNotification with
 * isTest=true so the header reads "Test Lead" and the intro uses the test copy.
 * Default body mirrors templates/backend/lib/leads.ts sendTestLead(), including
 * the whitelist instruction for leads@mail.sitespire.co.za. Design-time only.
 */
import * as React from 'react'
import LeadNotification, { type BrandColors } from './LeadNotification'

export interface TestLeadProps {
  businessName: string
  name?: string
  email?: string
  phone?: string
  message?: string
  pageUrl?: string
  submittedAt?: string
  brandColors?: BrandColors
}

const DEFAULT_TEST_NAME = 'Platform Test Lead'
const DEFAULT_TEST_EMAIL = 'test-lead@sitespire.co.za'
const DEFAULT_TEST_MESSAGE = `This is a test lead from the SiteGeist platform.

If you are reading this email, lead notifications are working correctly.

Please add leads@mail.sitespire.co.za to your safe senders / contacts list so future enquiries never land in spam.

— SiteGeist Platform`

export const TestLead: React.FC<TestLeadProps> = ({
  businessName,
  name = DEFAULT_TEST_NAME,
  email = DEFAULT_TEST_EMAIL,
  message = DEFAULT_TEST_MESSAGE,
  phone,
  pageUrl,
  submittedAt,
  brandColors,
}) => (
  <LeadNotification
    businessName={businessName}
    name={name}
    email={email}
    message={message}
    phone={phone}
    pageUrl={pageUrl}
    submittedAt={submittedAt}
    brandColors={brandColors}
    isTest
  />
)

export default TestLead
