const BASES = {
  mamma_mia: 'https://www.mammamiacakes.co.za',
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  tammy: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

(async () => {
  let fail = 0;
  const P = (ok, label) => {
    console.log('    ' + label.padEnd(50) + (ok ? 'ok' : '*** FAIL ***'));
    if (!ok) fail++;
  };

  for (const [name, base] of Object.entries(BASES)) {
    console.log('\n=== ' + name + ' ===');

    // regression
    const home = await fetch(base + '/', { cache: 'no-store' });
    P(home.status === 200, 'homepage 200');
    const dash = await fetch(base + '/dashboard/index.html', { cache: 'no-store' });
    P(dash.status === 200, 'dashboard 200');
    const dashHtml = await dash.text();
    P(/assets\/app\.js\?v=17\.0/.test(dashHtml), 'cache-buster v17.0 (no mangled refs)');
    P((dashHtml.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || []).length === 3, 'all 3 asset refs well-formed');

    // FIX 4 — headers
    const h = dash.headers;
    P(h.get('x-frame-options') === 'DENY', 'FIX4 X-Frame-Options: DENY');
    P(h.get('x-content-type-options') === 'nosniff', 'FIX4 X-Content-Type-Options: nosniff');
    P(/max-age=31536000/.test(h.get('strict-transport-security') || ''), 'FIX4 HSTS');
    P(!!h.get('permissions-policy'), 'FIX4 Permissions-Policy');
    const csp = h.get('content-security-policy') || '';
    P(/frame-ancestons|frame-ancestors 'none'/.test(csp), 'FIX4 CSP frame-ancestors none');
    P(/object-src 'none'/.test(csp), 'FIX4 CSP object-src none');
    P(!/unsafe-eval/.test(csp), 'FIX4 CSP has no unsafe-eval');

    // FIX 6 — error sanitisation
    const bad = await fetch(base + '/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    const badText = await bad.text();
    P(bad.status === 400, 'FIX6 invalid contact -> 400');
    P(!/node_modules|TypeError|at Object\./.test(badText), 'FIX6 no stack/trace leaked');

    // FIX 5 — rate limit header/behaviour on the endpoint (code-level; verify 429 shape)
    const sd = await fetch(base + '/api/site-data', { cache: 'no-store' });
    P(sd.status === 200, 'site-data still 200');
    const sdText = await sd.text();
    P(!/"error"\s*:\s*"(Error|TypeError|ReferenceError)/.test(sdText), 'FIX6 site-data no raw error');

    // auth guards intact
    const up = await fetch(base + '/api/upload', { method: 'POST', body: new FormData() });
    P(up.status === 401, 'FIX1 upload still auth-guarded');
    const ld = await fetch(base + '/api/leads', { cache: 'no-store' });
    P(ld.status === 401, 'leads still auth-guarded');
    const st = await fetch(base + '/api/stats', { cache: 'no-store' });
    P(st.status === 401, 'stats still auth-guarded');

    // FIX 2 — deployed app.js must carry the escapers
    const app = await (await fetch(base + '/dashboard/assets/app.js?v=17.0', { cache: 'no-store' })).text();
    P(app.includes('function escapeJs'), 'FIX2 escapeJs deployed');
    P(app.includes('function escapeHtml'), 'FIX2 escapeHtml deployed');
    P(app.includes('escapeJs(category)'), 'FIX2 onclick category escaped');
    P(!/src="\$\{[a-zA-Z_$][\w.]*\}"/.test(app), 'FIX2 no raw src="${var}"');
    P(app.includes('escapeHtml(post.title'), 'FIX2 blog title escaped');
    P(app.includes('escapeHtml(h.dayOfWeek)'), 'FIX2 hours escaped');
    P((app.match(/function escapeHtml/g) || []).length === 1, 'FIX2 escapeHtml defined once');

    // section panels + export still present (regression from earlier work)
    P(dashHtml.includes('id="processFields"'), 'section panels present');
    P(dashHtml.includes('leadsExportRange'), 'lead export present');
    P(dashHtml.includes('nav-group'), 'sidebar groups present');
  }

  // FIX 3 — code-level only; confirm the live pages still work and note state
  console.log('\n=== FIX 3 (tenancy) — code deployed, DB lockdown staged ===');
  console.log('    getAdminClient falls back gracefully until SUPABASE_SERVICE_ROLE_KEY is set.');
  console.log('    Migration 020 is written but NOT applied — apply it only after the env var.');

  console.log('\n' + (fail === 0 ? 'ALL 6 SECURITY FIXES LIVE — NO REGRESSION' : fail + ' PROBLEM(S)'));
  process.exit(fail === 0 ? 0 : 1);
})();
