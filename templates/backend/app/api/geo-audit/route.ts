import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { geoAudit } from '@/lib/geo-audit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/geo-audit — pre-launch GEO checklist for the client dashboard.
 */
export async function GET(request: NextRequest) {
  const guard = await protectRoute(request)
  if (guard instanceof NextResponse) return guard

  try {
    const items = await geoAudit()
    const passed = items.filter((i) => i.pass).length
    return NextResponse.json({
      success: true,
      items,
      score: `${passed}/${items.length}`,
      ready: items.every((i) => i.pass),
    })
  } catch (err) {
    console.error('[GeoAudit] error:', err)
    return NextResponse.json({ success: false, message: 'Failed to run audit' }, { status: 500 })
  }
}
