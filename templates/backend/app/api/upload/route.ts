import { NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@/lib/dashboard-middleware'
import { uploadRateLimiter, clientIpFrom } from '@/lib/rate-limiter'
import { uploadImage } from '@/lib/blob-storage'

export async function POST(request: NextRequest) {
  // Verify authentication and origin
  const sessionOrError = await protectRoute(request)
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError // Return error response
  }

  // Belt and braces: the route is already auth-guarded, but this stops a
  // single compromised session from flooding Blob storage.
  const ip = clientIpFrom(request.headers)
  if (uploadRateLimiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many uploads in a short time. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // ── Size cap ────────────────────────────────────────────────────────
    // No limit means anyone with a login can fill Blob storage / run up cost.
    const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB
    if (typeof file.size === 'number' && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, message: 'That file is too large. The maximum is 8 MB.' },
        { status: 413 }
      )
    }

    // ── Type allowlist + magic-byte sniff ───────────────────────────────
    // The declared MIME type and the file extension are both attacker-controlled,
    // so we sniff the actual bytes. SVG/HTML are deliberately NOT allowed: they
    // execute script when opened and are a stored-XSS / phishing vector on a
    // trusted origin.
    const buf = Buffer.from(await file.arrayBuffer())
    const sniffed = sniffImageType(buf)
    if (!sniffed) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, WebP and GIF images are allowed.' },
        { status: 415 }
      )
    }

    // Generate safe filename — forced to the sniffed extension so a .svg renamed
    // to .png cannot smuggle itself through.
    const timestamp = Date.now()
    const baseName = (file.name || 'upload').replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'upload'
    const filename = `${timestamp}-${baseName}.${sniffed.ext}`

    // Upload to Blob (production) or filesystem (local)
    // pass the sniffed bytes (Buffer is accepted; the stored extension is
    // already forced to the sniffed type, so no payload can smuggle through)
    const url = await uploadImage(buf, filename)

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename,
      message: 'File uploaded successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
}


/**
 * Identify an image by its leading bytes. The extension and the declared
 * Content-Type are both attacker-controlled and prove nothing; the first few
 * bytes do.
 *
 * Returns null for anything we do not want stored — notably SVG and HTML,
 * both of which can carry script.
 */
function sniffImageType(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { mime: 'image/png', ext: 'png' }
  // GIF87a / GIF89a
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return { mime: 'image/gif', ext: 'gif' }
  // WebP: 'RIFF' .... 'WEBP'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  // AVIF: '....ftypavif'
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.slice(8, 12).toString('latin1')
    if (brand.startsWith('avif') || brand.startsWith('avis')) return { mime: 'image/avif', ext: 'avif' }
  }
  return null
}
