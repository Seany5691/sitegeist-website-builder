import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const isAuthenticated = request.cookies.get('admin-authenticated')?.value === 'true'
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const config = await request.json()

    // Validate config structure
    if (!config.businessName || !config.city) {
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 400 }
      )
    }

    // Save to public/site-config.json
    const configPath = path.join(process.cwd(), 'public', 'site-config.json')
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save config error:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
