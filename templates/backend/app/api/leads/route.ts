import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { getSupabase, getAdminClient, getTenantId } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET  /api/leads — list leads for this site's tenant (dashboard lead manager)
 * PATCH /api/leads — mark a lead read/unread
 */
export async function GET(request: NextRequest) {
  const guard = await protectRoute(request)
  if (guard instanceof NextResponse) return guard

  try {
    const tenantId = getTenantId()
    const supabase = getAdminClient()

    const { searchParams } = new URL(request.url)
    // Cap 5000 so a full-history CSV export can pull everything in one go.
    const limit = Math.min(Number(searchParams.get('limit') || 50), 5000)
    const offset = Math.max(Number(searchParams.get('offset') || 0), 0)
    const status = searchParams.get('status')
    // Optional inclusive date window on created_at (YYYY-MM-DD, UTC).
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let data: any[] | null = null
    let error: { message?: string } | null = null
    let count: number | null = null

    // Progressive select: drop only the column groups that are actually missing.
    // Never drop open-tracking just because marketing_consent is absent.
    const BASE_COLS =
      'id, name, email, phone, message, subject, business_name, page_url, status, resend_message_id, resend_error, is_read, read_at, redelivered_count, last_redelivered_at, is_test, created_at, updated_at'
    const OPEN_COLS = ', email_opened_at, email_opened_count, email_clicked_at, last_event_type, last_event_at'
    const CONSENT_COLS = ', marketing_consent, marketing_consent_at, marketing_consent_text'

    const columnAttempts = [
      BASE_COLS + OPEN_COLS + CONSENT_COLS,
      BASE_COLS + OPEN_COLS,
      BASE_COLS,
    ]

    for (const cols of columnAttempts) {
      const q = supabase
        .from('form_submissions')
        .select(cols)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      let filtered = status ? q.eq('status', status) : q
      if (from) filtered = filtered.gte('created_at', from.length === 10 ? from + 'T00:00:00.000Z' : from)
      if (to) filtered = filtered.lte('created_at', to.length === 10 ? to + 'T23:59:59.999Z' : to)
      const res: any = await filtered
      data = res.data
      error = res.error
      count = res.count

      if (!error) break
      // Only retry when the failure is a missing-column error
      if (!/column|schema/i.test(error.message || '')) break
      console.warn('[Leads API] select failed, trying narrower columns:', error.message)
    }

    if (error) {
      console.error('[Leads API] list failed:', error)
      return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Unread count for the nav badge
    const { count: unreadCount } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_read', false)

    // Delivered but never opened — the "missed lead" signal
    let unopenedCount = 0
    const { count: uc, error: ucErr } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['sent', 'delivered'])
      .is('email_opened_at', null)
    if (!ucErr) unopenedCount = uc || 0

    return NextResponse.json({
      success: true,
      leads: data || [],
      unreadCount: unreadCount || 0,
      unopenedCount,
      total: count ?? null,
    })
  } catch (err) {
    console.error('[Leads API] error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to load leads' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await protectRoute(request)
  if (guard instanceof NextResponse) return guard

  try {
    const body = await request.json()
    const id = String(body.id || '')
    const isRead = body.is_read === true

    if (!id) {
      return NextResponse.json({ success: false, message: 'Lead id is required.' }, { status: 400 })
    }

    const tenantId = getTenantId()
    const supabase = getAdminClient()

    const update: Record<string, unknown> = { is_read: isRead }
    if (isRead) update.read_at = new Date().toISOString()

    const { error } = await supabase
      .from('form_submissions')
      .update(update)
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) {
      return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Leads API] patch error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update lead' }, { status: 500 })
  }
}
