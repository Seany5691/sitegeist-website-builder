const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// ── 1. Rate limiter 5 -> 10 attempts / 15 min (single-admin dashboard) ─────
console.log('=== rate limiter 5 -> 10 ===');
const RL_FILES = [
  WB + '/templates/backend/lib/rate-limiter.ts',
  ...SITES.map(s => ROOT + '/Websites/' + s + '/lib/rate-limiter.ts'),
];
for (const p of RL_FILES) {
  if (!fs.existsSync(p)) { console.log('  MISSING ' + p); continue; }
  let t = fs.readFileSync(p, 'utf8');
  const before = t;
  t = t.replace(
    /new RateLimiter\(5, 15\)(.*)$/m,
    'new RateLimiter(10, 15)$1'
  );
  t = t.replace(
    /\/\/ 5 attempts per 15 minutes/g,
    '// 10 attempts per 15 minutes (single-admin dashboard — 5 looked like a wrong password)'
  );
  if (t === before) {
    console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + 'NO CHANGE');
  } else {
    fs.writeFileSync(p, t, 'utf8');
    const n = (t.match(/new RateLimiter\(10, 15\)/) || []).length;
    console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + 'PATCHED  (' + n + ' occurrence)');
  }
}

// ── 2. handleLogin must report the REAL failure, not blame the password ───
console.log('\n=== handleLogin: surface the real error ===');
const APP_FILES = [
  WB + '/templates/dashboard/assets/app.js',
  ...SITES.map(s => ROOT + '/Websites/' + s + '/public/dashboard/assets/app.js'),
];

const OLD_FETCH = `    await fetch('/api/auth/callback/credentials', {`;
const NEW_FETCH = `    const cbRes = await fetch('/api/auth/callback/credentials', {`;

const OLD_TAIL = `    // Session created by THIS attempt only (old session was cleared above)
    const session = await getAuthSession();
    if (session) {
      errorEl.style.display = 'none';
      await showDashboard();
      return;
    }

    throw new Error('Incorrect username or password');`;

const NEW_TAIL = `    // Session created by THIS attempt only (old session was cleared above)
    const session = await getAuthSession();
    if (session) {
      errorEl.style.display = 'none';
      await showDashboard();
      return;
    }

    // No session. Surface the REAL reason instead of blaming the password.
    // NextAuth redirects back to the sign-in page with ?error=<reason>, and a
    // rate-limit block is otherwise indistinguishable from a wrong password.
    let reason = '';
    try {
      const finalUrl = (cbRes && cbRes.url) || '';
      const m = finalUrl.match(/[?&]error=([^&]+)/);
      if (m) reason = decodeURIComponent(m[1].replace(/\\+/g, ' ')).trim();
    } catch (e) { /* ignore */ }

    const BUILTIN = /^(AccessDenied|Configuration|CredentialsSignin|SessionRequired|Default|Signin|OAuth|Callback|OAuthCallback|OAuthAccountNotLinked|EmailCreateAccount|EmailSignin|OAuthCreateAccount|Verification|AccessDenied)$/i;
    if (/too many|rate ?limit|try again in|attempts remaining/i.test(reason)) {
      throw new Error(reason);
    }
    if (reason && !BUILTIN.test(reason)) {
      throw new Error(reason);
    }
    if (/^AccessDenied$/i.test(reason)) {
      throw new Error('Sign-in was blocked. If you have tried a few times, wait 15 minutes and try again.');
    }
    throw new Error('Incorrect username or password');`;

for (const p of APP_FILES) {
  if (!fs.existsSync(p)) { console.log('  MISSING ' + p); continue; }
  let t = fs.readFileSync(p, 'utf8');
  if (t.includes('cbRes && cbRes.url')) {
    console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + 'already patched');
    continue;
  }
  if (!t.includes(OLD_FETCH)) { console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + '*** FETCH ANCHOR MISSING ***'); continue; }
  if (!t.includes(OLD_TAIL)) { console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + '*** TAIL ANCHOR MISSING ***'); continue; }
  t = t.replace(OLD_FETCH, NEW_FETCH);
  t = t.replace(OLD_TAIL, NEW_TAIL);
  fs.writeFileSync(p, t, 'utf8');
  const ok = t.includes('cbRes && cbRes.url') && t.includes('Sign-in was blocked');
  console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + (ok ? 'PATCHED' : '*** VERIFY FAILED ***'));
}

// ── verify ────────────────────────────────────────────────────────────────
console.log('\n=== verify ===');
for (const p of APP_FILES) {
  const t = fs.readFileSync(p, 'utf8');
  console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) +
    (t.includes('const cbRes = await fetch') ? 'cbRes ' : 'NO-cbRes ') +
    (t.includes('decodeURIComponent') ? 'decode ' : 'NO-decode ') +
    (t.includes('Sign-in was blocked') ? 'rateMsg' : 'NO-rateMsg'));
}
for (const p of RL_FILES) {
  const t = fs.readFileSync(p, 'utf8');
  console.log('  ' + p.replace(ROOT + '/', '').padEnd(56) + (t.includes('new RateLimiter(10, 15)') ? 'limit=10' : '*** still 5 ***'));
}
