const fs = require('fs');
const path = require('path');
const SITE = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze';
const env = fs.readFileSync(SITE + '/.env.local', 'utf8');
function envVal(k) {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^"|"$/g, '') : null;
}
const anon = envVal('NEXT_PUBLIC_SUPABASE_ANON_KEY') || envVal('SUPABASE_ANON_KEY');
const url = envVal('NEXT_PUBLIC_SUPABASE_URL') || envVal('SUPABASE_URL');
console.log('anon key length : ' + (anon || '').length);
console.log('anon key prefix : ' + (anon || '').slice(0, 24) + '…');
console.log('supabase url    : ' + url);

// is the anon key referenced from any CLIENT-side source?
console.log('\n=== where is the anon key referenced? ===');
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(e.name)) continue;
    const p = d + '/' + e.name;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) out.push(p);
  }
  return out;
}
for (const f of walk(SITE)) {
  const s = fs.readFileSync(f, 'utf8');
  if (/SUPABASE_ANON_KEY|SUPABASE_URL/.test(s)) {
    const clientish = /'use client'/.test(s) || f.includes('/components/');
    console.log('  ' + f.replace(SITE + '/', '').padEnd(46) + (clientish ? 'CLIENT' : 'server'));
  }
}

// does the BUILT bundle contain the key?
console.log('\n=== is the anon key present in the built client bundle? ===');
const nextDir = SITE + '/.next';
if (!fs.existsSync(nextDir)) {
  console.log('  (.next not built locally — checking the deployed bundle instead)');
} else {
  let hits = 0;
  function walkNext(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = d + '/' + e.name;
      if (e.isDirectory()) walkNext(p);
      else if (/\.(js|css)$/.test(e.name)) {
        try {
          const t = fs.readFileSync(p, 'utf8');
          if (anon && t.includes(anon.slice(20, 60))) { console.log('  *** FOUND in ' + p.replace(SITE + '/', '') + ' ***'); hits++; }
        } catch (e) {}
      }
    }
  }
  walkNext(nextDir + '/static');
  walkNext(nextDir + '/server');
  console.log('  occurrences in .next bundle: ' + hits);
}

// check the live bundle
console.log('\n=== live client bundle check ===');
(async () => {
  // the site is a client shell; find a chunk and grep it
  const html = await (await fetch('https://missions-ablaze.sitespire.co.za/', { cache: 'no-store' })).text();
  const chunks = [...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map(m => m[0]);
  console.log('  chunks referenced in homepage: ' + chunks.length);
  let found = 0;
  for (const c of chunks.slice(0, 12)) {
    const t = await (await fetch('https://missions-ablaze.sitespire.co.za' + c, { cache: 'no-store' })).text();
    if (anon && t.includes(anon.slice(20, 60))) { console.log('  *** ANON KEY IN ' + c + ' ***'); found++; }
    if (url && t.includes(url)) console.log('  supabase url referenced in ' + c);
  }
  console.log('  anon key found in live chunks: ' + found);
})();
