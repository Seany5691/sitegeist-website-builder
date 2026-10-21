const fs = require('fs');
const { execFileSync } = require('child_process');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const VERCEL_JS = 'C:/Users/seany/AppData/Roaming/npm/node_modules/vercel/dist/vc.js';
const runVercel = (cwd, args) =>
  execFileSync(process.execPath, [VERCEL_JS, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });

// site -> canonical public URL
const SITES = {
  tammy_s_sticker_shop: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

let fail = 0;
for (const [site, canonical] of Object.entries(SITES)) {
  const SITE_DIR = ROOT + '/Websites/' + site;
  const env = fs.readFileSync(SITE_DIR + '/.env.local', 'utf8');
  const localVal = (k) => {
    const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^"([\s\S]*)"$/, '$1') : null;
  };

  const ADDITIONS = {
    TENANT_ID: localVal('TENANT_ID'),
    SUPABASE_URL: localVal('SUPABASE_URL'),
    SUPABASE_ANON_KEY: localVal('SUPABASE_ANON_KEY'),
    RESEND_API_KEY: localVal('RESEND_API_KEY'),
    EMAIL_FROM: localVal('EMAIL_FROM'),
    CONTACT_FORM_FALLBACK_TO: localVal('CONTACT_FORM_FALLBACK_TO'),
    NEXT_PUBLIC_SITE_URL: canonical,
  };

  console.log('\n=== ' + site + ' ===');
  const missing = Object.entries(ADDITIONS).filter(([, v]) => !v);
  if (missing.length) {
    console.log('  *** missing local values: ' + missing.map(m => m[0]).join(', ') + ' ***');
    fail++;
    continue;
  }

  for (const [k, v] of Object.entries(ADDITIONS)) {
    for (const envName of ['production', 'preview']) {
      try {
        try { runVercel(SITE_DIR, ['env', 'rm', k, envName, '-y']); } catch (e) {}
        runVercel(SITE_DIR, ['env', 'add', k, '--value', v, envName]);
        console.log('  ' + k.padEnd(28) + envName.padEnd(11) + 'OK');
      } catch (e) {
        console.log('  ' + k.padEnd(28) + envName.padEnd(11) + '*** FAILED: ' + String(e.stderr || e.message).slice(0, 140));
        fail++;
      }
    }
  }

  const out = runVercel(SITE_DIR, ['env', 'ls']);
  const needed = ['TENANT_ID', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'RESEND_API_KEY', 'EMAIL_FROM', 'NEXT_PUBLIC_SITE_URL'];
  const stillMissing = needed.filter(k => !out.includes(k));
  console.log('  verify: ' + (stillMissing.length === 0 ? 'ALL REQUIRED VARS PRESENT' : 'MISSING ' + stillMissing.join(', ')));
  if (stillMissing.length) fail++;
}

console.log('\n' + (fail === 0 ? 'ENV FIXED' : fail + ' PROBLEM(S)'));
process.exit(fail === 0 ? 0 : 1);
