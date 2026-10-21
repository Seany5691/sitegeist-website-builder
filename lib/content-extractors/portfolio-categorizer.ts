// lib/content-extractors/portfolio-categorizer.ts

import { Page } from 'playwright';

export interface PortfolioCategory {
  name: string;
  slug: string;
  description?: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  pageUrl?: string;
}

/**
 * Extract portfolio categories from navigation
 */
export async function extractFromNavigation(page: Page): Promise<string[]> {
  const categories = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a[href*="portfolio"], nav a[href*="gallery"], nav a[href*="work"]'));
    
    return links
      .map(link => link.textContent?.trim())
      .filter(Boolean) as string[];
  });
  
  return categories;
}

/**
 * Extract portfolio categories from gallery grid
 */
export async function extractFromGalleryGrid(page: Page): Promise<PortfolioCategory[]> {
  const categories = await page.evaluate(() => {
    const results: Array<{
      name: string;
      slug: string;
      description?: string;
      images: Array<{
        url: string;
        alt?: string;
        caption?: string;
      }>;
    }> = [];
    
    const sections = document.querySelectorAll('[class*="portfolio"], [class*="gallery"], [class*="category"]');
    
    sections.forEach(section => {
      // Find category heading
      const heading = section.querySelector('h2, h3, .category-title');
      const name = heading?.textContent?.trim();
      
      if (!name) return;
      
      // Find images in this section
      const imageElements = Array.from(section.querySelectorAll('img'));
      const images = imageElements.map(img => ({
        url: (img as HTMLImageElement).src,
        alt: img.alt || undefined,
        caption: img.getAttribute('data-caption') || img.title || undefined,
      }));
      
      // Find description
      const description = section.querySelector('p, .description')?.textContent?.trim();
      
      results.push({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        images,
      });
    });
    
    return results;
  });
  
  return categories;
}

/**
 * Crawl category pages if they exist
 */
export async function crawlCategoryPages(page: Page, baseUrl: string): Promise<PortfolioCategory[]> {
  const categories: PortfolioCategory[] = [];
  
  // Find portfolio/gallery links
  const categoryLinks = await page.evaluate((base) => {
    const links = Array.from(document.querySelectorAll('a[href*="portfolio"], a[href*="gallery"], a[href*="work"]'));
    
    return links.map(link => {
      const anchor = link as HTMLAnchorElement;
      return {
        url: new URL(anchor.href, base).href,
        name: link.textContent?.trim() || '',
      };
    });
  }, baseUrl);
  
  // Visit each category page (limit to 10 to avoid excessive crawling)
  for (const link of categoryLinks.slice(0, 10)) {
    if (!link.name) continue;
    
    try {
      await page.goto(link.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // Extract images from category page
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
          url: (img as HTMLImageElement).src,
          alt: img.alt || undefined,
          caption: img.title || undefined,
        }));
      });
      
      categories.push({
        name: link.name,
        slug: link.name.toLowerCase().replace(/\s+/g, '-'),
        images,
        pageUrl: link.url,
      });
    } catch (error) {
      console.error(`Failed to crawl ${link.url}:`, error);
    }
  }
  
  return categories;
}

/**
 * Main portfolio categorization
 */
export async function categorizePortfolio(page: Page, baseUrl: string): Promise<PortfolioCategory[]> {
  console.log('🎨 Categorizing portfolio...');
  
  // Try grid-based extraction first (faster)
  const gridCategories = await extractFromGalleryGrid(page).catch(() => []);
  
  if (gridCategories.length > 0) {
    console.log(`✅ Found ${gridCategories.length} categories from grid layout`);
    return gridCategories;
  }
  
  // Fall back to crawling category pages
  console.log('No grid layout found, crawling category pages...');
  const crawledCategories = await crawlCategoryPages(page, baseUrl).catch(() => []);
  
  console.log(`✅ Found ${crawledCategories.length} categories from crawling`);
  
  return crawledCategories;
}
