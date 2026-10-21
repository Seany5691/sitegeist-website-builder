const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const BASES = {
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  mamma_mia_cakes_and_catering: 'https://mammamiacakesandcatering.vercel.app',
  tammy_s_sticker_shop: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

(async () => {
  let fail = 0;
  for (const [name, base] of Object.entries(BASES)) {
    console.log('\n=== ' + name + ' ===');
    let h;
    try {
      const res = await fetch(base + '/dashboard/index.html', { cache: 'no-store' });
      h = await res.text();
      console.log('  index.html  ' + res.status);
    } catch (e) {
      console.log('  index.html  FETCH FAIL ' + e.message);
      fail++;
      continue;
    }

    // asset refs must be well-formed AND 200
    const refs = h.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
    for (const r of refs) {
      const a = await fetch(base + '/dashboard/' + r, { cache: 'no-store' });
      const ok = a.status === 200 && /^assets\/(styles\.css|app\.js|config\.js)\?v=/.test(r);
      console.log('  ' + a.status + '  ' + r + (ok ? '' : '  *** BAD ***'));
      if (!ok) fail++;
    }
    if (refs.length !== 3) { console.log('  *** expected 3 asset refs, got ' + refs.length + ' ***'); fail++; }

    // new panels + nav present
    for (const id of ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours']) {
      const nav = h.includes('data-section="' + id + '"');
      const panel = h.includes('id="' + id + '"') && h.includes('id="' + id + 'Fields"');
      console.log('  ' + id.padEnd(12) + 'nav:' + (nav ? 'Y' : 'N') + '  panel:' + (panel ? 'Y' : 'N'));
      if (!nav || !panel) fail++;
    }

    // menu labels
    for (const k of ['navProcess', 'navHours', 'showInMenu_process']) {
      console.log('  ' + k.padEnd(22) + (h.includes('id="' + k + '"') ? 'present' : '*** MISSING ***'));
      if (!h.includes('id="' + k + '"')) fail++;
    }
    console.log('  cache-buster: ' + ((h.match(/assets\/app\.js\?v=[0-9.]+/) || ['?'])[0]));
  }

  // app.js must define the schema
  console.log('\n=== app.js schema ===');
  const app = await (await fetch(BASES.missions_ablaze + '/dashboard/assets/app.js?probe=1', { cache: 'no-store' })).text();
  for (const k of ['SECTION_FIELDS', 'saveSectionData', 'hydrateSectionView', 'applySectionView', 'showInMenu']) {
    const ok = app.includes(k);
    console.log('  ' + k.padEnd(22) + (ok ? 'present' : '*** MISSING ***'));
    if (!ok) fail++;
  }

  console.log('\n' + (fail === 0 ? 'LIVE VERIFICATION PASS' : fail + ' PROBLEM(S)'));
  process.exit(fail === 0 ? 0 : 1);
})();
