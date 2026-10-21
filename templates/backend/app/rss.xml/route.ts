import { NextResponse } from 'next/server'
import { loadJSON } from '@/lib/blob-storage'
import { getSiteUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

/**
 * /rss.xml — only populated when the site has blog posts enabled.
 * Returns a valid empty feed otherwise so the route never 404s.
 */
export async function GET() {
  const baseUrl = getSiteUrl()

  let config: {
    businessName?: string
    blogPosts?: Array<{ title: string; excerpt?: string; date?: string; url?: string }>
  } = {}
  try {
    config = (await loadJSON('site-config.json')) || {}
  } catch {
    config = {}
  }

  const posts = config.blogPosts || []
  const items = posts
    .map((p) => {
      const link = p.url && p.url.startsWith('http') ? p.url : `${baseUrl}${p.url || '/blog'}`
      const pubDate = p.date ? new Date(p.date).toUTCString() : new Date().toUTCString()
      return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${config.businessName || 'Blog'}</title>
    <link>${baseUrl}</link>
    <description>Latest updates from ${config.businessName || 'our team'}</description>
    <language>en</language>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
