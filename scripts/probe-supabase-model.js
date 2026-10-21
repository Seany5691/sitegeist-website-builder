const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';

function envVal(path, key) {
  try {
    const t = fs.readFileSync(path, 'utf8');
    const m = t.match(new RegExp('^' + key + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^"|"$/g, '') : null;
  } catch (e) { return null; }
}

console.log('=== SUPABASE_URL across the whole ecosystem ===');
const holders = [
  ['GeistCRM', ROOT + '/GeistCRM/.env.local'],
  ['GeistBilling', ROOT + '/GeistBilling/.env.local'],
  ['GeistTrack', ROOT + '/GeistTrack/.env.local'],
  ['Website Builder', ROOT + '/Website Builder/.env.local'],
  ['site: mamma_mia', ROOT + '/Websites/mamma_mia_cakes_and_catering/.env.local'],
  ['site: missions_ablaze', ROOT + '/Websites/missions_ablaze/.env.local'],
  ['site: tammy', ROOT + '/Websites/tammy_s_sticker_shop/.env.local'],
];
const urls = {};
for (const [name, p] of holders) {
  const u = envVal(p, 'NEXT_PUBLIC_SUPABASE_URL') || envVal(p, 'SUPABASE_URL');
  const ak = envVal(p, 'NEXT_PUBLIC_SUPABASE_ANON_KEY') || envVal(p, 'SUPABASE_ANON_KEY');
  const sk = envVal(p, 'SUPABASE_SERVICE_ROLE_KEY') || envVal(p, 'SUPABASE_SERVICE_KEY');
  const tk = envVal(p, 'TENANT_ID');
  console.log('  ' + name.padEnd(20) + 'url=' + (u || '(none)').padEnd(48) + 'anon=' + (ak ? 'set(' + ak.length + ')' : '(none)').padEnd(12) + 'service=' + (sk ? 'SET' : 'none').padEnd(6) + 'tenant=' + (tk || '(none)'));
  if (u) urls[u] = (urls[u] || 0) + 1;
}
console.log('\n  distinct Supabase URLs: ' + Object.keys(urls).length);
Object.entries(urls).forEach(([u, n]) => console.log('    ' + u + '  used by ' + n + ' project(s)'));

console.log('\n=== how tenant scoping is enforced ===');
const leads = fs.readFileSync(ROOT + '/Website Builder/templates/backend/lib/leads.ts', 'utf8');
const supa = fs.readFileSync(ROOT + '/Website Builder/templates/backend/lib/supabase-server.ts', 'utf8');
const route = fs.readFileSync(ROOT + '/Website Builder/templates/backend/app/api/leads/route.ts', 'utf8');
const mig = fs.readFileSync(ROOT + '/GeistCRM/database/migrations/016_form_submissions.sql', 'utf8');

console.log('  lib/supabase-server.ts:');
console.log('    getTenantId reads: ' + (supa.match(/process\.env\.[A-Z_]+/g) || []).join(', '));
console.log('    getSupabase key:   ' + (/SERVICE_ROLE|service_role|anon/i.test(supa) ? (supa.match(/(SERVICE_ROLE|service_role|anon)/g) || []).join(',') : '?'));
console.log('');
console.log('  app/api/leads/route.ts filters:');
console.log('    .eq(\'tenant_id\' …) present: ' + route.includes(".eq('tenant_id'"));
console.log('    occurrences: ' + (route.match(/\.eq\('tenant_id'/g) || []).length);
console.log('');
console.log('  RLS policies on form_submissions (from 016):');
const pols = mig.match(/create policy[\s\S]*?using \([^)]*\)/g) || [];
pols.forEach(p => console.log('    ' + p.replace(/\s+/g, ' ').slice(0, 130)));
console.log('');
console.log('    comment in 016: ' + (mig.match(/-- (Tenant scoping[^\n]*)/) || [])[1]);

console.log('\n=== do the site env files carry the SAME anon key? ===');
const keys = new Set();
holders.forEach(([, p]) => {
  const k = envVal(p, 'NEXT_PUBLIC_SUPABASE_ANON_KEY') || envVal(p, 'SUPABASE_ANON_KEY');
  if (k) keys.add(k);
});
console.log('  distinct anon keys across all projects: ' + keys.size);
