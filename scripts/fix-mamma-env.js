const fs = require('fs');
const { execFileSync } = require('child_process');
const SITE = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering';
// `vercel` is a PowerShell wrapper — call the Node entry point directly so the
// arguments never pass through a shell (which would mangle $, ! and quotes).
const VERCEL_JS = 'C:/Users/seany/AppData/Roaming/npm/node_modules/vercel/dist/vc.js';
const runVercel = (args) =>
  execFileSync(process.execPath, [VERCEL_JS, ...args], { cwd: SITE, encoding: 'utf8', stdio: 'pipe' });

const env = fs.readFileSync(SITE + '/.env.local', 'utf8');
function localVal(k) {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  if (!m) return null;
  return m[1].trim().replace(/^"([\s\S]*)"$/, '$1'); // strip one layer of wrapping quotes
}

// The canonical public URL is the custom domain, not the *.vercel.app alias.
const ADDITIONS = {
  TENANT_ID: localVal('TENANT_ID'),
  SUPABASE_URL: localVal('SUPABASE_URL'),
  SUPABASE_ANON_KEY: localVal('SUPABASE_ANON_KEY'),
  RESEND_API_KEY: localVal('RESEND_API_KEY'),
  EMAIL_FROM: localVal('EMAIL_FROM'),
  CONTACT_FORM_FALLBACK_TO: localVal('CONTACT_FORM_FALLBACK_TO'),
  NEXT_PUBLIC_SITE_URL: 'https://www.mammamiacakes.co.za',
};

console.log('=== values to add (Production + Preview) ===');
for (const [k, v] of Object.entries(ADDITIONS)) {
  const ok = !!v;
  console.log('  ' + k.padEnd(28) + (ok ? 'len=' + String(v.length).padStart(4) + '  ' + String(v).slice(0, 48) : '*** MISSING ***'));
  if (!ok) process.exit(1);
}

console.log('\n=== writing to Vercel ===');
for (const [k, v] of Object.entries(ADDITIONS)) {
  for (const envName of ['production', 'preview']) {
    try {
      // remove first so a re-run cannot leave a duplicate
      try { runVercel(['env', 'rm', k, envName, '-y']); } catch (e) { /* not present */ }
      runVercel(['env', 'add', k, '--value', v, envName]);
      console.log('  ' + k.padEnd(28) + envName.padEnd(12) + 'OK');
    } catch (e) {
      console.log('  ' + k.padEnd(28) + envName.padEnd(12) + '*** FAILED: ' + String(e.stderr || e.message).slice(0, 160) + ' ***');
      process.exit(1);
    }
  }
}

console.log('\n=== verify with vercel env ls ===');
const out = runVercel(['env', 'ls']);
console.log(out.split('\n').filter(l => /TENANT_ID|SUPABASE|RESEND|EMAIL_FROM|CONTACT_FORM|NEXT_PUBLIC_SITE|DASHBOARD|NEXTAUTH|BLOB/.test(l)).join('\n'));

const needed = ['TENANT_ID', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'RESEND_API_KEY', 'EMAIL_FROM', 'NEXT_PUBLIC_SITE_URL'];
const missing = needed.filter(k => !out.includes(k));
console.log('\n' + (missing.length === 0 ? 'ALL REQUIRED VARS NOW PRESENT' : 'STILL MISSING: ' + missing.join(', ')));
process.exit(missing.length === 0 ? 0 : 1);
