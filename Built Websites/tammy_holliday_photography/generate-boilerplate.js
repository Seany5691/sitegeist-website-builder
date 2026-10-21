// Temporary script to generate Next.js boilerplate
const fs = require('fs');
const path = require('path');

// Import the generator (will need to transpile TypeScript)
async function generateBoilerplateFiles() {
  try {
    // Read site-config.json
    const siteConfigPath = path.join(__dirname, 'site-config.json');
    const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
    
    // Import the TypeScript modules via ts-node or similar
    const { generateBoilerplate } = require('../../lib/boilerplate-generator.ts');
    const { generateDesignSeed, getArchetypeConstraintKey } = require('../../lib/design-seed.ts');
    const { detectIndustry } = require('../../lib/prompt-builder.ts');
    
    // Detect archetype
    const archetype = detectIndustry(
      siteConfig.businessName,
      siteConfig.seo?.title,
      siteConfig.seo?.description,
      siteConfig.services
    );
    
    // Generate design seed
    const constraintKey = getArchetypeConstraintKey(archetype.id);
    const designSeed = generateDesignSeed(siteConfig.businessName || 'default', constraintKey);
    
    // Generate boilerplate
    console.log('[Boilerplate] Generating files...');
    console.log(`[Boilerplate] Archetype: ${archetype.id} (${archetype.name})`);
    console.log(`[Boilerplate] Design seed: ${designSeed.id}`);
    
    const boilerplate = generateBoilerplate(siteConfig, archetype, {
      densityProfile: designSeed.densityProfile,
      decorativeIntensity: designSeed.decorativeIntensity,
      motionIntensity: designSeed.motionIntensity,
      staggerStrength: designSeed.staggerStrength,
      artDirection: designSeed.artDirection,
      sectionOrder: designSeed.sectionOrder,
    });
    
    // Write files
    for (const [filename, content] of Object.entries(boilerplate)) {
      const filePath = path.join(__dirname, filename);
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`[Boilerplate] Created: ${filename}`);
    }
    
    console.log('[Boilerplate] Complete!');
    
  } catch (error) {
    console.error('[Boilerplate] Error:', error);
    process.exit(1);
  }
}

generateBoilerplateFiles();
