// lib/content-extractors/service-extractor.ts

import { Page } from 'playwright';

export interface Service {
  name: string;
  description?: string;
  price?: string;
  duration?: string;
  image?: string;
  features?: string[];
  category?: string;
}

/**
 * Detect service section indicators
 */
const SERVICE_HEADINGS = [
  /our services/i,
  /what we (do|offer)/i,
  /services (we )?offer/i,
  /treatments/i,
  /packages/i,
  /pricing/i,
  /our work/i,
  /specialties/i,
];

/**
 * Extract services from card-based layouts
 */
export async function extractServiceCards(page: Page): Promise<Service[]> {
  const services = await page.$$eval('[class*="service"], [class*="card"], [class*="offering"]', (cards) => {
    const results = [];
    
    for (const card of cards) {
      // Find heading (service name)
      const heading = card.querySelector('h2, h3, h4, .title, [class*="heading"]');
      const name = heading?.textContent?.trim() || '';
      
      if (!name) continue;
      
      // Find description
      const description = card.querySelector('p, .description, [class*="desc"]')?.textContent?.trim();
      
      // Find price
      const priceEl = card.querySelector('[class*="price"], [class*="cost"]');
      const price = priceEl?.textContent?.trim();
      
      // Find image
      const img = card.querySelector('img');
      const image = img?.src;
      
      // Find feature list
      const featureList = card.querySelectorAll('li, [class*="feature"]');
      const features = Array.from(featureList).map(li => li.textContent?.trim()).filter(Boolean);
      
      results.push({
        name,
        description,
        price,
        image,
        features: features.length > 0 ? features as string[] : undefined,
      });
    }
    
    return results;
  });
  
  return services;
}

/**
 * Extract services from list-based layouts
 */
export async function extractServiceLists(page: Page): Promise<Service[]> {
  const services: Service[] = [];
  
  // Find sections with service headings
  const serviceSections = await page.$$('section, .section, [class*="service"]');
  
  for (const section of serviceSections) {
    const headingText = await section.$eval('h2, h3', el => el.textContent).catch(() => '');
    
    // Check if this section is about services
    const isServiceSection = SERVICE_HEADINGS.some(pattern => pattern.test(headingText));
    
    if (isServiceSection) {
      // Extract list items as services
      const items = await section.$$eval('ul li, ol li', (items) => {
        return items.map(item => {
          const text = item.textContent?.trim() || '';
          
          // Try to split "Service Name - Description" format
          const parts = text.split(/[-–—:]/);
          
          return {
            name: parts[0]?.trim() || text,
            description: parts[1]?.trim(),
          };
        });
      }).catch(() => []);
      
      services.push(...items);
    }
  }
  
  return services;
}

/**
 * Extract services from table-based pricing layouts
 */
export async function extractServiceTables(page: Page): Promise<Service[]> {
  const services = await page.$$eval('table', (tables) => {
    const allServices: Array<{ name: string; description?: string; price?: string; }> = [];
    
    tables.forEach(table => {
      const rows = Array.from(table.querySelectorAll('tr'));
      
      // Skip header row
      const dataRows = rows.slice(1);
      
      dataRows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        
        if (cells.length >= 2) {
          const name = cells[0]?.textContent?.trim();
          const price = cells[cells.length - 1]?.textContent?.trim();
          const description = cells.length > 2 ? cells[1]?.textContent?.trim() : undefined;
          
          if (name) {
            allServices.push({
              name,
              description,
              price,
            });
          }
        }
      });
    });
    
    return allServices;
  });
  
  return services;
}

/**
 * Main service extraction - combines all strategies
 */
export async function extractServices(page: Page): Promise<Service[]> {
  console.log('🔍 Extracting services using multiple strategies...');
  
  const [cardServices, listServices, tableServices] = await Promise.all([
    extractServiceCards(page).catch(() => []),
    extractServiceLists(page).catch(() => []),
    extractServiceTables(page).catch(() => []),
  ]);
  
  console.log('Found services:', {
    fromCards: cardServices.length,
    fromLists: listServices.length,
    fromTables: tableServices.length,
  });
  
  // Combine and deduplicate
  const allServices = [...cardServices, ...listServices, ...tableServices];
  
  // Deduplicate by name (case-insensitive)
  const uniqueServices = allServices.reduce((acc, service) => {
    const exists = acc.find(s => 
      s.name.toLowerCase() === service.name.toLowerCase()
    );
    
    if (!exists) {
      acc.push(service);
    } else {
      // Merge data if duplicate has more info
      if (service.description && !exists.description) {
        exists.description = service.description;
      }
      if (service.price && !exists.price) {
        exists.price = service.price;
      }
      if (service.image && !exists.image) {
        exists.image = service.image;
      }
    }
    
    return acc;
  }, [] as Service[]);
  
  console.log(`✅ Extracted ${uniqueServices.length} unique services`);
  
  return uniqueServices;
}

/**
 * Categorize services using keyword matching
 */
export function categorizeServices(services: Service[]): Service[] {
  const categories: Record<string, RegExp> = {
    'Hair Services': /hair|cut|style|color|highlight|balayage/i,
    'Skin Treatments': /facial|skin|peel|microdermabrasion|laser/i,
    'Body Treatments': /massage|spa|body|wrap|scrub/i,
    'Nails': /nail|manicure|pedicure|gel/i,
    'Makeup': /makeup|cosmetic|beauty/i,
    'Wellness': /wellness|therapy|health|yoga|meditation/i,
    'Construction': /construction|building|renovation|remodel/i,
    'Plumbing': /plumb|pipe|drain|water/i,
    'Electrical': /electric|wiring|lighting/i,
    'HVAC': /hvac|heating|cooling|air condition/i,
    'Cleaning': /clean|janitorial|housekeeping/i,
    'Landscaping': /landscape|lawn|garden|tree/i,
    'Automotive': /auto|car|vehicle|mechanic/i,
    'IT Services': /IT|tech|computer|software|network/i,
    'Marketing': /market|advertising|seo|social media/i,
    'Legal': /legal|law|attorney|paralegal/i,
    'Medical': /medical|health|doctor|dental|therapy/i,
    'Real Estate': /real estate|property|listing|rent/i,
    'Photography': /photo|photography|portrait|wedding/i,
    'Catering': /cater|food|event|banquet/i,
  };
  
  return services.map(service => {
    for (const [category, pattern] of Object.entries(categories)) {
      if (pattern.test(service.name) || pattern.test(service.description || '')) {
        return { ...service, category };
      }
    }
    return service;
  });
}
