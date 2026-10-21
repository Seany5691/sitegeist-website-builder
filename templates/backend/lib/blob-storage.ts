import { put, list, del } from '@vercel/blob'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'

/**
 * Blob Storage Helper
 * Handles storage operations with automatic fallback:
 * - Production (Vercel with BLOB_READ_WRITE_TOKEN): Uses Vercel Blob
 * - Local development: Uses filesystem
 */

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

// Check if Blob is available
export const isBlobEnabled = () => !!BLOB_TOKEN

/**
 * Save JSON data to storage
 */
export async function saveJSON(filename: string, data: any): Promise<string> {
  const jsonString = JSON.stringify(data, null, 2)

  if (isBlobEnabled()) {
    // Production: Save to Blob
    // cacheControlMaxAge must be short so dashboard saves show up on the site quickly.
    // Vercel Blob defaults to ONE MONTH of cache, which made updates invisible.
    const blob = await put(filename, jsonString, {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    })
    console.log(`✅ Saved to Blob: ${filename}`)
    return blob.url
  } else {
    // Local: Save to filesystem
    const publicDir = join(process.cwd(), 'public')
    const filePath = join(publicDir, filename)
    await writeFile(filePath, jsonString, 'utf-8')
    console.log(`✅ Saved to filesystem: ${filename}`)
    return `/${filename}`
  }
}

/**
 * Load JSON data from storage
 */
export async function loadJSON(filename: string): Promise<any> {
  if (isBlobEnabled()) {
    // Production: Load from Blob
    try {
      // Get the public URL for this file
      const url = await getPublicUrl(filename)
      if (!url) {
        console.warn(`⚠️ File not found in Blob: ${filename}`)
      } else {
        // no-store: never serve stale config after a dashboard save
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) {
          console.warn(`⚠️ Failed to load from Blob: ${filename}`)
        } else {
          return response.json()
        }
      }
    } catch (error) {
      // Blob store suspended / unreachable — fall through to the bundled file
      console.warn(`⚠️ Blob load failed for ${filename}, using bundled copy:`, error)
    }
  }

  // Local: Load from filesystem (also the fallback when Blob is unavailable)
  try {
    const publicDir = join(process.cwd(), 'public')
    const filePath = join(publicDir, filename)
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.warn(`⚠️ File not found locally: ${filename}`)
    return null
  }
}

/**
 * Upload image file to storage
 */
export async function uploadImage(file: File | Buffer, filename: string): Promise<string> {
  if (isBlobEnabled()) {
    // Production: Upload to Blob
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    })
    console.log(`✅ Uploaded image to Blob: ${filename}`)
    return blob.url
  } else {
    // Local: Save to filesystem
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    
    const filePath = join(uploadsDir, filename)
    let buffer: Buffer
    
    if (Buffer.isBuffer(file)) {
      buffer = file
    } else {
      // It's a File object
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    }
    
    await writeFile(filePath, buffer)
    console.log(`✅ Uploaded image to filesystem: ${filename}`)
    return `/uploads/${filename}`
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(url: string): Promise<boolean> {
  if (isBlobEnabled()) {
    // Production: Delete from Blob
    try {
      await del(url, { token: BLOB_TOKEN })
      console.log(`✅ Deleted from Blob: ${url}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to delete from Blob: ${url}`, error)
      return false
    }
  } else {
    // Local: Delete from filesystem
    // Note: We don't implement local delete to prevent accidental data loss during development
    console.log(`⚠️ Delete not implemented for local development: ${url}`)
    return false
  }
}

/**
 * Get public URL for a file
 */
export async function getPublicUrl(filename: string): Promise<string | null> {
  if (isBlobEnabled()) {
    // Production: Get Blob URL
    try {
      const { blobs } = await list({
        prefix: filename,
        limit: 1,
        token: BLOB_TOKEN,
      })
      
      if (blobs.length > 0) {
        return blobs[0].url
      }
      
      // If exact match not found, try without prefix
      const allBlobs = await list({ token: BLOB_TOKEN })
      const match = allBlobs.blobs.find(b => b.pathname === filename)
      return match?.url || null
    } catch (error) {
      console.error(`❌ Failed to get Blob URL for: ${filename}`, error)
      return null
    }
  } else {
    // Local: Return filesystem path
    return `/${filename}`
  }
}

/**
 * List all files with a prefix
 */
export async function listFiles(prefix: string = ''): Promise<string[]> {
  if (isBlobEnabled()) {
    // Production: List Blob files
    const { blobs } = await list({
      prefix,
      token: BLOB_TOKEN,
    })
    return blobs.map(b => b.url)
  } else {
    // Local: Not implemented (not needed for dashboard)
    return []
  }
}

/**
 * Get Blob URLs for frontend to fetch config files
 */
export async function getConfigUrls() {
  if (isBlobEnabled()) {
    const [siteConfigUrl, imageMapUrl, seoUrl] = await Promise.all([
      getPublicUrl('site-config.json'),
      getPublicUrl('image-map.json'),
      getPublicUrl('seo.json'),
    ])
    
    return {
      siteConfig: siteConfigUrl || '/site-config.json',
      imageMap: imageMapUrl || '/image-map.json',
      seo: seoUrl || '/seo.json',
    }
  } else {
    // Local: Use filesystem paths
    return {
      siteConfig: '/site-config.json',
      imageMap: '/image-map.json',
      seo: '/seo.json',
    }
  }
}
