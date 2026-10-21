const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const COMP = WB + '/templates/components';
const BACK = WB + '/templates/backend';

function scan(label, path) {
  let src;
  try { src = fs.readFileSync(path, 'utf8'); } catch (e) {
    console.log('  ' + label.padEnd(26) + 'FILE MISSING');
    return;
  }
  const hasFetch = /fetch\(/.test(src);
  const posts = (src.match(/fetch\(([^)]{0,120})/g) || []).map(s => s.replace(/\s+/g, ' ').slice(0, 110));
  const endpoint = posts.length ? posts : ['(no fetch call)'];
  const emailField = /type="email"|type=\{?['"]email['"]|email/.test(src);
  const submits = /onSubmit|handleSubmit|type="submit"|type=\{?['"]submit['"]/.test(src);
  const resendish = /\/api\/contact|\/api\/leads|resend|sendEmail|notify/i.test(src);
  console.log('\n--- ' + label + ' ---');
  console.log('  file            : ' + path.replace(WB + '/', ''));
  console.log('  collects email  : ' + emailField);
  console.log('  has a submit    : ' + submits);
  console.log('  fetch calls     : ' + endpoint.join(' | '));
  console.log('  touches lead API: ' + resendish);
}

console.log('=== EMAIL-COLLECTING SURFACES ===');
scan('Newsletter section', COMP + '/newsletter/NewsletterBlock.tsx');
scan('Newsletter / Lead Popup', COMP + '/features/NewsletterPopup.tsx');
scan('Quote Slide-in', COMP + '/features/QuoteSlideIn.tsx');
scan('Contact form', COMP + '/contact/ContactSplit.tsx');
scan('Contact (centered)', COMP + '/contact/ContactCentered.tsx');
scan('Contact (full)', COMP + '/contact/ContactFull.tsx');
scan('Contact (minimal)', COMP + '/contact/ContactMinimal.tsx');
scan('Contact (cards)', COMP + '/contact/ContactCards.tsx');
scan('Contact (map)', COMP + '/contact/ContactMap.tsx');

console.log('\n=== NON-EMAIL WIDGETS (should NOT need Resend) ===');
for (const f of ['features/StickyCallBar.tsx', 'features/WhatsAppFab.tsx', 'features/ClickToCallFab.tsx', 'features/CookieBar.tsx', 'features/StickyHeader.tsx', 'features/AnnouncementBanner.tsx', 'features/ScrollProgress.tsx', 'features/PhotoLightbox.tsx', 'features/BeforeAfter.tsx', 'features/TrustBadges.tsx', 'features/AreasServed.tsx']) {
  const p = COMP + '/' + f;
  const src = fs.readFileSync(p, 'utf8');
  const mailto = /mailto:/.test(src);
  const fetches = (src.match(/fetch\(/g) || []).length;
  console.log('  ' + f.replace('features/', '').padEnd(26) + 'mailto=' + (mailto ? 'YES' : 'no ') + '  fetch=' + fetches);
}

console.log('\n=== LEAD PIPELINE (what actually sends) ===');
const contact = fs.readFileSync(BACK + '/app/api/contact/route.ts', 'utf8');
console.log('--- app/api/contact/route.ts (' + contact.split('\n').length + ' lines) ---');
console.log('  uses Resend           : ' + /resend|Resend|RESEND_API_KEY/i.test(contact));
console.log('  writes Supabase       : ' + /supabase|form_submissions/i.test(contact));
console.log('  has a type/kind field : ' + /type|kind|source|origin/i.test(contact));
console.log('  notifies the client   : ' + /notifyEmail|CONTACT_FORM_FALLBACK_TO|to:/i.test(contact));
console.log('\n  HEAD:');
console.log(contact.slice(0, 1800));
