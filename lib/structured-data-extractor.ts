// lib/structured-data-extractor.ts

import { Page } from 'playwright';

export interface StructuredBusinessData {
  // Schema.org LocalBusiness
  name?: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  openingHours?: string[];
  priceRange?: string;
  
  // Schema.org Service/Product
  services?: Array<{
    name: string;
    description?: string;
    price?: string;
    image?: string;
  }>;
  
  // Schema.org FAQPage
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  
  // OpenGraph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  
  // Additional metadata
  foundData: {
    hasJsonLd: boolean;
    hasOpenGraph: boolean;
    hasMicrodata: boolean;
    schemas: string[]; // ['LocalBusiness', 'Service', 'FAQPage']
  };
}

/**
 * Extract JSON-LD structured data from page
 */
export async function extractJsonLd(page: Page): Promise<any[]> {
  const jsonLdScripts = await page.$$eval(
    'script[type="application/ld+json"]',
    (scripts) => scripts.map(s => {
      try {
        return JSON.parse(s.textContent || '');
      } catch {
        return null;
      }
    }).filter(Boolean)
  );
  
  return jsonLdScripts;
}

/**
 * Extract OpenGraph meta tags
 */
export async function extractOpenGraph(page: Page): Promise<Record<string, string>> {
  const ogData = await page.$$eval(
    'meta[property^="og:"]',
    (metas) => {
      const data: Record<string, string> = {};
      metas.forEach(meta => {
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (property && content) {
          // Convert "og:title" to "ogTitle"
          const key = property.replace('og:', 'og').replace(/:([a-z])/g, (_, letter) => letter.toUpperCase());
          data[key] = content;
        }
      });
      return data;
    }
  );
  
  return ogData;
}

/**
 * Parse LocalBusiness schema
 */
function parseLocalBusiness(schema: any): Partial<StructuredBusinessData> {
  const data: Partial<StructuredBusinessData> = {};
  
  if (schema.name) data.name = schema.name;
  if (schema.description) data.description = schema.description;
  if (schema.telephone) data.telephone = schema.telephone;
  if (schema.email) data.email = schema.email;
  
  if (schema.address) {
    data.address = {
      streetAddress: schema.address.streetAddress,
      addressLocality: schema.address.addressLocality,
      addressRegion: schema.address.addressRegion,
      postalCode: schema.address.postalCode,
      addressCountry: schema.address.addressCountry,
    };
  }
  
  if (schema.openingHoursSpecification) {
    data.openingHours = Array.isArray(schema.openingHoursSpecification)
      ? schema.openingHoursSpecification.map((spec: any) => 
          `${spec.dayOfWeek}: ${spec.opens} - ${spec.closes}`
        )
      : [schema.openingHoursSpecification];
  }
  
  if (schema.priceRange) data.priceRange = schema.priceRange;
  
  return data;
}

/**
 * Parse Service schema array
 */
function parseServices(schemas: any[]): Array<{ name: string; description?: string; price?: string; image?: string; }> {
  const services: Array<{ name: string; description?: string; price?: string; image?: string; }> = [];
  
  schemas.forEach(schema => {
    if (schema['@type'] === 'Service' || schema['@type'] === 'Product') {
      services.push({
        name: schema.name,
        description: schema.description,
        price: schema.offers?.price || schema.offers?.priceCurrency + schema.offers?.price,
        image: schema.image,
      });
    }
    
    // Handle nested services in hasOfferCatalog
    if (schema.hasOfferCatalog?.itemListElement) {
      schema.hasOfferCatalog.itemListElement.forEach((item: any) => {
        services.push({
          name: item.name,
          description: item.description,
          price: item.offers?.price,
          image: item.image,
        });
      });
    }
  });
  
  return services;
}

/**
 * Parse FAQPage schema
 */
function parseFAQs(schema: any): Array<{ question: string; answer: string; }> {
  const faqs: Array<{ question: string; answer: string; }> = [];
  
  if (schema['@type'] === 'FAQPage' && schema.mainEntity) {
    const questions = Array.isArray(schema.mainEntity) ? schema.mainEntity : [schema.mainEntity];
    
    questions.forEach((q: any) => {
      if (q['@type'] === 'Question') {
        faqs.push({
          question: q.name,
          answer: q.acceptedAnswer?.text || (q.acceptedAnswer?.['@type'] === 'Answer' && q.acceptedAnswer.text) || '',
        });
      }
    });
  }
  
  return faqs;
}

/**
 * Main extraction function - combines all structured data sources
 */
export async function extractStructuredData(page: Page): Promise<StructuredBusinessData> {
  const [jsonLdSchemas, ogData] = await Promise.all([
    extractJsonLd(page),
    extractOpenGraph(page),
  ]);
  
  const result: StructuredBusinessData = {
    foundData: {
      hasJsonLd: jsonLdSchemas.length > 0,
      hasOpenGraph: Object.keys(ogData).length > 0,
      hasMicrodata: false, // TODO: Implement microdata extraction if needed
      schemas: [],
    },
  };
  
  // Process JSON-LD schemas
  jsonLdSchemas.forEach(schema => {
    const schemaType = schema['@type'];
    if (schemaType) {
      result.foundData.schemas.push(schemaType);
    }
    
    // Parse LocalBusiness
    if (schemaType === 'LocalBusiness' || schemaType?.includes?.('LocalBusiness')) {
      Object.assign(result, parseLocalBusiness(schema));
    }
    
    // Parse Services
    if (schemaType === 'Service' || schemaType === 'Product') {
      result.services = parseServices([schema]);
    }
    
    // Parse FAQs
    if (schemaType === 'FAQPage') {
      result.faqs = parseFAQs(schema);
    }
  });
  
  // Merge OpenGraph data
  if (ogData.ogTitle) result.ogTitle = ogData.ogTitle;
  if (ogData.ogDescription) result.ogDescription = ogData.ogDescription;
  if (ogData.ogImage) result.ogImage = ogData.ogImage;
  if (ogData.ogType) result.ogType = ogData.ogType;
  
  return result;
}

/**
 * Helper: Merge structured data with scraped content
 * Prioritizes structured data (more accurate) over scraped text
 */
export function mergeStructuredData(
  scrapedData: any,
  structuredData: StructuredBusinessData
): any {
  return {
    ...scrapedData,
    
    // Override business name if structured data has it
    businessName: structuredData.name || scrapedData.businessName,
    
    // Use structured description if available (usually better quality)
    about: structuredData.description || structuredData.ogDescription || scrapedData.about,
    
    // Add contact info from structured data
    contact: {
      ...scrapedData.contact,
      phone: structuredData.telephone || scrapedData.contact?.phone,
      email: structuredData.email || scrapedData.contact?.email,
      address: structuredData.address || scrapedData.contact?.address,
    },
    
    // Add business hours
    openingHours: structuredData.openingHours || scrapedData.openingHours,
    
    // Add price range
    priceRange: structuredData.priceRange || scrapedData.priceRange,
    
    // Add services from structured data
    services: structuredData.services?.length 
      ? structuredData.services 
      : scrapedData.services,
    
    // Add FAQs
    faqs: structuredData.faqs?.length 
      ? structuredData.faqs 
      : scrapedData.faqs,
    
    // Store metadata for debugging
    _structuredDataFound: structuredData.foundData,
  };
}
