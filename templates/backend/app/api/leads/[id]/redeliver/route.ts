import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { redeliverLead } from '@/lib/leads'

export const dynamic = 'force-dynamic'

/**
 * POST /api/leads/[id]/redeliver
 * One-click self-service recovery: re-send a stored lead to the client's inbox.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await protectRoute(request)
  if (guard instanceof NextResponse) return guard

  try {
    const result = await redeliverLead(params.id)

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (err) {
    console.error('[Redeliver] error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to redeliver lead.' },
      { status: 500 }
    )
  }
}
