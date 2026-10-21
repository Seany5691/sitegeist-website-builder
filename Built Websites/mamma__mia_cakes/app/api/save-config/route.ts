import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { protectRoute } from '@/lib/dashboard-middleware'

export async function POST(request: NextRequest) {
  // Verify authentication and origin
  const sessionOrError = await protectRoute(request)
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError // Return error response
  }

  try {
    const data = await request.json()
    const publicDir = join(process.cwd(), 'public')

    if (data.siteConfig) {
      await writeFile(join(publicDir, 'site-config.json'), JSON.stringify(data.siteConfig, null, 2), 'utf-8')
    }
    if (data.imageMap) {
      await writeFile(join(publicDir, 'image-map.json'), JSON.stringify(data.imageMap, null, 2), 'utf-8')
    }

    return NextResponse.json({ success: true, message: 'Configuration updated successfully' })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}
