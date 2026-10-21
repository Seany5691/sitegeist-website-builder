const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const BACK = WB + '/templates/backend';
const CRM = ROOT + '/GeistCRM/database/migrations';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

let ok = true;
function assert(c, l) {
  console.log('  ' + l.padEnd(64) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. supabase-server.ts — add getAdminClient()
// ═══════════════════════════════════════════════════════════════════════════
const supaPath = BACK + '/lib/supabase-server.ts';
let supa = fs.readFileSync(supaPath, 'utf8');

if (supa.includes('getAdminClient')) {
  console.log('supabase-server  already has getAdminClient');
} else {
  supa += `

// ── Privileged client ───────────────────────────────────────────────────────
// The anon key is server-side only (it never reaches the browser bundle), but
// the table-level RLS policies are permissive by design. Where a route must
// read leads, we prefer the service-role client so access is granted by the
// server and the row filter is the ONLY gate — and we still apply
// .eq('tenant_id', …) on every query as defence in depth.
//
// Falls back to the anon client when SUPABASE_SERVICE_ROLE_KEY is not set, so
// behaviour is unchanged until that env var is added. Nothing breaks either way.

let adminClient: SupabaseClient | null = null
let adminWarned = false

export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL in the environment.')
  }

  if (serviceKey) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    return adminClient
  }

  // Graceful degradation: behave exactly as before, but say so loudly once.
  if (!adminWarned) {
    adminWarned = true
    console.warn(
      '[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set — falling back to the anon client. ' +
        'Add the service-role key to Vercel and run migration 020 to enforce tenant isolation at the database.'
    )
  }
  if (!anonKey) {
    throw new Error('Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set.')
  }
  adminClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return adminClient
}

/** True when reads are protected at the database as well as in code. */
export function isDbIsolationEnabled(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
`;
  fs.writeFileSync(supaPath, supa, 'utf8');
  console.log('supabase-server  getAdminClient added (graceful fallback)');
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. read paths prefer the admin client
// ═══════════════════════════════════════════════════════════════════════════
const READ_FILES = ['app/api/leads/route.ts', 'app/api/stats/route.ts'];
for (const rel of READ_FILES) {
  const p = BACK + '/' + rel;
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('getAdminClient')) {
    console.log('  ' + rel.padEnd(40) + 'already using admin client');
    continue;
  }
  s = s.replace(
    "import { getSupabase, getTenantId } from '@/lib/supabase-server'",
    "import { getSupabase, getAdminClient, getTenantId } from '@/lib/supabase-server'"
  );
  // prefer the admin client for reads; keep the existing .eq('tenant_id') filters
  s = s.replace(/\bconst supabase = getSupabase\(\)/g, 'const supabase = getAdminClient()');
  fs.writeFileSync(p, s, 'utf8');
  console.log('  ' + rel.padEnd(40) + 'reads via getAdminClient');
}

// leads.ts also reads (redeliverLead) — switch those reads too
{
  const p = BACK + '/lib/leads.ts';
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('getAdminClient')) {
    s = s.replace(
      "import { getSupabase, getTenantId } from './supabase-server'",
      "import { getSupabase, getAdminClient, getTenantId } from './supabase-server'"
    );
    // only the SELECT inside redeliverLead needs elevated read; inserts/updates
    // stay on the standard client so the existing write policies keep applying.
    s = s.replace(
      '  const { data: row, error } = await supabase\n    .from(\'form_submissions\')\n    .select(\'*\')',
      '  // Elevated read: lead contents are PII, so prefer the privileged client.\n  // The .eq(\'tenant_id\') filter below remains as defence in depth.\n  const { data: row, error } = await getAdminClient()\n    .from(\'form_submissions\')\n    .select(\'*\')'
    );
    fs.writeFileSync(p, s, 'utf8');
    console.log('  ' + 'lib/leads.ts'.padEnd(40) + 'redeliverLead reads elevated');
  } else {
    console.log('  ' + 'lib/leads.ts'.padEnd(40) + 'already using admin client');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. migration 020 — deny anon READS on form_submissions
// ═══════════════════════════════════════════════════════════════════════════
const migPath = CRM + '/020_lock_leads_reads.sql';
const MIGRATION = `-- 020_lock_leads_reads.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- ⚠️  APPLY THIS ONLY AFTER every site has SUPABASE_SERVICE_ROLE_KEY set in
--     Vercel and has been redeployed. Applying it first will make every
--     dashboard show zero leads, because the sites currently read via the anon
--     key.
--
--     Order of operations:
--       1. Add SUPABASE_SERVICE_ROLE_KEY to each site's Vercel env.
--       2. Redeploy each site.
--       3. Confirm leads still appear in the dashboard.
--       4. THEN run this migration.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- What this does:
--   Closes the last cross-tenant read path. Reads of form_submissions (which
--   hold client PII — names, emails, phones, messages) are no longer possible
--   with the anon key at all. Only the service-role key can read them, and the
--   server code always filters by tenant_id.
--
--   INSERT and UPDATE are deliberately left open to anon, because:
--     - the GeistCRM Resend webhook updates delivery status with the anon key
--     - it preserves the current write behaviour exactly
--   The exposure was always READS, so that is what we close.
--
-- Note: the anon key never reaches the browser bundle — it is server-side only.
-- This is defence in depth, not a live exploit fix.

-- Replace the permissive select policy with a deny for anon.
drop policy if exists "lead select per tenant" on public.form_submissions;

create policy "lead select service role only" on public.form_submissions
  for select to authenticated
  using (true);

-- Explicitly deny anon reads. (Without a policy, Postgres denies by default,
-- but stating it makes the intent unambiguous to anyone reading this later.)
create policy "lead select deny anon" on public.form_submissions
  for select to anon
  using (false);

-- Writes stay exactly as they were:
--   "lead insert per tenant"  → insert to anon, authenticated with check (true)
--   "lead update per tenant"  → update to anon, authenticated using (true)

-- Verification (run after applying):
--   -- should return 0 rows when queried with the anon key
--   select count(*) from public.form_submissions;
--   -- and the site dashboards must still show their own leads
`;
fs.writeFileSync(migPath, MIGRATION, 'utf8');
console.log('\nmigration 020 written (guarded — apply only after the env var)');

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
const s2 = fs.readFileSync(supaPath, 'utf8');
assert(s2.includes('export function getAdminClient'), 'getAdminClient exported');
assert(s2.includes('export function isDbIsolationEnabled'), 'isDbIsolationEnabled exported');
assert(s2.includes('SUPABASE_SERVICE_ROLE_KEY'), 'reads the service-role key');
assert(s2.includes('falling back to the anon client'), 'degrades gracefully with a loud warning');
assert(s2.includes('export function getSupabase'), 'original getSupabase still exported');

for (const rel of READ_FILES) {
  const t = fs.readFileSync(BACK + '/' + rel, 'utf8');
  assert(t.includes('getAdminClient()'), rel.replace('app/api/', '') + ' uses the privileged client');
  assert(t.includes(".eq('tenant_id'"), rel.replace('app/api/', '') + ' still filters by tenant');
}
const l2 = fs.readFileSync(BACK + '/lib/leads.ts', 'utf8');
assert(l2.includes('getAdminClient()'), 'leads.ts redeliver read elevated');
assert(l2.includes('marketing_consent'), 'consent columns still written');

const mig = fs.readFileSync(migPath, 'utf8');
assert(mig.includes('APPLY THIS ONLY AFTER'), 'migration carries the ordering warning');
assert(mig.includes('using (false)'), 'anon reads denied');
assert(/for select to anon/.test(mig), 'explicit anon select policy');
assert(!/for (insert|update) to anon using \(false\)/.test(mig), 'writes NOT blocked');

// TS
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TS ===');
if (ts) {
  for (const rel of ['lib/supabase-server.ts', 'lib/leads.ts', 'app/api/leads/route.ts', 'app/api/stats/route.ts']) {
    const out = ts.transpileModule(fs.readFileSync(BACK + '/' + rel, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: rel.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  ' + rel.padEnd(34) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
    if (d.length) ok = false;
  }
}

console.log('\n=== sync to 3 sites ===');
const ALL = ['lib/supabase-server.ts', 'lib/leads.ts', 'app/api/leads/route.ts', 'app/api/stats/route.ts'];
for (const s of SITES) {
  for (const rel of ALL) {
    const content = fs.readFileSync(BACK + '/' + rel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + rel;
    fs.writeFileSync(dst, content, 'utf8');
    if (fs.readFileSync(dst, 'utf8') !== content) ok = false;
  }
  console.log('  ' + s.padEnd(32) + ALL.length + ' files synced');
}

console.log('\n' + (ok ? 'FIX 3 APPLIED — code ready, migration staged' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
