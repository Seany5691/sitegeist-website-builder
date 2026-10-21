const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const P = WB + '/templates/dashboard';
const idx = fs.readFileSync(P + '/index.html', 'utf8');
const app = fs.readFileSync(P + '/assets/app.js', 'utf8');

console.log('=== EXISTING Email / Leads panel in the dashboard ===');
const i = idx.indexOf('id="leads"');
console.log(idx.slice(i, i + 2200));

console.log('\n=== app.js lead functions ===');
for (const fn of ['loadLeads', 'openLeadModal', 'redeliverLead', 'renderLeadRow', 'leadsTableBody', 'exportLead', 'downloadLead', 'csv', 'CSV']) {
  const hits = [];
  let pos = 0;
  while ((pos = app.indexOf(fn, pos + 1)) !== -1 && hits.length < 3) hits.push(pos);
  console.log('  ' + fn.padEnd(18) + (hits.length ? 'found at ' + hits.join(',') : 'NOT PRESENT'));
}

console.log('\n=== loadLeads implementation ===');
const l = app.indexOf('function loadLeads');
console.log(app.slice(l, l + 1600));

console.log('\n=== /api/leads route ===');
const r = fs.readFileSync(WB + '/templates/backend/app/api/leads/route.ts', 'utf8');
console.log(r.slice(0, 2000));

console.log('\n=== form_submissions columns (from lib/leads.ts insert) ===');
const leads = fs.readFileSync(WB + '/templates/backend/lib/leads.ts', 'utf8');
const ins = leads.indexOf('.insert({');
console.log(leads.slice(ins, ins + 800));

console.log('\n=== is there a Supabase export / CSV helper anywhere? ===');
for (const term of ['CSV', 'csv', 'export', 'download', 'Blob(', 'createObjectURL', 'text/csv']) {
  const inApp = app.includes(term);
  const inIdx = idx.includes(term);
  console.log('  ' + term.padEnd(20) + 'app.js=' + (inApp ? 'YES' : 'no ') + '  index.html=' + (inIdx ? 'YES' : 'no '));
}
