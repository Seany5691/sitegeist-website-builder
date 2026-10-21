import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { saveJSON, isBlobEnabled } from '@/lib/blob-storage'

export async function POST(request: NextRequest) {
  // Verify authentication and origin
  const sessionOrError = await protectRoute(request)
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError // Return error response
  }

  try {
    const data = await request.json()
    
    // Save to Blob (production) or filesystem (local)
    const savedUrls: string[] = []

    if (data.siteConfig) {
      const url = await saveJSON('site-config.json', data.siteConfig)
      savedUrls.push(url)
    }
    
    if (data.imageMap) {
      const url = await saveJSON('image-map.json', data.imageMap)
      savedUrls.push(url)
    }

    const usingBlob = isBlobEnabled()
    
    return NextResponse.json({ 
      success: true, 
      message: usingBlob 
        ? 'Configuration saved to Blob storage!' 
        : 'Configuration saved locally!',
      isProduction: usingBlob,
      requiresRebuild: false, // No rebuild needed with Blob!
      savedUrls,
    })
  } catch (error) {
    console.error('Save config error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}
