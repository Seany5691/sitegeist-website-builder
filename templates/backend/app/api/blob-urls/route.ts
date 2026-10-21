import { NextResponse } from 'next/server'
import { getConfigUrls } from '@/lib/blob-storage'

// Must run at request time so Blob URL lookups reflect current storage
export const dynamic = 'force-dynamic'

/**
 * API route to get Blob URLs for config files
 * Frontend uses this to know where to fetch data from
 */
export async function GET() {
  try {
    const urls = await getConfigUrls()
    
    return NextResponse.json({
      success: true,
      urls,
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Failed to get Blob URLs:', error)
    
    // Fallback to filesystem paths
    return NextResponse.json({
      success: true,
      urls: {
        siteConfig: '/site-config.json',
        imageMap: '/image-map.json',
        seo: '/seo.json',
      }
    })
  }
}
