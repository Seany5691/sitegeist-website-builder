/** @type {import('next').NextConfig} */
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
  //   - 'unsafe-eval' is REQUIRED by Next.js webpack runtime for dynamic
  //     imports. Without it the browser blocks chunk loading with
  //     "Evaluating a string as JavaScript violates CSP" and the page renders
  //     blank (only statically-imported components appear).
  //   - fonts.googleapis.com / fonts.gstatic.com / cdnjs.cloudflare.com are
  //     allowed for the dashboard's Google Fonts + Font Awesome.
  //   - youtube / vimeo / google maps are allowed for embedded media.
  //   - img-src is deliberately wide (any https image) because clients paste
  //     their own image links. Images are a far lower risk than scripts.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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
