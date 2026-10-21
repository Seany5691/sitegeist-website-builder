import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const WEBSITES_FOLDER = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

/**
 * Save Custom Dashboard Configuration
 * 
 * This endpoint allows users to update their website configuration through
 * the dashboard interface. It updates the site-config.json file which can
 * trigger a website rebuild if needed.
 * 
 * @param request - Contains businessFolder and updated config data
 * @returns JSON response with success status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessFolder, siteConfig, imageMap } = body

    if (!businessFolder) {
      return NextResponse.json(
        { success: false, error: 'Missing businessFolder parameter' },
        { status: 400 }
      )
    }

    const clientPath = path.join(WEBSITES_FOLDER, businessFolder)
    const publicPath = path.join(clientPath, 'public')

    // Update site-config.json
    if (siteConfig) {
      const siteConfigPath = path.join(publicPath, 'site-config.json')
      await fs.writeFile(siteConfigPath, JSON.stringify(siteConfig, null, 2), 'utf-8')
      console.log(`[Dashboard] Updated site-config.json for ${businessFolder}`)
    }

    // Update image-map.json
    if (imageMap) {
      const imageMapPath = path.join(publicPath, 'image-map.json')
      await fs.writeFile(imageMapPath, JSON.stringify(imageMap, null, 2), 'utf-8')
      console.log(`[Dashboard] Updated image-map.json for ${businessFolder}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Config files updated successfully',
    })

  } catch (error) {
    console.error('[Dashboard] Error updating config:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
