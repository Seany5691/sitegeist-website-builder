const fs = require('fs');
const BASES = {
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  mamma_mia_cakes_and_catering: 'https://mammamiacakesandcatering.vercel.app',
  tammy_s_sticker_shop: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

(async () => {
  let fail = 0;
  for (const [name, base] of Object.entries(BASES)) {
    console.log('\n=== ' + name + ' ===');
    const h = await (await fetch(base + '/dashboard/index.html', { cache: 'no-store' })).text();
    const refs = h.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
    console.log('  refs: ' + JSON.stringify(refs));
    const badRefs = refs.length !== 3 || refs.some(r => !/^assets\/(styles\.css|app\.js|config\.js)\?v=/.test(r));
    if (badRefs) { console.log('  *** BAD REFS ***'); fail++; }

    for (const r of refs) {
      const res = await fetch(base + '/dashboard/' + r, { cache: 'no-store' });
      console.log('  ' + res.status + '  ' + r);
      if (res.status !== 200) fail++;
    }

    // config.js must be per-site and placeholder-free
    const cfg = await (await fetch(base + '/dashboard/assets/config.js', { cache: 'no-store' })).text();
    const ph = (cfg.match(/\{\{[A-Z_]+\}\}/g) || []).length;
    const bn = (cfg.match(/businessName:\s*"([^"]*)"/) || [])[1];
    console.log('  config.js: businessName="' + bn + '"  placeholders=' + ph);
    if (ph > 0) { console.log('  *** PLACEHOLDERS LEAKED ***'); fail++; }

    // app.js must carry the new pieces
    const app = await (await fetch(base + '/dashboard/assets/app.js', { cache: 'no-store' })).text();
    const need = {
      'SECTION_FIELDS': app.includes('const SECTION_FIELDS'),
      'saveSectionData': app.includes('function saveSectionData'),
      'isSectionEditor': app.includes('function isSectionEditor'),
      'cbRes (login fix)': app.includes('const cbRes = await fetch'),
      'rate-msg': app.includes('Sign-in was blocked'),
      'bind block outside handler': app.includes('vslPanel.addEventListener(\'click\', onFeaturesGridClick);'),
    };
    for (const [k, v] of Object.entries(need)) {
      console.log('  ' + k.padEnd(32) + (v ? 'ok' : '*** MISSING ***'));
      if (!v) fail++;
    }

    // index.html: 9 panels + nav + menu labels
    for (const id of ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours']) {
      const nav = h.includes('data-section="' + id + '"');
      const panel = h.includes('id="' + id + 'Fields"');
      if (!nav || !panel) { console.log('  *** ' + id + ' nav:' + nav + ' panel:' + panel + ' ***'); fail++; }
    }
    console.log('  9 section panels + nav: ' + (['process','latestWork','partners','awards','instagram','newsletter','statsBar','video','hours'].every(id => h.includes('data-section="' + id + '"') && h.includes('id="' + id + 'Fields"')) ? 'ok' : '*** MISSING ***'));
    console.log('  menu labels: ' + (h.includes('id="navProcess"') && h.includes('id="showInMenu_process"') ? 'ok' : '*** MISSING ***'));
    console.log('  website control lists: ' + (h.includes('id="websiteSectionsList"') && h.includes('id="websitePagesList"') ? 'ok' : '*** MISSING ***'));
  }
  console.log('\n' + (fail === 0 ? 'ALL LIVE CHECKS PASS' : fail + ' PROBLEM(S)'));
  process.exit(fail === 0 ? 0 : 1);
})();
