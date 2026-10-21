// lib/prompt-builder-validator.ts

import { MasterSiteConfig } from '@/types/site-config';

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string; severity: 'critical' | 'warning' }>;
  warnings: string[];
  completenessScore: number; // 0-100
}

export interface ValidationRequirements {
  critical: Array<{ field: string; validator: (config: MasterSiteConfig) => boolean; message: string }>;
  recommended: Array<{ field: string; validator: (config: MasterSiteConfig) => boolean; message: string }>;
}

/**
 * Define what fields are required for prompt generation
 */
const PROMPT_VALIDATION_REQUIREMENTS: ValidationRequirements = {
  critical: [
    {
      field: 'businessName',
      validator: (config) => !!config.businessName && config.businessName.trim().length > 0,
      message: 'businessName is required and cannot be empty',
    },
    {
      field: 'contact.phone',
      validator: (config) => !!config.contact?.phone && /\d{9,}/.test(config.contact.phone.replace(/\D/g, '')),
      message: 'contact.phone must be a valid phone number with at least 9 digits',
    },
    {
      field: 'city',
      validator: (config) => !!config.city && config.city.trim().length > 0,
      message: 'city is required for local SEO and location targeting',
    },
    {
      field: 'services',
      validator: (config) => Array.isArray(config.services) && config.services.length > 0,
      message: 'services array must contain at least 1 service',
    },
    {
      field: 'services[].title',
      validator: (config) => config.services?.every(s => !!s.title && s.title.trim().length > 0) ?? false,
      message: 'Every service must have a non-empty title',
    },
    {
      field: 'services[].description',
      validator: (config) => config.services?.every(s => !!s.description && s.description.trim().length > 10) ?? false,
      message: 'Every service must have a description with at least 10 characters',
    },
  ],
  recommended: [
    {
      field: 'contact.email',
      validator: (config) => !!config.contact?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contact.email),
      message: 'contact.email should be a valid email address',
    },
    {
      field: 'contact.address',
      validator: (config) => !!config.contact?.address && config.contact.address.trim().length > 5,
      message: 'contact.address should be provided for local businesses',
    },
    {
      field: 'seo.title',
      validator: (config) => !!config.seo?.title && config.seo.title.length >= 30 && config.seo.title.length <= 60,
      message: 'seo.title should be 30-60 characters for optimal SEO',
    },
    {
      field: 'seo.description',
      validator: (config) => !!config.seo?.description && config.seo.description.length >= 120 && config.seo.description.length <= 160,
      message: 'seo.description should be 120-160 characters for optimal SEO',
    },
    {
      field: 'testimonials',
      validator: (config) => Array.isArray(config.testimonials) && config.testimonials.length >= 3,
      message: 'At least 3 testimonials are recommended for social proof',
    },
    {
      field: 'gallery or pageMediaMap',
      validator: (config) => 
        (Array.isArray(config.gallery) && config.gallery.length >= 6) ||
        (Array.isArray(config.pageMediaMap) && config.pageMediaMap.length > 0),
      message: 'At least 6 gallery images are recommended for visual impact',
    },
    {
      field: 'brandAssets.logoUrl',
      validator: (config) => !!config.brandAssets?.logoUrl && /^https?:\/\/.+/.test(config.brandAssets.logoUrl),
      message: 'brandAssets.logoUrl should be a valid URL',
    },
    {
      field: 'socialLinks',
      validator: (config) => !!config.socialLinks && Object.values(config.socialLinks).some(v => !!v),
      message: 'At least one social media link is recommended',
    },
  ],
};

/**
 * Validate site config before prompt generation
 */
export function validatePromptData(config: MasterSiteConfig): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    completenessScore: 0,
  };

  let criticalPassed = 0;
  let recommendedPassed = 0;

  // Validate critical fields
  for (const requirement of PROMPT_VALIDATION_REQUIREMENTS.critical) {
    try {
      const isValid = requirement.validator(config);
      if (isValid) {
        criticalPassed++;
      } else {
        result.errors.push({
          field: requirement.field,
          message: requirement.message,
          severity: 'critical',
        });
        result.isValid = false;
      }
    } catch (error) {
      result.errors.push({
        field: requirement.field,
        message: `Validation error: ${requirement.message}`,
        severity: 'critical',
      });
      result.isValid = false;
    }
  }

  // Validate recommended fields
  for (const requirement of PROMPT_VALIDATION_REQUIREMENTS.recommended) {
    try {
      const isValid = requirement.validator(config);
      if (isValid) {
        recommendedPassed++;
      } else {
        result.warnings.push(`${requirement.field}: ${requirement.message}`);
      }
    } catch (error) {
      result.warnings.push(`${requirement.field}: ${requirement.message}`);
    }
  }

  // Calculate completeness score
  const criticalWeight = 0.7;
  const recommendedWeight = 0.3;

  const criticalScore =
    (criticalPassed / PROMPT_VALIDATION_REQUIREMENTS.critical.length) * 100 * criticalWeight;
  const recommendedScore =
    (recommendedPassed / PROMPT_VALIDATION_REQUIREMENTS.recommended.length) * 100 * recommendedWeight;

  result.completenessScore = Math.round(criticalScore + recommendedScore);

  return result;
}

/**
 * Apply fallbacks to fix critical validation errors
 */
export function applyPromptFallbacks(config: MasterSiteConfig): MasterSiteConfig {
  const fixed = { ...config };

  // Fallback: businessName
  if (!fixed.businessName || fixed.businessName.trim().length === 0) {
    const discoveredUrl = fixed.legacyUrls?.discovered?.[0];
    fixed.businessName = discoveredUrl ? new URL(discoveredUrl).hostname.replace('www.', '') : 'Our Business';
  }

  // Fallback: contact.phone
  if (!fixed.contact?.phone || !/\d{9,}/.test(fixed.contact.phone.replace(/\D/g, ''))) {
    if (!fixed.contact) fixed.contact = {} as any;
    fixed.contact.phone = '0123456789'; // Placeholder - should be flagged for manual entry
  }

  // Fallback: city
  if (!fixed.city || fixed.city.trim().length === 0) {
    fixed.city = 'Johannesburg'; // Default - should be corrected
  }

  // Fallback: services
  if (!Array.isArray(fixed.services) || fixed.services.length === 0) {
    fixed.services = [
      {
        title: 'Our Services',
        description: 'We provide professional services tailored to your needs.',
        icon: 'star',
        realImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      },
    ];
  }

  // Validate each service has required fields
  fixed.services = fixed.services.map(service => ({
    ...service,
    title: service.title || 'Service',
    description: service.description || 'Professional service description.',
    icon: service.icon || 'star',
    realImageUrl: service.realImageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  }));

  return fixed;
}

/**
 * Generate validation report for logging
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════');
  lines.push('  PROMPT DATA VALIDATION REPORT');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push(`Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
  lines.push(`Completeness Score: ${result.completenessScore}/100`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push('🔴 CRITICAL ERRORS:');
    result.errors.forEach(error => {
      lines.push(`  ✗ ${error.field}: ${error.message}`);
    });
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️  WARNINGS:');
    result.warnings.forEach(warning => {
      lines.push(`  • ${warning}`);
    });
    lines.push('');
  }

  if (result.isValid && result.warnings.length === 0) {
    lines.push('✅ All validation checks passed!');
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════');

  return lines.join('\n');
}
