const BASES = {
  mamma_mia: 'https://www.mammamiacakes.co.za',
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  tammy: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

const EXPECT = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'x-download-options': 'noopen',
  'x-permitted-cross-domain-policies': 'none',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

(async () => {
  let fail = 0;
  for (const [name, base] of Object.entries(BASES)) {
    console.log('\n=== ' + name + ' ===');
    const res = await fetch(base + '/dashboard/index.html', { cache: 'no-store' });
    const h = res.headers;

    console.log('  status                  ' + res.status);
    if (res.status !== 200) fail++;

    for (const [k, v] of Object.entries(EXPECT)) {
      const got = h.get(k);
      const ok = got === v;
      console.log('  ' + k.padEnd(24) + (got || '(absent)') + (ok ? '' : '  *** EXPECTED ' + v + ' ***'));
      if (!ok) fail++;
    }

    const hsts = h.get('strict-transport-security');
    const hstsOk = /max-age=31536000/.test(hsts || '') && /includeSubDomains/.test(hsts || '');
    console.log('  strict-transport-sec    ' + (hsts || '(absent)') + (hstsOk ? '' : '  *** FAIL ***'));
    if (!hstsOk) fail++;

    const pp = h.get('permissions-policy');
    const ppOk = /camera=\(\)/.test(pp || '') && /geolocation=\(\)/.test(pp || '');
    console.log('  permissions-policy      ' + (pp || '(absent)') + (ppOk ? '' : '  *** FAIL ***'));
    if (!ppOk) fail++;

    const csp = h.get('content-security-policy') || '';
    const cspChecks = {
      'frame-ancestors none': /frame-ancestors 'none'/.test(csp),
      'object-src none': /object-src 'none'/.test(csp),
      'base-uri self': /base-uri 'self'/.test(csp),
      'form-action self': /form-action 'self'/.test(csp),
      'script-src self+unsafe-inline': /script-src 'self' 'unsafe-inline'/.test(csp),
      'no unsafe-eval': !/unsafe-eval/.test(csp),
      'allows fonts.googleapis': /fonts\.googleapis\.com/.test(csp),
      'allows fonts.gstatic': /fonts\.gstatic\.com/.test(csp),
      'allows cdnjs': /cdnjs\.cloudflare\.com/.test(csp),
      'allows youtube': /www\.youtube\.com/.test(csp),
      'allows vimeo': /player\.vimeo\.com/.test(csp),
    };
    console.log('  content-security-policy ' + (csp ? csp.slice(0, 60) + '…' : '(absent)'));
    for (const [k, v] of Object.entries(cspChecks)) {
      console.log('    ' + k.padEnd(28) + (v ? 'ok' : '*** FAIL ***'));
      if (!v) fail++;
    }

    // resources still served
    for (const path of ['/api/site-data', '/dashboard/assets/app.js?v=16.0', '/dashboard/assets/styles.css?v=16.0']) {
      const r = await fetch(base + path, { cache: 'no-store' });
      console.log('  GET ' + path.padEnd(34) + r.status);
      if (r.status !== 200) fail++;
    }

    // the external resources CSP allows must actually be reachable
    for (const url of [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    ]) {
      const r = await fetch(url, { cache: 'no-store' });
      console.log('  ext ' + url.slice(0, 56).padEnd(58) + r.status);
      if (r.status !== 200) fail++;
    }
  }

  console.log('\n' + (fail === 0 ? 'SECURITY HEADERS LIVE + NOTHING BROKEN' : fail + ' PROBLEM(S)'));
  process.exit(fail === 0 ? 0 : 1);
})();
