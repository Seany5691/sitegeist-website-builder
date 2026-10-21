const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const BACK = WB + '/templates/backend';

let ok = true;
function assert(cond, label) {
  console.log('  ' + label.padEnd(60) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. lib/leads.ts — persist the consent record
// ═══════════════════════════════════════════════════════════════════════════
const leadsPath = BACK + '/lib/leads.ts';
let leads = fs.readFileSync(leadsPath, 'utf8');

if (leads.includes('marketingConsent')) {
  console.log('leads.ts   already consent-aware');
} else {
  leads = leads.replace(
    `  isTest?: boolean
  subject?: string
}`,
    `  isTest?: boolean
  subject?: string
  /**
   * Marketing opt-in. POPIA s1 requires a "voluntary, specific and informed
   * expression of will" and s11(2) puts the burden of proof on us, so we keep
   * the YES/NO plus the exact wording shown and the time it was answered.
   * null = the field did not exist when this lead was collected.
   */
  marketingConsent?: boolean | null
  marketingConsentText?: string
}`
  );

  leads = leads.replace(
    `      is_test: !!input.isTest,
      is_read: !!input.isTest,
    })`,
    `      is_test: !!input.isTest,
      is_read: !!input.isTest,
      // Consent record (POPIA s11(2) burden of proof). Only stamp the time
      // when the visitor actually answered; null stays null.
      marketing_consent: input.marketingConsent === undefined ? null : input.marketingConsent === true,
      marketing_consent_at: input.marketingConsent === undefined ? null : new Date().toISOString(),
      marketing_consent_text: input.marketingConsentText ? String(input.marketingConsentText).slice(0, 500) : null,
    })`
  );
  fs.writeFileSync(leadsPath, leads, 'utf8');
  console.log('leads.ts   consent fields added');
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. /api/contact — pass the consent through from every form surface
// ═══════════════════════════════════════════════════════════════════════════
const contactPath = BACK + '/app/api/contact/route.ts';
let contact = fs.readFileSync(contactPath, 'utf8');

if (contact.includes('marketingConsent')) {
  console.log('contact    already consent-aware');
} else {
  contact = contact.replace(
    `    const pageUrl = String(body.pageUrl || '').trim().slice(0, 500) || null`,
    `    const pageUrl = String(body.pageUrl || '').trim().slice(0, 500) || null

    // Marketing opt-in (POPIA). null = the form did not show the question.
    const marketingConsent = body.marketingConsent === undefined ? null : body.marketingConsent === true
    const marketingConsentText = String(body.marketingConsentText || '').trim().slice(0, 500) || null`
  );
  contact = contact.replace(
    `      userAgent: request.headers.get('user-agent') || undefined,
      subject,
    })`,
    `      userAgent: request.headers.get('user-agent') || undefined,
      subject,
      marketingConsent,
      marketingConsentText,
    })`
  );
  fs.writeFileSync(contactPath, contact, 'utf8');
  console.log('contact    consent passthrough added');
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. /api/leads — date range + room to export everything
// ═══════════════════════════════════════════════════════════════════════════
const leadsRoute = BACK + '/app/api/leads/route.ts';
let route = fs.readFileSync(leadsRoute, 'utf8');

if (route.includes('marketing_consent') && route.includes("searchParams.get('from')")) {
  console.log('leads API  already export-capable');
} else {
  route = route.replace(
    `    const limit = Math.min(Number(searchParams.get('limit') || 50), 200)
    const offset = Math.max(Number(searchParams.get('offset') || 0), 0)
    const status = searchParams.get('status')`,
    `    // Cap 5000 so a full-history CSV export can pull everything in one go.
    const limit = Math.min(Number(searchParams.get('limit') || 50), 5000)
    const offset = Math.max(Number(searchParams.get('offset') || 0), 0)
    const status = searchParams.get('status')
    // Optional inclusive date window on created_at (YYYY-MM-DD, UTC).
    const from = searchParams.get('from')
    const to = searchParams.get('to')`
  );

  const SELECT = `'id, name, email, phone, message, subject, business_name, page_url, status, resend_message_id, resend_error, is_read, read_at, redelivered_count, last_redelivered_at, is_test, created_at, updated_at, email_opened_at, email_opened_count, email_clicked_at, marketing_consent, marketing_consent_at, marketing_consent_text'`;
  route = route.replace(
    `'id, name, email, phone, message, subject, business_name, page_url, status, resend_message_id, resend_error, is_read, read_at, redelivered_count, last_redelivered_at, is_test, created_at, updated_at, email_opened_at, email_opened_count, email_clicked_at'`,
    SELECT
  );

  route = route.replace(
    `      const filtered = status ? q.eq('status', status) : q
      const res: any = await filtered`,
    `      let filtered = status ? q.eq('status', status) : q
      if (from) filtered = filtered.gte('created_at', from.length === 10 ? from + 'T00:00:00.000Z' : from)
      if (to) filtered = filtered.lte('created_at', to.length === 10 ? to + 'T23:59:59.999Z' : to)
      const res: any = await filtered`
  );

  // fallback query also needs the date window
  route = route.replace(
    `        if (status) fq = fq.eq('status', status)
        const fb: any = await fq`,
    `        if (status) fq = fq.eq('status', status)
        if (from) fq = fq.gte('created_at', from.length === 10 ? from + 'T00:00:00.000Z' : from)
        if (to) fq = fq.lte('created_at', to.length === 10 ? to + 'T23:59:59.999Z' : to)
        const fb: any = await fq`
  );

  // extend the fallback so a missing migration 019 does not 500 the list
  route = route.replace(
    `      if (error && /email_opened_at|email_clicked_at|email_opened_count/.test(error.message || '')) {`,
    `      if (error && /marketing_consent|email_opened_at|email_clicked_at|email_opened_count/.test(error.message || '')) {`
  );

  fs.writeFileSync(leadsRoute, route, 'utf8');
  console.log('leads API  date range + 5000 cap + consent columns added');
}

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
const L = fs.readFileSync(leadsPath, 'utf8');
const C = fs.readFileSync(contactPath, 'utf8');
const R = fs.readFileSync(leadsRoute, 'utf8');
const M = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/GeistCRM/database/migrations/019_marketing_consent.sql', 'utf8');

assert(M.includes('marketing_consent boolean'), 'migration 019 adds marketing_consent');
assert(M.includes('marketing_consent_text text'), 'migration 019 stores the wording shown');
assert(L.includes('marketingConsent?: boolean | null'), 'leads.ts input type has consent');
assert(L.includes('marketing_consent:'), 'leads.ts writes marketing_consent');
assert(L.includes('marketing_consent_at:'), 'leads.ts writes the timestamp');
assert(L.includes('marketing_consent_text:'), 'leads.ts writes the wording');
assert(C.includes('marketingConsent = body.marketingConsent'), 'contact route reads consent');
assert(C.includes('marketingConsent,'), 'contact route passes consent to submitLead');
assert(R.includes("searchParams.get('from')"), 'leads API has a from date');
assert(R.includes("searchParams.get('to')"), 'leads API has a to date');
assert(R.includes('5000'), 'leads API cap raised for full export');
assert(R.includes('marketing_consent'), 'leads API returns consent columns');
assert(/gte\('created_at'/.test(R) && /lte\('created_at'/.test(R), 'leads API filters created_at');

console.log('\n' + (ok ? 'SERVER SIDE READY (consent + date-filtered export)' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
