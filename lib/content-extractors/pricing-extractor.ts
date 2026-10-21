// lib/content-extractors/pricing-extractor.ts

import { Page } from 'playwright';

export interface PricingTier {
  name: string;
  price: string;
  duration?: string; // e.g., "per month", "one-time"
  features: string[];
  highlighted?: boolean; // "Most Popular" tier
}

/**
 * Extract pricing from card-based layouts
 */
export async function extractPricingCards(page: Page): Promise<PricingTier[]> {
  const tiers = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="pricing"], [class*="package"], [class*="plan"]');
    const results = [];
    
    for (const card of cards) {
      // Find tier name
      const nameEl = card.querySelector('h2, h3, h4, .title');
      const name = nameEl?.textContent?.trim() || '';
      
      if (!name) continue;
      
      // Find price
      const priceEl = card.querySelector('[class*="price"], [class*="cost"]');
      const price = priceEl?.textContent?.trim() || '';
      
      // Find duration/period
      const durationEl = card.querySelector('[class*="period"], [class*="duration"]');
      const duration = durationEl?.textContent?.trim();
      
      // Find features
      const featureList = card.querySelectorAll('li, [class*="feature"]');
      const features = Array.from(featureList).map(li => li.textContent?.trim()).filter(Boolean);
      
      // Check if highlighted
      const highlighted = card.classList.toString().includes('popular') || 
                        card.classList.toString().includes('featured') ||
                        !!card.querySelector('[class*="popular"], [class*="featured"]');
      
      results.push({
        name,
        price,
        duration: duration || undefined,
        features: features as string[],
        highlighted: highlighted || undefined,
      });
    }
    
    return results;
  });
  
  return tiers;
}

/**
 * Extract pricing from HTML tables
 */
export async function extractPricingTables(page: Page): Promise<PricingTier[]> {
  const tiers = await page.evaluate(() => {
    const results: Array<{
      name: string;
      price: string;
      features: string[];
    }> = [];
    
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      const rows = Array.from(table.querySelectorAll('tr'));
      
      // Check if this is a pricing table (look for $ or price keywords)
      const tableText = table.textContent || '';
      if (!/\$|price|cost|fee/i.test(tableText)) return;
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        
        if (cells.length >= 2) {
          const name = cells[0]?.textContent?.trim() || '';
          const price = cells[cells.length - 1]?.textContent?.trim() || '';
          
          if (name && price && /\$|€|£|\d/.test(price)) {
            const features = cells.length > 2 
              ? cells.slice(1, -1).map(c => c.textContent?.trim()).filter(Boolean) as string[]
              : [];
              
            results.push({
              name,
              price,
              features,
            });
          }
        }
      });
    });
    
    return results;
  });
  
  return tiers;
}

/**
 * Main pricing extraction
 */
export async function extractPricing(page: Page): Promise<PricingTier[]> {
  console.log('💰 Extracting pricing information...');
  
  const [cardPricing, tablePricing] = await Promise.all([
    extractPricingCards(page).catch(() => []),
    extractPricingTables(page).catch(() => []),
  ]);
  
  const allPricing = [...cardPricing, ...tablePricing];
  
  // Deduplicate by name
  const uniquePricing = allPricing.reduce((acc, tier) => {
    const exists = acc.find(t => t.name.toLowerCase() === tier.name.toLowerCase());
    if (!exists) acc.push(tier);
    return acc;
  }, [] as PricingTier[]);
  
  console.log(`✅ Extracted ${uniquePricing.length} pricing tiers`);
  
  return uniquePricing;
}
