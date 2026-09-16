#!/usr/bin/env node

/**
 * Build Website Script
 * Automatically launches MiMo Code CLI to build a website from the generated prompt
 * 
 * Usage: node scripts/build-website.js <business-folder-name>
 * Example: node scripts/build-website.js tammy_holliday_photography
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const WEBSITES_FOLDER = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites';

async function buildWebsite(businessFolder) {
  const clientPath = path.join(WEBSITES_FOLDER, businessFolder);
  
  // Verify the folder exists
  if (!fs.existsSync(clientPath)) {
    console.error(`[ERROR] Business folder not found: ${clientPath}`);
    process.exit(1);
  }

  // Verify required files exist
  const requiredFiles = ['prompt.md', 'site-config.json', 'seo.json']
  for (const file of requiredFiles) {
    const filePath = path.join(clientPath, file)
    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Required file not found: ${file}`)
      process.exit(1)
    }
  }

  console.log(`[Builder] Starting website build for: ${businessFolder}`)
  console.log(`[Builder] Working directory: ${clientPath}`)
  console.log(`[Builder] Launching MiMo Code CLI...`)

  // Change to the business directory
  process.chdir(clientPath)

  // Build the prompt for MiMo
  const prompt = `You are building a complete Next.js 14 website. Read the following files in order:

1. Read prompt.md - This contains ALL the design specifications, content, and instructions
2. Read site-config.json - This contains the business data, services, testimonials, etc.
3. Read seo.json - This contains SEO metadata

IMPORTANT INSTRUCTIONS:
- Follow the prompt.md EXACTLY as written
- Use ALL the data from site-config.json (services, testimonials, gallery, etc.)
- Create a COMPLETE, working Next.js 14 application
- Use Tailwind CSS for styling
- Use Framer Motion for animations
- Use Lucide React for icons
- Use next/font for fonts
- Create ALL components listed in the prompt
- Use the ACTUAL images from the gallery (remote URLs in trial mode)
- Make it responsive (mobile-first)
- Make it beautiful and professional

START BUILDING NOW. Create every file needed for a complete, working website.`

  // Launch MiMo Code CLI
  try {
    console.log(`\n[Builder] Prompt sent to MiMo Code CLI`)
    console.log(`[Builder] MiMo will now build the website...`)
    console.log(`[Builder] This may take several minutes.\n`)
    
    // Use spawn to keep the process running and show output
    const mimo = spawn('mimo', [], {
      cwd: clientPath,
      stdio: 'inherit',
      shell: true
    })

    // Send the prompt via stdin
    mimo.stdin.write(prompt + '\n')
    mimo.stdin.end()

    mimo.on('close', (code) => {
      if (code === 0) {
        console.log(`\n[Builder] Website build complete!`)
        console.log(`[Builder] Output directory: ${clientPath}`)
      } else {
        console.error(`\n[Builder] MiMo exited with code: ${code}`)
      }
    })

    mimo.on('error', (err) => {
      console.error(`[Builder] Error launching MiMo: ${err.message}`)
      console.log(`[Builder] Try running manually: cd "${clientPath}" && mimo`)
    })
    
  } catch (error) {
    console.error(`[Builder] Error: ${error.message}`)
    console.log(`[Builder] Manual command: cd "${clientPath}" && mimo`)
  }
}

// Get business folder from command line args
const businessFolder = process.argv[2]

if (!businessFolder) {
  console.error('Usage: node scripts/build-website.js <business-folder-name>')
  console.error('Example: node scripts/build-website.js tammy_holliday_photography')
  process.exit(1)
}

buildWebsite(businessFolder)
