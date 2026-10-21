/**
 * Design-time lead notification email (react-email).
 * Visual parity with templates/backend/lib/email-html.ts — the pure-TS renderer
 * used by generated sites at runtime. Sites do NOT get react-email.
 * If you change structure/copy/colors here, mirror it there (and vice versa).
 */
import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

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
  brandColors?: BrandColors
}

const DEFAULT_COLORS: Required<Pick<BrandColors, 'primary' | 'accent' | 'bg' | 'text'>> & {
  secondary: string
} = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#f59e0b',
  bg: '#f8fafc',
  text: '#0f172a',
}

function formatReceived(submittedAt?: string): string {
  return (
    submittedAt ||
    new Date().toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  )
}

const detailLabelStyle: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid #e2e8f0',
  color: '#64748b',
  fontSize: 13,
  width: 110,
  verticalAlign: 'top',
}

const detailValueStyle: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 14,
  verticalAlign: 'top',
}

export const LeadNotification: React.FC<LeadEmailData> = ({
  businessName,
  name,
  email,
  phone,
  message,
  pageUrl,
  submittedAt,
  isTest,
  brandColors,
}) => {
  const c = { ...DEFAULT_COLORS, ...brandColors }
  const received = formatReceived(submittedAt)

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {isTest ? 'Test Lead' : 'New Lead'} - {businessName}
      </Preview>
      <Body
        style={{
          margin: 0,
          padding: '32px 16px',
          backgroundColor: c.bg,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            width: '100%',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header band */}
          <Section
            style={{
              backgroundColor: c.primary,
              padding: '28px 32px',
            }}
          >
            <Text
              style={{
                margin: '0 0 6px',
                fontSize: 12,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: c.accent,
              }}
            >
              {isTest ? 'Test Lead' : 'New Lead'}
            </Text>
            <Heading
              as="h1"
              style={{
                margin: 0,
                fontSize: 22,
                lineHeight: 1.3,
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {businessName}
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '28px 32px' }}>
            <Text
              style={{
                margin: '0 0 20px',
                fontSize: 15,
                lineHeight: 1.6,
                color: '#334155',
              }}
            >
              {isTest
                ? 'This is a test notification. If you can read this, lead delivery to your inbox is working.'
                : 'A new enquiry was submitted on your website.'}
            </Text>

            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{ margin: '0 0 20px' }}
            >
              <tbody>
                <tr>
                  <td style={detailLabelStyle}>Name</td>
                  <td
                    style={{
                      ...detailValueStyle,
                      color: '#0f172a',
                      fontWeight: 600,
                    }}
                  >
                    {name}
                  </td>
                </tr>
                <tr>
                  <td style={detailLabelStyle}>Email</td>
                  <td style={detailValueStyle}>
                    <Link
                      href={`mailto:${email}`}
                      style={{ color: c.primary, textDecoration: 'none' }}
                    >
                      {email}
                    </Link>
                  </td>
                </tr>
                {phone ? (
                  <tr>
                    <td style={detailLabelStyle}>Phone</td>
                    <td style={detailValueStyle}>
                      <Link
                        href={`tel:${phone}`}
                        style={{ color: c.primary, textDecoration: 'none' }}
                      >
                        {phone}
                      </Link>
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td style={detailLabelStyle}>Received</td>
                  <td style={{ ...detailValueStyle, color: '#0f172a' }}>{received}</td>
                </tr>
              </tbody>
            </table>

            <Text
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#64748b',
              }}
            >
              Message
            </Text>
            <Section
              style={{
                backgroundColor: '#f1f5f9',
                borderLeft: `4px solid ${c.accent}`,
                borderRadius: 8,
                padding: '16px 18px',
                fontSize: 14,
                lineHeight: 1.7,
                color: '#0f172a',
                whiteSpace: 'pre-wrap',
              }}
            >
              {message}
            </Section>

            {pageUrl ? (
              <Text style={{ margin: '20px 0 0', fontSize: 12, color: '#94a3b8' }}>
                Submitted on{' '}
                <Link href={pageUrl} style={{ color: c.primary }}>
                  {pageUrl}
                </Link>
              </Text>
            ) : null}
          </Section>

          {/* Footer band */}
          <Section
            style={{
              backgroundColor: '#f8fafc',
              padding: '18px 32px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Text style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: '#94a3b8' }}>
              Sent from the {businessName} website contact form · leads@mail.sitespire.co.za
              <br />
              Hit reply to respond directly to the sender.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default LeadNotification
