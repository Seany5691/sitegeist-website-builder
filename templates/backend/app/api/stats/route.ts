import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { getSupabase, getAdminClient, getTenantId } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/** AI crawler names — matched case-insensitively against stored user agents. */
const AI_ENGINE_NAMES = [
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
]

type SeriesPoint = { date: string; visits: number; unique: number }
type LeadPoint = { date: string; count: number }

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function bucketSeries30(): Map<string, { visits: number; visitors: Set<string> }> {
  const map = new Map<string, { visits: number; visitors: Set<string> }>()
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    map.set(dayKey(d), { visits: 0, visitors: new Set() })
  }
  return map
}

function bucketLead30(): Map<string, number> {
  const map = new Map<string, number>()
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    map.set(dayKey(d), 0)
  }
  return map
}

/** Group a referrer into a traffic source label. */
function groupSource(referrer: string | null | undefined, siteHost: string): string {
  if (!referrer || !referrer.trim()) return 'Direct'
  const r = referrer.toLowerCase()
  let refHost = ''
  try {
    refHost = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    /* unparseable — fall through to substring rules */
  }
  const host = siteHost.toLowerCase().split(':')[0].replace(/^www\./, '')
  if (refHost && host && refHost === host) return 'Direct'
  if (r.includes('google.')) return 'Google'
  if (r.includes('facebook.')) return 'Facebook'
  if (r.includes('whatsapp')) return 'WhatsApp'
  if (r.includes('instagram')) return 'Instagram'
  if (r.includes('twitter.') || r.includes('t.co') || refHost === 'x.com' || refHost.endsWith('.x.com')) {
    return 'Twitter/X'
  }
  return 'Other'
}

function aiEnginesFromUa(ua: string | null | undefined): string[] {
  if (!ua) return []
  const lower = ua.toLowerCase()
  return AI_ENGINE_NAMES.filter((name) => lower.includes(name.toLowerCase()))
}

function zeroedStats() {
  return {
    success: true,
    totalVisits: 0,
    uniqueVisitors: 0,
    range7: { visits: 0, unique: 0 },
    range30: { visits: 0, unique: 0 },
    visitsSeries: Array.from(bucketSeries30().keys()).map((date) => ({
      date,
      visits: 0,
      unique: 0,
    })),
    topPages: [] as { path: string; visits: number }[],
    sources: [] as { source: string; visits: number }[],
    aiHits: 0,
    aiEngines: [] as string[],
    lastCrawledAt: null as string | null,
    leadsTotal: 0,
    leadsUnread: 0,
    leadsUnopened: 0,
    leadsOpened: 0,
    leadsSeries: Array.from(bucketLead30().keys()).map((date) => ({ date, count: 0 })),
  }
}

/**
 * GET /api/stats — site analytics for the client dashboard.
 * Visits/unique/sources/topPages exclude bots; aiHits counts AI crawlers.
 * Leads come from form_submissions for the same tenant.
 */
export async function GET(request: NextRequest) {
  const guard = await protectRoute(request)
  if (guard instanceof NextResponse) return guard

  try {
    const supabase = getAdminClient()
    const tenantId = getTenantId()
    const siteHost = request.headers.get('host') || request.nextUrl.hostname

    const now = new Date()
    const since7 = new Date(now)
    since7.setUTCDate(since7.getUTCDate() - 6)
    since7.setUTCHours(0, 0, 0, 0)
    const since30 = new Date(now)
    since30.setUTCDate(since30.getUTCDate() - 29)
    since30.setUTCHours(0, 0, 0, 0)

    // Query 1 — page_views rows for the last 30 days (needed columns only)
    const { data: viewRows, error: viewErr } = await supabase
      .from('page_views')
      .select('path, visitor_hash, is_bot, is_ai, referrer, user_agent, created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', since30.toISOString())
      .order('created_at', { ascending: true })

    if (viewErr) {
      console.error('[Stats API] page_views failed:', viewErr)
      return NextResponse.json(zeroedStats())
    }

    // Query 2 — all-time totals (count + visitor hashes for unique)
    const { data: allHumans, count: allHumanCount, error: allErr } = await supabase
      .from('page_views')
      .select('visitor_hash', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('is_bot', false)
      .limit(10000)

    // Query 3 — form_submissions for lead stats + series
    const { data: leadRows, error: leadErr } = await supabase
      .from('form_submissions')
      .select('created_at, is_read, status, email_opened_at')
      .eq('tenant_id', tenantId)

    if (leadErr) {
      console.error('[Stats API] form_submissions failed:', leadErr)
    }

    const rows = viewRows || []
    const human = rows.filter((r) => r.is_bot === false)
    const aiRows = rows.filter((r) => r.is_ai === true)

    // Visits series — last 30 days, all buckets present
    const series = bucketSeries30()
    for (const r of human) {
      const key = String(r.created_at || '').slice(0, 10)
      const bucket = series.get(key)
      if (bucket) {
        bucket.visits += 1
        if (r.visitor_hash) bucket.visitors.add(r.visitor_hash)
      }
    }

    // range7 / range30
    let range7Visits = 0
    const range7Unique = new Set<string>()
    let range30Visits = 0
    const range30Unique = new Set<string>()
    for (const r of human) {
      const ts = new Date(r.created_at || 0).getTime()
      if (r.visitor_hash) range30Unique.add(r.visitor_hash)
      range30Visits += 1
      if (ts >= since7.getTime()) {
        range7Visits += 1
        if (r.visitor_hash) range7Unique.add(r.visitor_hash)
      }
    }

    // Top pages (non-bot)
    const pageMap = new Map<string, number>()
    for (const r of human) {
      const path = r.path || '/'
      pageMap.set(path, (pageMap.get(path) || 0) + 1)
    }
    const topPages = Array.from(pageMap.entries())
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8)

    // Traffic sources (non-bot)
    const sourceMap = new Map<string, number>()
    for (const r of human) {
      const source = groupSource(r.referrer, siteHost)
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
    }
    const sources = Array.from(sourceMap.entries())
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)

    // AI crawler hits
    const engines = new Set<string>()
    let lastCrawledAt: string | null = null
    for (const r of aiRows) {
      for (const name of aiEnginesFromUa(r.user_agent)) engines.add(name)
      if (r.created_at && (!lastCrawledAt || r.created_at > lastCrawledAt)) {
        lastCrawledAt = r.created_at
      }
    }

    // Leads
    const leads = leadRows || []
    let leadsUnread = 0
    let leadsUnopened = 0
    let leadsOpened = 0
    const leadBuckets = bucketLead30()
    for (const l of leads) {
      if (l.is_read === false) leadsUnread += 1
      if (l.email_opened_at) leadsOpened += 1
      if ((l.status === 'sent' || l.status === 'delivered') && !l.email_opened_at) {
        leadsUnopened += 1
      }
      const key = String(l.created_at || '').slice(0, 10)
      if (leadBuckets.has(key)) leadBuckets.set(key, (leadBuckets.get(key) || 0) + 1)
    }

    const visitsSeries: SeriesPoint[] = Array.from(series.entries()).map(([date, b]) => ({
      date,
      visits: b.visits,
      unique: b.visitors.size,
    }))
    const leadsSeries: LeadPoint[] = Array.from(leadBuckets.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    const totalVisits = allErr ? human.length : allHumanCount || 0
    const uniqueVisitors = allErr
      ? new Set(human.map((r) => r.visitor_hash).filter(Boolean)).size
      : new Set((allHumans || []).map((r) => r.visitor_hash).filter(Boolean)).size

    return NextResponse.json({
      success: true,
      totalVisits,
      uniqueVisitors,
      range7: { visits: range7Visits, unique: range7Unique.size },
      range30: { visits: range30Visits, unique: range30Unique.size },
      visitsSeries,
      topPages,
      sources,
      aiHits: aiRows.length,
      aiEngines: Array.from(engines).sort(),
      lastCrawledAt,
      leadsTotal: leads.length,
      leadsUnread,
      leadsUnopened,
      leadsOpened,
      leadsSeries,
    })
  } catch (err) {
    console.error('[Stats API] error:', err)
    return NextResponse.json(zeroedStats())
  }
}
