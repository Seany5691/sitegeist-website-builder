const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const P = WB + '/templates/dashboard';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

const idxPath = P + '/index.html';
const appPath = P + '/assets/app.js';
const cssPath = P + '/assets/styles.css';

let ok = true;
function assert(cond, label) {
  console.log('  ' + label.padEnd(58) + (cond ? 'ok' : '*** FAIL ***'));
  if (!cond) ok = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. index.html — export controls in the leads toolbar
// ═══════════════════════════════════════════════════════════════════════════
let idx = fs.readFileSync(idxPath, 'utf8');
if (idx.includes('leadsExportRange')) {
  console.log('index.html export controls already present');
} else {
  const ANCHOR = `            <button class="secondary-btn" id="btnRefreshLeads" onclick="loadLeads()">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <span class="leads-count" id="leadsCount"></span>`;
  const NEW = `            <button class="secondary-btn" id="btnRefreshLeads" onclick="loadLeads()">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <span class="leads-count" id="leadsCount"></span>
          </div>

          <div class="leads-export">
            <div class="leads-export-field">
              <label for="leadsExportRange">Export</label>
              <select id="leadsExportRange" onchange="onExportRangeChange()">
                <option value="all" selected>All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div class="leads-export-field hidden" id="leadsExportFromWrap">
              <label for="leadsExportFrom">From</label>
              <input type="date" id="leadsExportFrom">
            </div>
            <div class="leads-export-field hidden" id="leadsExportToWrap">
              <label for="leadsExportTo">To</label>
              <input type="date" id="leadsExportTo">
            </div>
            <button class="primary-btn" id="btnExportLeads" onclick="exportLeadsCsv()">
              <i class="fas fa-download"></i><span>Download CSV</span>
            </button>
            <p class="leads-export-hint">Downloads every lead in the range, with the full message and consent record. Open it in Excel to filter.</p>`;
  if (!idx.includes(ANCHOR)) {
    console.log('  *** leads toolbar anchor not found ***');
    ok = false;
  } else {
    idx = idx.replace(ANCHOR, NEW);
    fs.writeFileSync(idxPath, idx, 'utf8');
    console.log('index.html export controls added');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. app.js — CSV builder + download
// ═══════════════════════════════════════════════════════════════════════════
let app = fs.readFileSync(appPath, 'utf8');
if (app.includes('function exportLeadsCsv')) {
  console.log('app.js     export already present');
} else {
  const HELPER = `

// ============================================
// LEAD EXPORT — download every lead as CSV.
//
// Columns cover the full lead plus the POPIA consent record, so a client can
// filter in Excel and see who is actually marketable. Test leads are included
// but flagged in their own column so they can be dropped in one click.
// ============================================

/** Show the From/To pickers only for a custom range. */
function onExportRangeChange() {
  const range = document.getElementById('leadsExportRange');
  const custom = range && range.value === 'custom';
  document.getElementById('leadsExportFromWrap')?.classList.toggle('hidden', !custom);
  document.getElementById('leadsExportToWrap')?.classList.toggle('hidden', !custom);
}

/** Resolve the export window to {from, to} ISO dates, or {} for all time. */
function getExportWindow() {
  const range = document.getElementById('leadsExportRange')?.value || 'all';
  if (range === 'all') return {};
  if (range === 'custom') {
    const from = document.getElementById('leadsExportFrom')?.value || '';
    const to = document.getElementById('leadsExportTo')?.value || '';
    return {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
  }
  const days = Number(range);
  if (!Number.isFinite(days) || days <= 0) return {};
  const to = new Date();
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

/**
 * One CSV cell. A value starting with = + - @ would be executed as a formula
 * by Excel / Sheets, so those are neutralised with a leading apostrophe.
 */
function csvCell(value) {
  let s = value == null ? '' : String(value);
  if (/^[=+\\-@]/.test(s)) s = "'" + s;
  if (/[",\\n\\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** Human-readable consent cell — null means the field did not exist yet. */
function consentLabel(lead) {
  if (lead.marketing_consent === true) return 'Yes';
  if (lead.marketing_consent === false) return 'No';
  return 'Not recorded';
}

async function exportLeadsCsv() {
  const btn = document.getElementById('btnExportLeads');
  const win = getExportWindow();
  const params = new URLSearchParams({ limit: '5000', offset: '0' });
  if (win.from) params.set('from', win.from);
  if (win.to) params.set('to', win.to);

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Preparing…</span>'; }
  try {
    const { ok: fetched, data } = await fetchJson('/api/leads?' + params.toString());
    if (!fetched || !data?.success) {
      showToast(data?.message || 'Failed to load leads for export', 'danger');
      return;
    }
    const leads = data.leads || [];
    if (!leads.length) {
      showToast('No leads in that range.', 'warning');
      return;
    }

    const header = [
      'Received', 'Name', 'Email', 'Phone', 'Message', 'Subject',
      'Page', 'Status', 'Email Opened', 'Email Clicked', 'Read',
      'Marketing Consent', 'Consent Given At', 'Consent Wording Shown',
      'Is Test', 'Redelivered Count',
    ];
    const rows = leads.map(l => [
      l.created_at ? new Date(l.created_at).toISOString() : '',
      l.name,
      l.email,
      l.phone,
      l.message,
      l.subject,
      l.page_url,
      l.status,
      l.email_opened_at ? new Date(l.email_opened_at).toISOString() : 'Never',
      l.email_clicked_at ? new Date(l.email_clicked_at).toISOString() : '',
      l.is_read ? 'Read' : 'Unread',
      consentLabel(l),
      l.marketing_consent_at ? new Date(l.marketing_consent_at).toISOString() : '',
      l.marketing_consent_text,
      l.is_test ? 'Yes' : 'No',
      l.redelivered_count || 0,
    ]);

    const csv = '\\uFEFF' + [header, ...rows].map(r => r.map(csvCell).join(',')).join('\\r\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const range = win.from || win.to ? (win.from || 'start') + '_to_' + (win.to || 'today') : 'all-time';
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-' + range + '-' + stamp + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(leads.length + ' lead' + (leads.length === 1 ? '' : 's') + ' downloaded.');
  } catch (err) {
    console.error('exportLeadsCsv error:', err);
    showToast('Export failed. Please try again.', 'danger');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-download"></i><span>Download CSV</span>'; }
  }
}
`;
  const anchor = '// ============================================\n// PHASE 10: UX ENHANCEMENTS';
  if (app.includes(anchor)) {
    app = app.replace(anchor, HELPER + '\n' + anchor);
  } else {
    app += HELPER;
  }
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('app.js     exportLeadsCsv + range picker added');
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. styles.css
// ═══════════════════════════════════════════════════════════════════════════
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('.leads-export')) {
  console.log('styles.css export styles already present');
} else {
  css += `

/* ============================================
   Lead export controls
   ============================================ */
.leads-export {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin: 0.85rem 0 1.15rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
  border-radius: var(--radius, 12px);
  background: var(--bg-dark, rgba(255, 255, 255, 0.03));
}

.leads-export-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.leads-export-field label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted, rgba(255, 255, 255, 0.5));
}

.leads-export-field select,
.leads-export-field input[type="date"] {
  height: 2.35rem;
  padding: 0 0.7rem;
  border-radius: 8px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.12));
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
  font-size: 0.85rem;
}

.leads-export-hint {
  flex: 1 1 100%;
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-muted, rgba(255, 255, 255, 0.45));
}

.leads-export .hidden {
  display: none;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('styles.css export styles added');
}

// ═══════════════════════════════════════════════════════════════════════════
// verify
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n=== verify ===');
idx = fs.readFileSync(idxPath, 'utf8');
app = fs.readFileSync(appPath, 'utf8');
css = fs.readFileSync(cssPath, 'utf8');

assert(idx.includes('id="leadsExportRange"'), 'index.html has the range picker');
assert(idx.includes('value="all" selected'), 'All time is the default option');
assert(idx.includes('value="custom"'), 'Custom range is offered');
assert(idx.includes('id="leadsExportFrom"') && idx.includes('id="leadsExportTo"'), 'From/To date pickers present');
assert(idx.includes('exportLeadsCsv()'), 'Download CSV button wired');

assert(app.includes('function exportLeadsCsv'), 'exportLeadsCsv defined');
assert(app.includes('function onExportRangeChange'), 'range picker handler defined');
assert(app.includes('function csvCell'), 'CSV cell escaper defined');
assert(app.includes("type: 'text/csv"), 'sends the right MIME type');
assert(app.includes('\\uFEFF'), 'adds a UTF-8 BOM so Excel reads accents correctly');
assert(app.includes('^[=+') || app.includes("[=+-@]") || app.includes('[=+\\-@]') || /startsWith|neutralis|\[=/.test(app), 'neutralises CSV formula injection');
assert(app.includes('consentLabel'), 'export has a consent column');
assert(app.includes('Not recorded'), 'unset consent reads as "Not recorded", not No');
assert(app.includes('Is Test'), 'test leads are flagged in their own column');
assert(app.includes("limit: '5000'"), 'export pulls up to 5000 rows');
assert(app.includes("params.set('from'") && app.includes("params.set('to'"), 'export honours the date range');
assert(css.includes('.leads-export'), 'export controls styled');
assert(app.includes('marketing_consent_text'), 'exports the exact wording shown');

console.log('\n=== sync to 3 sites ===');
const DASH = [
  ['templates/dashboard/index.html', 'public/dashboard/index.html'],
  ['templates/dashboard/assets/app.js', 'public/dashboard/assets/app.js'],
  ['templates/dashboard/assets/styles.css', 'public/dashboard/assets/styles.css'],
];
for (const s of SITES) {
  for (const [srcRel, destRel] of DASH) {
    const content = fs.readFileSync(WB + '/' + srcRel, 'utf8');
    const dst = ROOT + '/Websites/' + s + '/' + destRel;
    fs.writeFileSync(dst, content, 'utf8');
    const match = fs.readFileSync(dst, 'utf8') === content;
    if (!match) ok = false;
    console.log('  ' + s.padEnd(32) + destRel.padEnd(32) + (match ? 'OK' : '*** MISMATCH ***'));
  }
  const cfg = fs.readFileSync(ROOT + '/Websites/' + s + '/public/dashboard/assets/config.js', 'utf8');
  const ph = (cfg.match(/\{\{[A-Z_]+\}\}/g) || []).length;
  if (ph > 0) { ok = false; console.log('  *** ' + s + ' config.js has placeholders ***'); }
}

console.log('\n' + (ok ? 'LEAD EXPORT READY' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
