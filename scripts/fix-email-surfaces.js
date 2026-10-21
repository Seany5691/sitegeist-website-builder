const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const COMP = WB + '/templates/components';
const BACK = WB + '/templates/backend';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

let ok = true;
function note(label, cond) {
  console.log('  ' + label.padEnd(56) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. /api/contact — accept newsletter + quote payloads, not just full contacts
// ═══════════════════════════════════════════════════════════════════════════
const routePath = BACK + '/app/api/contact/route.ts';
let route = fs.readFileSync(routePath, 'utf8');

const OLD_HEAD = `    const body = await request.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const message = String(body.message || '').trim()
    const pageUrl = String(body.pageUrl || '').trim().slice(0, 500) || null

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email and message are required.' },
        { status: 400 }
      )
    }`;

const NEW_HEAD = `    const body = await request.json()
    // Lead kind — every email-collecting surface on the site posts here:
    //   'contact'    full contact form (name + email + message)
    //   'newsletter' newsletter block / lead popup (email only)
    //   'quote'      quote slide-in (name + email + phone + message)
    const kind = String(body.type || 'contact').trim().toLowerCase()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const message = String(body.message || '').trim()
    const pageUrl = String(body.pageUrl || '').trim().slice(0, 500) || null

    // Newsletter signups are email-only; a quote may leave the message short.
    let finalName = name
    let finalMessage = message
    if (kind === 'newsletter') {
      finalName = name || 'Newsletter signup'
      finalMessage = message || 'Signed up to the newsletter on the website.'
    } else if (kind === 'quote') {
      finalName = name || 'Quote request'
      finalMessage = message || 'Requested a quote via the website.'
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'An email address is required.' },
        { status: 400 }
      )
    }

    if (kind === 'contact' && (!name || !message)) {
      return NextResponse.json(
        { success: false, message: 'Name, email and message are required.' },
        { status: 400 }
      )
    }

    if (kind === 'quote' && !name && !phone) {
      return NextResponse.json(
        { success: false, message: 'Please add your name or phone number so we can reply.' },
        { status: 400 }
      )
    }`;

if (route.includes("const kind = String(body.type")) {
  console.log('route.ts  already type-aware');
} else {
  if (!route.includes(OLD_HEAD)) {
    console.log('  *** route.ts head anchor not found — aborting ***');
    process.exit(1);
  }
  route = route.replace(OLD_HEAD, NEW_HEAD);
}

const OLD_CALL = `    const result = await submitLead({
      name,
      email,
      phone: phone || undefined,
      message,
      businessName,
      notifyTo,
      brandColors,
      pageUrl: pageUrl || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })`;
const NEW_CALL = `    // Subject line tells the client at a glance which kind of lead arrived.
    const subject =
      kind === 'newsletter'
        ? \`Newsletter Signup - \${businessName}\`
        : kind === 'quote'
          ? \`Quote Request - \${businessName}\`
          : undefined

    const result = await submitLead({
      name: finalName,
      email,
      phone: phone || undefined,
      message: finalMessage,
      businessName,
      notifyTo,
      brandColors,
      pageUrl: pageUrl || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      subject,
    })`;

if (route.includes('kind === \'newsletter\'') && route.includes('Newsletter Signup -')) {
  console.log('route.ts  submitLead call already type-aware');
} else {
  if (!route.includes(OLD_CALL)) {
    console.log('  *** route.ts submitLead anchor not found — aborting ***');
    process.exit(1);
  }
  route = route.replace(OLD_CALL, NEW_CALL);
}
fs.writeFileSync(routePath, route, 'utf8');
console.log('route.ts  patched (contact | newsletter | quote)');

// ═══════════════════════════════════════════════════════════════════════════
// Shared client-side submit helper text (inlined into each component so no
// new shared module has to be added to the ship list).
// ═══════════════════════════════════════════════════════════════════════════
function submitFn({ kind, payloadExpr, afterOk, failState }) {
  return `
    setSending(true)
    setFormError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: '${kind}',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          ${payloadExpr}
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        setFormError(json.message || 'Sorry, that did not go through. Please try again.')
        setSending(false)
        return
      }
      ${afterOk}
    } catch {
      setFormError('Sorry, that did not go through. Please check your connection and try again.')
      setSending(false)
    }`
}

const SENDING_STATE = `  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
`;

const ERROR_BLOCK = `            {formError && (
              <p className="text-sm mt-3" role="alert" style={{ color: '#c0392b' }}>
                {formError}
              </p>
            )}
`;

// ── 2. NewsletterBlock ───────────────────────────────────────────────────
{
  const p = COMP + '/newsletter/NewsletterBlock.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes("type: 'newsletter'")) {
    console.log('NewsletterBlock  already wired');
  } else {
    s = s.replace(
      "  const [email, setEmail] = useState('')\n  const [submitted, setSubmitted] = useState(false)",
      "  const [email, setEmail] = useState('')\n  const [submitted, setSubmitted] = useState(false)\n" + SENDING_STATE.trimEnd()
    );
    const OLD = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }`;
    const NEW = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || sending) return${submitFn({
      kind: 'newsletter',
      payloadExpr: 'email,',
      afterOk: 'setSubmitted(true)',
      failState: true,
    })}
  }`;
    if (!s.includes(OLD)) { console.log('  *** NewsletterBlock submit anchor missing ***'); process.exit(1); }
    s = s.replace(OLD, NEW);
    // show the error under the form
    const FORM_END = `                <button type="submit" className="btn btn-md btn-primary px-8 whitespace-nowrap">
                  {ctaLabel}
                </button>
              </form>`;
    if (s.includes(FORM_END)) {
      s = s.replace(FORM_END, FORM_END + '\n' + ERROR_BLOCK.trimEnd().replace(/^ {12}/gm, '              '));
    }
    fs.writeFileSync(p, s, 'utf8');
    console.log('NewsletterBlock  wired to Resend');
  }
}

// ── 3. NewsletterPopup ───────────────────────────────────────────────────
{
  const p = COMP + '/features/NewsletterPopup.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes("type: 'newsletter'")) {
    console.log('NewsletterPopup   already wired');
  } else {
    s = s.replace(
      "  const [email, setEmail] = useState('')\n  const [submitted, setSubmitted] = useState(false)",
      "  const [email, setEmail] = useState('')\n  const [submitted, setSubmitted] = useState(false)\n" + SENDING_STATE.trimEnd()
    );
    const OLD = `  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    try {
      if (oncePerVisitor) window.localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
  }`;
    const NEW = `  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || sending) return${submitFn({
      kind: 'newsletter',
      payloadExpr: 'email,',
      afterOk: `setSubmitted(true)
      try {
        if (oncePerVisitor) window.localStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* ignore */
      }`,
      failState: true,
    })}
  }`;
    if (!s.includes(OLD)) { console.log('  *** NewsletterPopup submit anchor missing ***'); process.exit(1); }
    s = s.replace(OLD, NEW);
    const BTN = `                <button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                >
                  {data.ctaLabel || 'Sign me up'}
                </button>
              </form>`;
    if (s.includes(BTN)) {
      s = s.replace(BTN, BTN + '\n' + ERROR_BLOCK.trimEnd().replace(/^ {12}/gm, '                '));
    }
    fs.writeFileSync(p, s, 'utf8');
    console.log('NewsletterPopup   wired to Resend');
  }
}

// ── 4. QuoteSlideIn — the inputs were never bound to state ───────────────
{
  const p = COMP + '/features/QuoteSlideIn.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes("type: 'quote'")) {
    console.log('QuoteSlideIn      already wired');
  } else {
    s = s.replace(
      "  const [open, setOpen] = useState(false)\n  const [submitted, setSubmitted] = useState(false)\n  const firstFieldRef = useRef<HTMLInputElement>(null)",
      "  const [open, setOpen] = useState(false)\n  const [submitted, setSubmitted] = useState(false)\n  const [sending, setSending] = useState(false)\n  const [formError, setFormError] = useState('')\n  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })\n  const firstFieldRef = useRef<HTMLInputElement>(null)\n\n  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>\n    setForm(prev => ({ ...prev, [key]: e.target.value }))"
    );

    const OLD = `  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }`;
    const NEW = `  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return${submitFn({
      kind: 'quote',
      payloadExpr: 'name: form.name, email: form.email, phone: form.phone, message: form.message,',
      afterOk: 'setSubmitted(true)',
      failState: true,
    })}
  }`;
    if (!s.includes(OLD)) { console.log('  *** QuoteSlideIn submit anchor missing ***'); process.exit(1); }
    s = s.replace(OLD, NEW);

    // bind the four inputs
    s = s.replace(
      `                <input
                  ref={firstFieldRef}
                  type="text"
                  required`,
      `                <input
                  ref={firstFieldRef}
                  type="text"
                  required
                  value={form.name}
                  onChange={setField('name')}`
    );
    s = s.replace(
      `                <input
                  type="email"
                  required`,
      `                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={setField('email')}`
    );
    s = s.replace(
      `                <input
                  type="tel"`,
      `                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}`
    );
    s = s.replace(
      `                <textarea
                  rows={4}
                  required`,
      `                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={setField('message')}`
    );

    const BTN = `              <button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                Send enquiry
              </button>
            </form>`;
    if (s.includes(BTN)) {
      s = s.replace(BTN, BTN + '\n' + ERROR_BLOCK.trimEnd().replace(/^ {12}/gm, '              '));
    }
    fs.writeFileSync(p, s, 'utf8');
    console.log('QuoteSlideIn      wired to Resend (form state added)');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
const route2 = fs.readFileSync(routePath, 'utf8');
note('route accepts type', route2.includes("const kind = String(body.type"));
note('route handles newsletter', route2.includes("kind === 'newsletter'"));
note('route handles quote', route2.includes("kind === 'quote'"));
note('route sets a subject per kind', route2.includes('Newsletter Signup -') && route2.includes('Quote Request -'));
note('route still logs to Supabase', /submitLead\(/.test(route2));
note('route still uses Resend', /submitLead\(/.test(route2));

for (const [name, path, kind] of [
  ['NewsletterBlock', COMP + '/newsletter/NewsletterBlock.tsx', 'newsletter'],
  ['NewsletterPopup', COMP + '/features/NewsletterPopup.tsx', 'newsletter'],
  ['QuoteSlideIn', COMP + '/features/QuoteSlideIn.tsx', 'quote'],
]) {
  const s = fs.readFileSync(path, 'utf8');
  note(name + ' posts to /api/contact', s.includes("fetch('/api/contact'"));
  note(name + ' sends type: ' + kind, s.includes("type: '" + kind + "'"));
  note(name + ' never fakes success', s.includes('setFormError') && s.includes('json.success'));
  note(name + ' binds its inputs', s.includes('onChange') || s.includes('setField'));
}

const qs = fs.readFileSync(COMP + '/features/QuoteSlideIn.tsx', 'utf8');
note('QuoteSlideIn name bound', qs.includes("setField('name')"));
note('QuoteSlideIn email bound', qs.includes("setField('email')"));
note('QuoteSlideIn phone bound', qs.includes("setField('phone')"));
note('QuoteSlideIn message bound', qs.includes("setField('message')"));

// non-email widgets must stay offline
for (const f of ['features/StickyCallBar.tsx', 'features/WhatsAppFab.tsx', 'features/CookieBar.tsx']) {
  const s = fs.readFileSync(COMP + '/' + f, 'utf8');
  note(f.replace('features/', '') + ' does not send email', !/fetch\(|mailto:/.test(s));
}

// ── TSX diagnostics ──────────────────────────────────────────────────────
let ts;
try { ts = require(WB + '/node_modules/typescript'); } catch (e) { ts = null; }
if (ts) {
  for (const path of [COMP + '/newsletter/NewsletterBlock.tsx', COMP + '/features/NewsletterPopup.tsx', COMP + '/features/QuoteSlideIn.tsx']) {
    const out = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: path.split('/').pop(),
    });
    const d = out.diagnostics || [];
    console.log('  TSX ' + path.split('/').pop().padEnd(24) + (d.length === 0 ? 'clean' : d.length + ' DIAGNOSTIC(S)'));
    d.forEach(x => console.log('      ' + ts.flattenDiagnosticMessageText(x.messageText, ' ')));
    if (d.length) ok = false;
  }
}

// ── sync ─────────────────────────────────────────────────────────────────
console.log('\n=== sync to 3 sites ===');
const MAP = [
  ['templates/backend/app/api/contact/route.ts', 'app/api/contact/route.ts'],
  ['templates/components/newsletter/NewsletterBlock.tsx', 'components/NewsletterBlock.tsx'],
  ['templates/components/features/NewsletterPopup.tsx', 'components/features/NewsletterPopup.tsx'],
  ['templates/components/features/QuoteSlideIn.tsx', 'components/features/QuoteSlideIn.tsx'],
];
for (const s of SITES) {
  for (const [srcRel, destRel] of MAP) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(42) + (match ? 'OK' : '*** MISMATCH ***'));
  }
}

console.log('\n' + (ok ? 'ALL EMAIL SURFACES NOW GO THROUGH RESEND' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
