const BASES = {
  'mamma_mia': 'https://www.mammamiacakes.co.za',
  'missions_ablaze': 'https://missions-ablaze.sitespire.co.za',
  'tammy': 'https://tammy-s-sticker-shop.sitespire.co.za',
};
const PLAN = ['overview','leads','hero','content','about','services','gallery','pricing','testimonials','team','blog','faq','statsBar','process','latestWork','partners','awards','instagram','newsletter','video','vsl','hours','seo','design-system','features','settings'];

(async () => {
  let fail = 0;
  for (const [name, base] of Object.entries(BASES)) {
    const h = await (await fetch(base + '/dashboard/index.html', { cache: 'no-store' })).text();
    const order = [];
    const parts = h.split('data-section="');
    for (let i = 1; i < parts.length; i++) order.push(parts[i].split('"')[0]);
    const dupes = order.filter((v, i) => order.indexOf(v) !== i);
    const matches = order.join(',') === PLAN.join(',');

    const hoursAt = h.indexOf('<section id="hours"');
    const listAt = h.indexOf('id="businessHoursList"');
    const hoursSectionEnd = h.indexOf('</section>', hoursAt);
    const listInHours = listAt > hoursAt && listAt < hoursSectionEnd;
    const listInSettings = /Business Hours<\/h3>[\s\S]{0,600}businessHoursList/.test(h);

    const refs = h.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
    const ok = matches && dupes.length === 0 && listInHours && !listInSettings;
    if (!ok) fail++;
    console.log('\n' + name);
    console.log('  nav order matches plan : ' + matches);
    console.log('  duplicate tabs         : ' + (dupes.length ? dupes.join(',') : 'none'));
    console.log('  groups                 : ' + (h.match(/data-nav-group="/g) || []).length);
    console.log('  hours list in Hours tab: ' + listInHours);
    console.log('  hours still in Settings: ' + listInSettings);
    console.log('  refs                   : ' + JSON.stringify(refs));
  }
  console.log('\n' + (fail === 0 ? 'LIVE NAV + HOURS VERIFIED' : fail + ' SITE(S) OFF'));
  process.exit(fail === 0 ? 0 : 1);
})();
