const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const COMP = WB + '/templates/components';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// Exact wording shown to the visitor — stored with the lead so the business can
// discharge the POPIA s11(2) burden of proof. Do not change casually: the
// record has to match what was on screen at the time.
const CONSENT_TEXT = 'Yes, send me news, specials and updates.';

let ok = true;
function assert(cond, label) {
  console.log('  ' + label.padEnd(58) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}

// ── 1. NewsletterBlock ───────────────────────────────────────────────────
{
  const p = COMP + '/newsletter/NewsletterBlock.tsx';
  let s = fs.readFileSync(p, 'utf8');
  const name = 'NewsletterBlock';

  if (s.includes('marketingConsent')) {
    console.log(name.padEnd(20) + 'already has consent');
  } else {
    s = s.replace(
      `  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')`,
      `  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  // POPIA: opt-in must be an affirmative act, so this starts UNTICKED.
  const [marketingConsent, setMarketingConsent] = useState(false)
  const CONSENT_TEXT = '${CONSENT_TEXT}'`
    );
    s = s.replace(
      `          type: 'newsletter',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          email,`,
      `          type: 'newsletter',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          email,
          marketingConsent,
          marketingConsentText: CONSENT_TEXT,`
    );

    // checkbox row, after the form and before the fragment close
    const ANCHOR = `              </form>`;
    const ROW = `              </form>
              <label className="flex items-start gap-2.5 justify-center text-left max-w-md mx-auto mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={e => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 flex-none"
                  style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                />
                <span className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {CONSENT_TEXT}
                </span>
              </label>`;
    if (!s.includes(ANCHOR)) { console.log('  *** NewsletterBlock form anchor missing ***'); ok = false; }
    else { s = s.replace(ANCHOR, ROW); }

    fs.writeFileSync(p, s, 'utf8');
    console.log(name.padEnd(20) + 'consent checkbox added (unticked)');
  }
}

// ── 2. NewsletterPopup ───────────────────────────────────────────────────
{
  const p = COMP + '/features/NewsletterPopup.tsx';
  let s = fs.readFileSync(p, 'utf8');
  const name = 'NewsletterPopup';

  if (s.includes('marketingConsent')) {
    console.log(name.padEnd(20) + 'already has consent');
  } else {
    s = s.replace(
      `  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')`,
      `  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  // POPIA: opt-in must be an affirmative act, so this starts UNTICKED.
  const [marketingConsent, setMarketingConsent] = useState(false)
  const CONSENT_TEXT = '${CONSENT_TEXT}'`
    );
    s = s.replace(
      `          type: 'newsletter',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          email,`,
      `          type: 'newsletter',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          email,
          marketingConsent,
          marketingConsentText: CONSENT_TEXT,`
    );

    const ANCHOR = `                <button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                >
                  {data.ctaLabel || 'Sign me up'}
                </button>
              </form>`;
    const ROW = `                <label className="flex items-start gap-2.5 text-left cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={e => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 flex-none"
                    style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {CONSENT_TEXT}
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                >
                  {data.ctaLabel || 'Sign me up'}
                </button>
              </form>`;
    if (!s.includes(ANCHOR)) { console.log('  *** NewsletterPopup button anchor missing ***'); ok = false; }
    else { s = s.replace(ANCHOR, ROW); }

    fs.writeFileSync(p, s, 'utf8');
    console.log(name.padEnd(20) + 'consent checkbox added (unticked)');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// verify + TSX
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
for (const [name, path] of [
  ['NewsletterBlock', COMP + '/newsletter/NewsletterBlock.tsx'],
  ['NewsletterPopup', COMP + '/features/NewsletterPopup.tsx'],
]) {
  const s = fs.readFileSync(path, 'utf8');
  assert(s.includes('marketingConsent'), name + ' tracks consent state');
  assert(s.includes('marketingConsentText: CONSENT_TEXT'), name + ' sends the wording shown');
  assert(s.includes('type="checkbox"'), name + ' renders a checkbox');
  assert(/checked=\{marketingConsent\}/.test(s), name + ' checkbox is controlled');
  assert(!/type="checkbox"\s+checked(\s|\/|>)/.test(s), name + ' checkbox is NOT pre-ticked');
  assert(/marketingConsent, setMarketingConsent\] = useState\(false\)/.test(s), name + ' consent starts unticked');
  assert(s.includes("type: 'newsletter'"), name + ' still posts as a newsletter lead');
  assert(s.includes("fetch('/api/contact'"), name + ' still hits Resend');
}

let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
console.log('\n=== TSX ===');
if (ts) {
  for (const path of [COMP + '/newsletter/NewsletterBlock.tsx', COMP + '/features/NewsletterPopup.tsx', COMP + '/features/QuoteSlideIn.tsx']) {
    const out = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: path.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  ' + path.split('/').pop().padEnd(24) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => {
      let pos = '';
      if (x.file && x.start != null) {
        const lc = x.file.getLineAndCharacterOfPosition(x.start);
        pos = (lc.line + 1) + ':' + (lc.character + 1) + '  ';
      }
      console.log('      ' + pos + ts.flattenDiagnosticMessageText(x.messageText, ' '));
    });
    if (d.length) ok = false;
  }
}

console.log('\n=== sync to 3 sites ===');
const MAP = [
  ['templates/components/newsletter/NewsletterBlock.tsx', 'components/NewsletterBlock.tsx'],
  ['templates/components/features/NewsletterPopup.tsx', 'components/features/NewsletterPopup.tsx'],
];
for (const s of SITES) {
  for (const [srcRel, destRel] of MAP) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(38) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'CONSENT BOX ADDED (unticked, POPIA-safe)' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
