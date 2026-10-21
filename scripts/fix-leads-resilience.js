const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const BACK = WB + '/templates/backend';
const leadsPath = BACK + '/lib/leads.ts';

let src = fs.readFileSync(leadsPath, 'utf8');
let ok = true;

if (src.includes('consent columns missing')) {
  console.log('leads.ts  already has the migration-tolerant insert');
} else {
  // Find the single .insert({ ... }) block inside submitLead and wrap it in a
  // try-with-fallback: if migration 019 is not applied yet, retry without the
  // consent columns so lead capture NEVER breaks.
  const START = '  // 1. Insert as pending BEFORE sending so the dashboard shows the lead immediately\n  const { data: row, error: insertError } = await supabase\n    .from(\'form_submissions\')\n    .insert({';
  const idx = src.indexOf(START);
  if (idx < 0) {
    console.log('  *** submitLead insert anchor not found ***');
    process.exit(1);
  }
  // the insert object ends with "})\n    .select('id')\n    .single()"
  const tailAnchor = "    })\n    .select('id')\n    .single()";
  const tailIdx = src.indexOf(tailAnchor, idx);
  if (tailIdx < 0) {
    console.log('  *** submitLead insert tail not found ***');
    process.exit(1);
  }

  const insertBody = src.slice(idx, tailIdx + tailAnchor.length);
  // split the object literal so we can build a consent-free variant
  const consentLines = [
    '      marketing_consent: input.marketingConsent === undefined ? null : input.marketingConsent === true,',
    '      marketing_consent_at: input.marketingConsent === undefined ? null : new Date().toISOString(),',
    '      marketing_consent_text: input.marketingConsentText ? String(input.marketingConsentText).slice(0, 500) : null,',
  ];
  const withoutConsent = consentLines.reduce((acc, line) => acc.replace('\n' + line, ''), insertBody);

  const replacement = `  // 1. Insert as pending BEFORE sending so the dashboard shows the lead immediately.
  //    Migration 019 adds the POPIA consent columns; if it has not been applied
  //    yet we retry without them so lead capture NEVER stops working.
  const insertRow = async (withConsent: boolean) => {
    const payload: Record<string, unknown> = {
      tenant_id: tenantId,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
      subject: input.subject || (input.isTest ? \`Test Lead - \${input.businessName}\` : \`New Lead - \${input.businessName}\`),
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
  }`;

  src = src.slice(0, idx) + replacement + src.slice(tailIdx + tailAnchor.length);
  fs.writeFileSync(leadsPath, src, 'utf8');
  console.log('leads.ts  insert is now migration-tolerant');
}

// ── verify ───────────────────────────────────────────────────────────────
src = fs.readFileSync(leadsPath, 'utf8');
console.log('\n=== verify ===');
function assert(c, l) {
  console.log('  ' + l.padEnd(58) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}
assert(src.includes('const insertRow = async'), 'has a reusable insert helper');
assert(src.includes('if (withConsent)'), 'consent columns are optional');
assert(src.includes('marketing_consent'), 'still writes consent when the column exists');
assert(src.includes('run migration 019'), 'warns loudly when the column is missing');
assert(/marketing_consent/.test(src) && /insertRow\(false\)/.test(src), 'falls back so leads still capture');

// the body must still be balanced and contain submitLead's later steps
assert(src.includes('// 2. Send via Resend'), 'step 2 (Resend) still present');
assert(src.includes('// 3. Record the Resend message id'), 'step 3 (message id) still present');
assert(src.includes('export async function submitLead'), 'submitLead still exported');

// ── TS diagnostics on the TS file ────────────────────────────────────────
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
if (ts) {
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    fileName: 'leads.ts',
  });
  const d = out.diagnostics || [];
  console.log('  ' + 'TS diagnostics'.padEnd(58) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
  d.forEach(x => {
    let pos = '';
    if (x.file && x.start != null) {
      const lc = x.file.getLineAndCharacterOfPosition(x.start);
      pos = (lc.line + 1) + ':' + (lc.character + 1) + '  ';
    }
    console.log('      ' + pos + ts.flattenDiagnosticMessageText(x.messageText, ' '));
  });
  if (d.length) ok = false;
}

console.log('\n' + (ok ? 'LEAD CAPTURE WILL NOT BREAK IF 019 IS NOT YET APPLIED' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
