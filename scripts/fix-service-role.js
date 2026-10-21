const fs = require('fs');
const { execFileSync } = require('child_process');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const VERCEL_JS = 'C:/Users/seany/AppData/Roaming/npm/node_modules/vercel/dist/vc.js';
const runVercel = (cwd, args) =>
  execFileSync(process.execPath, [VERCEL_JS, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });

// The shared ecosystem Supabase service-role key (server-side ONLY — never
// NEXT_PUBLIC_, never in a client bundle). Same value for every site.
const SERVICE_KEY = process.argv[2];
if (!SERVICE_KEY) {
  console.log('usage: node fix-service-role.js <SUPABASE_SERVICE_ROLE_KEY>');
  process.exit(1);
}
if (!/^eyJ/.test(SERVICE_KEY)) {
  console.log('*** that does not look like a JWT ***');
  process.exit(1);
}

const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];
let fail = 0;

for (const site of SITES) {
  const dir = ROOT + '/Websites/' + site;
  console.log('\n=== ' + site + ' ===');
  for (const envName of ['production', 'preview']) {
    try {
      try { runVercel(dir, ['env', 'rm', 'SUPABASE_SERVICE_ROLE_KEY', envName, '-y']); } catch (e) {}
      runVercel(dir, ['env', 'add', 'SUPABASE_SERVICE_ROLE_KEY', '--value', SERVICE_KEY, envName]);
      console.log('  SUPABASE_SERVICE_ROLE_KEY  ' + envName.padEnd(11) + 'OK');
    } catch (e) {
      console.log('  SUPABASE_SERVICE_ROLE_KEY  ' + envName.padEnd(11) + '*** ' + String(e.stderr || e.message).slice(0, 140));
      fail++;
    }
  }
  const out = runVercel(dir, ['env', 'ls']);
  const need = ['TENANT_ID', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'EMAIL_FROM'];
  const missing = need.filter(k => !out.includes(k));
  console.log('  verify: ' + (missing.length === 0 ? 'ALL VARS PRESENT (incl. service role)' : 'MISSING ' + missing.join(', ')));
  if (missing.length) fail++;
}

console.log('\n' + (fail === 0 ? 'SERVICE-ROLE KEY SET ON ALL 3 SITES' : fail + ' PROBLEM(S)'));
process.exit(fail === 0 ? 0 : 1);
