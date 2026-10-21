const BASES = {
  mamma_mia: 'https://www.mammamiacakes.co.za',
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  tammy: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

(async () => {
  let fail = 0;
  for (const [name, base] of Object.entries(BASES)) {
    console.log('\n=== ' + name + ' ===');

    // 1. site still serves
    const home = await fetch(base + '/', { cache: 'no-store' });
    console.log('  homepage               ' + home.status + (home.status === 200 ? '' : '  *** FAIL ***'));
    if (home.status !== 200) fail++;

    // 2. site-data public + no error leakage on the happy path
    const sd = await fetch(base + '/api/site-data', { cache: 'no-store' });
    const sdText = await sd.text();
    const sdLeak = /"error"\s*:\s*"(Error|TypeError|ReferenceError|\/[A-Za-z]:\\|.*node_modules)/.test(sdText);
    console.log('  /api/site-data         ' + sd.status + '  leaksInternalError=' + sdLeak);
    if (sdLeak) fail++;

    // 3. contact with an invalid body -> 400, generic message, no stack
    const bad = await fetch(base + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const badText = await bad.text();
    const badLeak = /node_modules|at Object\.|TypeError|ReferenceError|\/[A-Za-z]:\\/.test(badText);
    console.log('  POST /api/contact {}   ' + bad.status + '  body=' + badText.slice(0, 70) + (badLeak ? '  *** LEAKS ***' : '  no stack leak'));
    if (bad.status !== 400 || badLeak) fail++;

    // 4. upload without auth -> 401/403 (still guarded)
    const up = await fetch(base + '/api/upload', { method: 'POST', body: new FormData() });
    console.log('  POST /api/upload (anon)' + up.status + (up.status >= 400 && up.status < 500 ? '  guarded' : '  *** NOT GUARDED ***'));
    if (up.status < 400 || up.status >= 500) fail++;

    // 5. leads without auth -> 401
    const ld = await fetch(base + '/api/leads', { cache: 'no-store' });
    console.log('  GET  /api/leads (anon) ' + ld.status + (ld.status >= 400 && ld.status < 500 ? '  guarded' : '  *** NOT GUARDED ***'));
    if (ld.status < 400 || ld.status >= 500) fail++;

    // 6. dashboard still loads
    const dash = await fetch(base + '/dashboard/index.html', { cache: 'no-store' });
    console.log('  dashboard/index.html   ' + dash.status);
    if (dash.status !== 200) fail++;
  }

  console.log('\n' + (fail === 0 ? 'LIVE CHECKS PASS — fixes 1/5/6 behaving, no regression' : fail + ' PROBLEM(S)'));
  process.exit(fail === 0 ? 0 : 1);
})();
