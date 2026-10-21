/**
 * Canonical allowlist of search + AI crawler user agents.
 * Every generated site's app/robots.ts authorizes these explicitly
 * so AI models (ChatGPT, Perplexity, Claude, Google AI, Apple AI) can
 * ingest the site alongside traditional search bots.
 */
export const ALLOWED_USER_AGENTS = [
  // Traditional search
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'Yandex',
  // OpenAI / ChatGPT
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Anthropic / Claude
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  // Apple
  'Applebot',
  'Applebot-Extended',
  // Google AI
  'Google-Extended',
  // Other AI / data crawlers
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'CCBot',
  'YouBot',
  'AI2Bot',
] as const

export type AllowedUserAgent = (typeof ALLOWED_USER_AGENTS)[number]
