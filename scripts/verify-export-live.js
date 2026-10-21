const BASES = {
  mamma_mia: 'https://www.mammamiacakes.co.za',
  missions_ablaze: 'https://missions-ablaze.sitespire.co.za',
  tammy: 'https://tammy-s-sticker-shop.sitespire.co.za',
};

(async () => {
  let fail = 0;
  for (const [n, u] of Object.entries(BASES)) {
    const h = await (await fetch(u + '/dashboard/index.html', { cache: 'no-store' })).text();
    const app = await (await fetch(u + '/dashboard/assets/app.js', { cache: 'no-store' })).text();
    const r = {
      range: h.includes('leadsExportRange'),
      allTime: h.includes('value="all" selected'),
      custom: h.includes('value="custom"'),
      fromTo: h.includes('id="leadsExportFrom"') && h.includes('id="leadsExportTo"'),
      csv: app.includes('function exportLeadsCsv'),
      consent: app.includes('consentLabel'),
      notRecorded: app.includes('Not recorded'),
      bom: app.includes('\\uFEFF'),
      injection: app.includes('[=+'),
      testCol: app.includes('Is Test'),
      refs: (h.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || []).join(' '),
    };
    const ok = r.range && r.allTime && r.custom && r.fromTo && r.csv && r.consent && r.notRecorded && r.bom && r.testCol;
    if (!ok) fail++;
    console.log(n.padEnd(15) + 'range=' + r.range + ' allTime=' + r.allTime + ' custom=' + r.custom +
      ' fromTo=' + r.fromTo + ' csv=' + r.csv + ' consentCol=' + r.consent + ' notRecorded=' + r.notRecorded +
      ' bom=' + r.bom + ' testCol=' + r.testCol);
    console.log('                refs=' + r.refs);
  }
  console.log('\n' + (fail === 0 ? 'EXPORT UI LIVE ON ALL SITES' : fail + ' SITE(S) OFF'));
  process.exit(fail === 0 ? 0 : 1);
})();
