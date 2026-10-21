import { ALLOWED_USER_AGENTS } from './robots-ua-list'

/**
 * Page-view tracking helpers for generated sites.
 * Visitor identity is a daily-rotating sha256 of ip + user-agent + UTC date,
 * so no raw PII is persisted and hashes cannot be correlated across days.
 *
 * RUNTIME NOTE: this module is imported by Next.js Edge middleware, so it must
 * stay Edge-safe — no node:crypto and no @supabase/supabase-js. The insert uses
 * plain fetch() against the Supabase REST endpoint instead.
 */

/* ── Minimal pure-JS SHA-256 (Edge-safe) ───────────────────────────────── */
function sha256Hex(input: string): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]
  const bytes = new TextEncoder().encode(input)
  const bitLen = bytes.length * 8
  const withPad = new Uint8Array((((bytes.length + 9) >> 6) + 1) << 6)
  withPad.set(bytes)
  withPad[bytes.length] = 0x80
  const dv = new DataView(withPad.buffer)
  dv.setUint32(withPad.length - 8, Math.floor(bitLen / 0x100000000), false)
  dv.setUint32(withPad.length - 4, bitLen >>> 0, false)

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19
  const w = new Uint32Array(64)

  for (let off = 0; off < withPad.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false)
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) >>> 0
      h = g; g = f; f = e; e = (d + t1) >>> 0
      d = c; c = b; b = a; a = (t1 + t2) >>> 0
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((n) => n.toString(16).padStart(8, '0')).join('')
}

/** UTC calendar date (YYYY-MM-DD) — rotates the visitor hash once per day. */
function dailySalt(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Deterministic per-day visitor hash. No PII stored. */
export function hashVisitor(ip: string, userAgent: string): string {
  return sha256Hex(`${ip}|${userAgent}|${dailySalt()}`)
}

const BOT_PATTERN = /bot|crawl|spider|slurp|headless|preview|monitor|pingdom|lighthouse|pagespeed/i

/** User agents that indicate AI / LLM ingestion (subset of ALLOWED_USER_AGENTS). */
const AI_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Applebot-Extended',
  'Google-Extended',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'CCBot',
  'YouBot',
  'AI2Bot',
] as const

/**
 * Classify a user agent as bot and/or AI crawler.
 * Bots: generic crawler patterns plus anything on the robots allowlist.
 * AI: the AI-specific agents only (what we count as "AI hits").
 */
export function classifyUserAgent(ua: string): { isBot: boolean; isAi: boolean } {
  const lower = ua.toLowerCase()
  const isBot =
    BOT_PATTERN.test(ua) ||
    ALLOWED_USER_AGENTS.some((name) => lower.includes(name.toLowerCase()))
  const isAi = AI_USER_AGENTS.some((name) => lower.includes(name.toLowerCase()))
  return { isBot, isAi }
}

export interface RecordViewOptions {
  tenantId: string
  path: string
  userAgent: string
  ip: string
  referrer?: string
}

/**
 * Insert one page_views row. Fire-and-forget: never throws, so analytics
 * can never break the page response.
 */
export async function recordView(opts: RecordViewOptions): Promise<void> {
  try {
    const url =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ''
    const key =
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
    if (!url || !key) return

    const { isBot, isAi } = classifyUserAgent(opts.userAgent)

    // Plain fetch keeps this Edge-safe (no supabase-js in middleware).
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tenant_id: opts.tenantId,
        path: opts.path || '/',
        visitor_hash: hashVisitor(opts.ip, opts.userAgent),
        user_agent: opts.userAgent ? opts.userAgent.slice(0, 500) : null,
        is_bot: isBot,
        is_ai: isAi,
        referrer: opts.referrer ? opts.referrer.slice(0, 500) : null,
      }),
    })
    if (!res.ok) {
      console.warn(`[view-tracker] insert failed ${res.status}: ${(await res.text()).slice(0, 200)}`)
    }
  } catch (err) {
    // Analytics must never break the page — but keep the failure visible in logs.
    console.warn('[view-tracker] error:', err instanceof Error ? err.message : String(err))
  }
}
