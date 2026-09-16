import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { generateBuildInstructions } from '@/lib/prompt-builder'

const WEBSITES_FOLDER = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

export async function POST(req: NextRequest) {
  try {
    const { siteConfig, buildMode, websitesFolder } = await req.json()

    if (!siteConfig) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: siteConfig' },
        { status: 400 }
      )
    }

    const instructions = generateBuildInstructions({
      buildMode: buildMode || 'TRIAL',
      siteConfig,
      websitesFolder: websitesFolder || WEBSITES_FOLDER,
    })

    // Save files to client folder
    const clientFolder = siteConfig.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const clientPath = path.join(WEBSITES_FOLDER, clientFolder)
    await fs.mkdir(clientPath, { recursive: true })

    // Write file-based build instructions
    const instructionsDir = path.join(clientPath, '.build-instructions')
    await fs.mkdir(instructionsDir, { recursive: true })
    await fs.writeFile(path.join(instructionsDir, 'technical-rules.md'), instructions.technicalRules, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'design-system.md'), instructions.designSystem, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'content-guide.md'), instructions.contentGuide, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'data-schemas.md'), instructions.dataSchemas, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'visual-standards.md'), instructions.visualStandards, 'utf-8')

    // Write short prompt
    const promptPath = path.join(clientPath, 'prompt.md')
    await fs.writeFile(promptPath, instructions.shortPrompt, 'utf-8')

    return NextResponse.json({
      prompt: instructions.shortPrompt,
      promptPath,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    )
  }
}
