const NEW = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours'];
const BASES = {
  'LIVE mamma_mia': 'https://www.mammamiacakes.co.za',
  'LIVE mamma_mia (vercel)': 'https://mammamiacakesandcatering.vercel.app',
  'LIVE missions_ablaze': 'https://missions-ablaze.sitespire.co.za',
  'LIVE tammy': 'https://tammy-s-sticker-shop.sitespire.co.za',
};

function analyse(html) {
  const tagRe = /<(\/?)section\b([^>]*)>/g;
  const stack = [];
  let m;
  const findings = {};
  while ((m = tagRe.exec(html)) !== null) {
    if (m[1] !== '/') {
      const idM = m[2].match(/id="([^"]+)"/);
      stack.push({ id: idM ? idM[1] : '(no id)', at: m.index });
    } else {
      const open = stack.pop();
      if (open) {
        for (const id of NEW) {
          const at = html.indexOf('<section id="' + id + '"');
          if (at > open.at && at < m.index && !findings[id]) findings[id] = open.id;
        }
      }
    }
  }
  const nested = [];
  for (const id of NEW) {
    if (findings[id] && findings[id] !== '(no id)') nested.push(id + ' inside #' + findings[id]);
    if (!html.includes('<section id="' + id + '"')) nested.push(id + ' MISSING');
    if (!html.includes('id="' + id + 'Fields"')) nested.push(id + ' Fields MISSING');
  }
  const opens = (html.match(/<section\b/g) || []).length;
  const closes = (html.match(/<\/section>/g) || []).length;
  const doubled = (html.match(/<\/section>\s*\n\s*<\/section>/g) || []).length;
  return { nested, opens, closes, doubled };
}

(async () => {
  let fail = 0;
  for (const [label, base] of Object.entries(BASES)) {
    const res = await fetch(base + '/dashboard/index.html', { cache: 'no-store' });
    const html = await res.text();
    const r = analyse(html);
    const refs = html.match(/assets\/[A-Za-z0-9._-]+\?v=[0-9.]+/g) || [];
    const ok = r.nested.length === 0 && r.opens === r.closes && r.doubled === 0;
    if (!ok) fail++;
    console.log(label.padEnd(24) + 'HTTP ' + res.status + '  sections ' + r.opens + '/' + r.closes + '  doubledClose=' + r.doubled + '  ' + JSON.stringify(refs));
    console.log('  ' + (ok ? 'ALL 9 PANELS ARE ROOT-LEVEL (visible when activated)' : 'PROBLEM: ' + r.nested.join(', ')));
  }
  console.log('\n' + (fail === 0 ? 'NESTING VERIFIED LIVE ON ALL SITES' : fail + ' SITE(S) STILL BROKEN'));
  process.exit(fail === 0 ? 0 : 1);
})();
