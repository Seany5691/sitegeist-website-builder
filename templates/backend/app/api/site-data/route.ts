import { NextResponse } from 'next/server'
import { loadJSON, isBlobEnabled } from '@/lib/blob-storage'

// Must run at request time so dashboard saves are visible without a redeploy
export const dynamic = 'force-dynamic'

/**
 * Single source of truth for website + dashboard content.
 * Always uncached so dashboard saves appear immediately.
 */
export async function GET() {
  try {
    const [siteConfig, imageMap, seo] = await Promise.all([
      loadJSON('site-config.json'),
      loadJSON('image-map.json'),
      loadJSON('seo.json'),
    ])

    return NextResponse.json(
      {
        success: true,
        siteConfig: siteConfig || null,
        imageMap: imageMap || null,
        seo: seo || null,
        source: isBlobEnabled() ? 'blob' : 'filesystem',
        updatedAt: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('site-data error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load site data' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    )
  }
}
