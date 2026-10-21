/**
 * Seed Blob Storage Script
 * 
 * Run this ONCE after deploying a new website to Vercel
 * It uploads initial config files to Blob storage
 * 
 * Usage:
 *   node scripts/seed-blob.js
 * 
 * Prerequisites:
 *   1. Deploy site to Vercel
 *   2. Create Blob storage in Vercel dashboard
 *   3. Add BLOB_READ_WRITE_TOKEN to environment variables
 *   4. Set BLOB_READ_WRITE_TOKEN in your local .env.local for this script
 */

const { put } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!BLOB_TOKEN) {
  console.error('❌ ERROR: BLOB_READ_WRITE_TOKEN not found in environment variables!')
  console.error('   Add it to .env.local to run this script')
  console.error('   Get token from: Vercel Dashboard -> Storage -> Blob')
  process.exit(1)
}

async function seedBlob() {
  console.log('🌱 Starting Blob storage seeding...\n')

  const publicDir = path.join(process.cwd(), 'public')
  
  const filesToUpload = [
    'site-config.json',
    'image-map.json',
    'seo.json',
    'site-config-defaults.json',
  ]

  let successCount = 0
  let skipCount = 0

  for (const filename of filesToUpload) {
    const filePath = path.join(publicDir, filename)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filename} (file not found)`)
      skipCount++
      continue
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      
      const blob = await put(filename, content, {
        access: 'public',
        contentType: 'application/json',
        token: BLOB_TOKEN,
      })

      console.log(`✅ Uploaded: ${filename}`)
      console.log(`   URL: ${blob.url}\n`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to upload ${filename}:`, error.message, '\n')
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Successfully uploaded: ${successCount} files`)
  if (skipCount > 0) {
    console.log(`⚠️  Skipped: ${skipCount} files`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🎉 Blob seeding complete!')
  console.log('\nNext steps:')
  console.log('1. Deploy to Vercel (if not already deployed)')
  console.log('2. Website will now load config from Blob storage')
  console.log('3. Dashboard saves will update Blob (no rebuild needed!)')
}

// Run the seeding
seedBlob().catch(error => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
