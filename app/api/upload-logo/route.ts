import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Logo upload for the Website Builder form.
 *
 * Stores the file in a staging folder so the form can preview it and the
 * build pipeline can copy it into the generated site. A client-uploaded logo
 * always outranks scraped/generated logos (see brandAssets.logoSource).
 */

const STAGING_DIR = path.join(process.cwd(), 'temp', 'uploaded-logos')
const MAX_BYTES = 4 * 1024 * 1024 // 4 MB
const ALLOWED_EXT = new Set(['.svg', '.png', '.webp', '.jpg', '.jpeg'])
const ALLOWED_MIME = new Set([
  'image/svg+xml',
  'image/png',
  'image/webp',
  'image/jpeg',
  'image/jpg',
])

function safeName(original: string): string {
  const ext = path.extname(original || '').toLowerCase()
  const base = path
    .basename(original || 'logo', ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'logo'
  const stamp = Date.now().toString(36)
  const rand = crypto.randomBytes(3).toString('hex')
  return `${base}-${stamp}${rand}${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'No file uploaded.' },
        { status: 400 }
      )
    }

    const f = file as File
    if (f.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Logo must be under 4 MB.' },
        { status: 413 }
      )
    }

    const ext = path.extname(f.name || '').toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { success: false, message: 'Use an SVG, PNG, WebP or JPG file.' },
        { status: 415 }
      )
    }
    if (f.type && !ALLOWED_MIME.has(f.type)) {
      return NextResponse.json(
        { success: false, message: `Unsupported file type: ${f.type}` },
        { status: 415 }
      )
    }

    await fs.mkdir(STAGING_DIR, { recursive: true })
    const name = safeName(f.name)
    const dest = path.join(STAGING_DIR, name)
    const bytes = Buffer.from(await f.arrayBuffer())
    await fs.writeFile(dest, bytes)

    // Read intrinsic dimensions for the preview UI (SVG has no fixed size)
    let width: number | null = null
    let height: number | null = null
    if (ext !== '.svg') {
      try {
        const sharp = (await import('sharp')).default
        const meta = await sharp(dest).metadata()
        width = meta.width ?? null
        height = meta.height ?? null
      } catch {
        // dimensions are optional
      }
    }

    return NextResponse.json({
      success: true,
      name: f.name,
      storedName: name,
      url: `/api/upload-logo/${encodeURIComponent(name)}`,
      path: dest,
      size: f.size,
      width,
      height,
      isSvg: ext === '.svg',
      transparent: ext !== '.jpg' && ext !== '.jpeg',
    })
  } catch (err) {
    console.error('[UploadLogo] error:', err)
    return NextResponse.json(
      { success: false, message: 'Upload failed.' },
      { status: 500 }
    )
  }
}

/** Serve a staged logo so the form can preview it. */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const raw = decodeURIComponent(url.pathname.split('/').pop() || '')
    const name = path.basename(raw)
    if (!name || !ALLOWED_EXT.has(path.extname(name).toLowerCase())) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 })
    }
    const filePath = path.join(STAGING_DIR, name)
    const bytes = await fs.readFile(filePath)
    const ext = path.extname(name).toLowerCase()
    const type =
      ext === '.svg'
        ? 'image/svg+xml'
        : ext === '.png'
        ? 'image/png'
        : ext === '.webp'
        ? 'image/webp'
        : 'image/jpeg'
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 })
  }
}
