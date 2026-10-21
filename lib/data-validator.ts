// lib/data-validator.ts

export interface ValidationResult {
  isValid: boolean;
  completenessScore: number; // 0-100
  warnings: string[];
  errors: string[];
  missingCritical: string[];
  missingOptional: string[];
  recommendations: string[];
}

export interface ArchetypeRequirements {
  critical: string[]; // Must have these fields
  recommended: string[]; // Should have these fields
  optional: string[]; // Nice to have
}

/**
 * Define requirements for each business archetype
 */
const ARCHETYPE_REQUIREMENTS: Record<string, ArchetypeRequirements> = {
  'spa-wellness': {
    critical: ['businessName', 'contact.phone', 'services', 'heroImage'],
    recommended: ['about', 'openingHours', 'testimonials', 'galleryImages'],
    optional: ['videos', 'faqs', 'priceRange', 'beforeAfterGallery'],
  },
  'photography': {
    critical: ['businessName', 'contact.email', 'portfolioCategories', 'galleryImages'],
    recommended: ['about', 'services', 'testimonials', 'heroImage'],
    optional: ['videos', 'priceRange', 'openingHours'],
  },
  'construction': {
    critical: ['businessName', 'contact.phone', 'services', 'beforeAfterGallery'],
    recommended: ['about', 'galleryImages', 'testimonials', 'heroImage'],
    optional: ['videos', 'faqs', 'openingHours'],
  },
  'restaurant': {
    critical: ['businessName', 'contact.phone', 'openingHours', 'address'],
    recommended: ['menuItems', 'heroImage', 'galleryImages', 'about'],
    optional: ['testimonials', 'videos', 'priceRange'],
  },
  'professional-services': {
    critical: ['businessName', 'contact.email', 'services', 'about'],
    recommended: ['testimonials', 'faqs', 'heroImage', 'contact.phone'],
    optional: ['galleryImages', 'videos', 'openingHours'],
  },
};

/**
 * Get nested object value by path (e.g., "contact.phone")
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Check if field has meaningful value
 */
function hasValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Validate scraped data against archetype requirements
 */
export function validateScrapedData(
  data: any,
  archetype: string = 'professional-services'
): ValidationResult {
  const requirements = ARCHETYPE_REQUIREMENTS[archetype] || ARCHETYPE_REQUIREMENTS['professional-services'];
  
  const result: ValidationResult = {
    isValid: true,
    completenessScore: 0,
    warnings: [],
    errors: [],
    missingCritical: [],
    missingOptional: [],
    recommendations: [],
  };
  
  // Check critical fields
  let criticalCount = 0;
  requirements.critical.forEach(field => {
    const value = getNestedValue(data, field);
    if (hasValue(value)) {
      criticalCount++;
    } else {
      result.missingCritical.push(field);
      result.errors.push(`Missing critical field: ${field}`);
      result.isValid = false;
    }
  });
  
  // Check recommended fields
  let recommendedCount = 0;
  requirements.recommended.forEach(field => {
    const value = getNestedValue(data, field);
    if (hasValue(value)) {
      recommendedCount++;
    } else {
      result.warnings.push(`Missing recommended field: ${field}`);
    }
  });
  
  // Check optional fields
  let optionalCount = 0;
  requirements.optional.forEach(field => {
    const value = getNestedValue(data, field);
    if (hasValue(value)) {
      optionalCount++;
    } else {
      result.missingOptional.push(field);
    }
  });
  
  // Calculate completeness score
  const criticalWeight = 0.6;
  const recommendedWeight = 0.3;
  const optionalWeight = 0.1;
  
  const criticalScore = (criticalCount / requirements.critical.length) * 100 * criticalWeight;
  const recommendedScore = (recommendedCount / requirements.recommended.length) * 100 * recommendedWeight;
  const optionalScore = (optionalCount / requirements.optional.length) * 100 * optionalWeight;
  
  result.completenessScore = Math.round(criticalScore + recommendedScore + optionalScore);
  
  // Add recommendations
  if (result.missingCritical.length > 0) {
    result.recommendations.push(
      `⚠️ CRITICAL: Missing ${result.missingCritical.length} required fields. Manual data entry needed.`
    );
  }
  
  if (result.completenessScore < 50) {
    result.recommendations.push(
      '⚠️ Data completeness below 50%. Consider re-scraping or manual data enhancement.'
    );
  } else if (result.completenessScore < 70) {
    result.recommendations.push(
      '⚠️ Data completeness below 70%. Some sections may be missing or incomplete.'
    );
  }
  
  // Specific recommendations
  if (!hasValue(data.heroImage)) {
    result.recommendations.push('🖼️ No hero image found. Fallback to gallery images or use placeholder.');
  }
  
  if (!hasValue(data.galleryImages) || data.galleryImages?.length < 6) {
    result.recommendations.push('🖼️ Insufficient gallery images. Website may look sparse.');
  }
  
  if (!hasValue(data.testimonials) || data.testimonials?.length < 2) {
    result.recommendations.push('💬 Few or no testimonials found. Consider adding generic social proof.');
  }
  
  if (!hasValue(data.contact?.phone) && !hasValue(data.contact?.email)) {
    result.recommendations.push('📞 No contact method found. Add contact form as fallback.');
  }
  
  return result;
}

/**
 * Generate validation report for logging
 */
export function generateValidationReport(result: ValidationResult): string {
  return `
📊 Data Validation Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Completeness Score: ${result.completenessScore}/100
Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}

${result.errors.length > 0 ? `
🔴 Errors (${result.errors.length}):
${result.errors.map(e => `  • ${e}`).join('\n')}
` : ''}

${result.warnings.length > 0 ? `
⚠️ Warnings (${result.warnings.length}):
${result.warnings.map(w => `  • ${w}`).join('\n')}
` : ''}

${result.recommendations.length > 0 ? `
💡 Recommendations:
${result.recommendations.map(r => `  • ${r}`).join('\n')}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}
