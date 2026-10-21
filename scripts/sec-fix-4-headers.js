const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const WB = ROOT + '/Website Builder';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

let ok = true;
function assert(c, l) {
  console.log('  ' + l.padEnd(64) + (c ? 'ok' : '*** FAIL ***'));
  if (!c) ok = false;
}

const NEXT_CONFIG = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Disable font optimization to prevent build failures when Google Fonts are unreachable
  optimizeFonts: false,

  // ── Security headers ────────────────────────────────────────────────────
  // Applied to every response including the static dashboard assets in /public.
  //
  // The five "safe" headers (X-Frame-Options, X-Content-Type-Options,
  // Referrer-Policy, HSTS, Permissions-Policy) cannot break rendering.
  //
  // CSP is the one that can, so it is scoped to exactly what the platform
  // loads:
  //   - 'unsafe-inline' for scripts is REQUIRED: the dashboard uses 100+ inline
  //     onclick handlers. It still blocks loading scripts from any other
  //     origin, which is the main XSS delivery route.
  //   - fonts.googleapis.com / fonts.gstatic.com / cdnjs.cloudflare.com are
  //     allowed for the dashboard's Google Fonts + Font Awesome.
  //   - youtube / vimeo / google maps are allowed for embedded media.
  //   - img-src is deliberately wide (any https image) because clients paste
  //     their own image links. Images are a far lower risk than scripts.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Never allow the site to be framed — kills clickjacking of the login
          { key: 'X-Frame-Options', value: 'DENY' },
          // Never let the browser guess a content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak the referring URL to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS for a year, include subdomains, allow preload
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Deny powerful features nobody uses here
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          // Legacy IE MIME sniffing
          { key: 'X-Download-Options', value: 'noopen' },
          // Don't let third-party sites embed us via <base> manipulation
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;

console.log('=== FIX 4: security headers ===');
for (const s of SITES) {
  const p = ROOT + '/Websites/' + s + '/next.config.js';
  fs.writeFileSync(p, NEXT_CONFIG, 'utf8');
  const written = fs.readFileSync(p, 'utf8');
  console.log('  ' + s.padEnd(32) + 'next.config.js ' + written.length + 'b');
}

// also keep the template in step
const tpl = WB + '/templates/backend/next.config.js';
fs.writeFileSync(tpl, NEXT_CONFIG, 'utf8');
console.log('  ' + 'template'.padEnd(32) + 'next.config.js written (ships to future builds)');

console.log('\n=== verify ===');
for (const s of SITES) {
  const t = fs.readFileSync(ROOT + '/Websites/' + s + '/next.config.js', 'utf8');
  assert(t.includes('X-Frame-Options'), s + ' X-Frame-Options');
  assert(t.includes('X-Content-Type-Options'), s + ' X-Content-Type-Options');
  assert(t.includes('Referrer-Policy'), s + ' Referrer-Policy');
  assert(t.includes('Strict-Transport-Security'), s + ' HSTS');
  assert(t.includes('Permissions-Policy'), s + ' Permissions-Policy');
  assert(t.includes('Content-Security-Policy'), s + ' CSP');
  assert(t.includes("frame-ancestors 'none'"), s + ' CSP frame-ancestors');
  assert(t.includes("object-src 'none'"), s + ' CSP object-src');
  assert(t.includes("base-uri 'self'"), s + ' CSP base-uri');
  assert(t.includes('fonts.googleapis.com'), s + ' allows Google Fonts');
  assert(t.includes('cdnjs.cloudflare.com'), s + ' allows Font Awesome');
  assert(t.includes('www.youtube.com'), s + ' allows YouTube embeds');
  assert(t.includes('player.vimeo.com'), s + ' allows Vimeo embeds');
  assert(t.includes("script-src 'self' 'unsafe-inline'"), s + ' permits the dashboard inline handlers');
  assert(!/'unsafe-eval'/.test(t), s + ' does NOT allow unsafe-eval');
  assert(t.includes('images.unoptimized') || t.includes('unoptimized: true'), s + ' keeps the images config');
  assert(t.includes('optimizeFonts: false'), s + ' keeps optimizeFonts');
}
assert(fs.existsSync(tpl), 'template next.config.js ships to future builds');

console.log('\n' + (ok ? 'FIX 4 APPLIED — security headers in place' : 'PROBLEM(S)'));
process.exit(ok ? 0 : 1);
