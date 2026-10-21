// lib/content-extractors/before-after-detector.ts

import { Page } from 'playwright';

export interface BeforeAfterPair {
  before: {
    url: string;
    alt?: string;
  };
  after: {
    url: string;
    alt?: string;
  };
  category?: string; // e.g., "Bathroom Renovation", "Weight Loss", "Skin Treatment"
  description?: string;
  'side-by-side'?: boolean; // true if images are displayed side-by-side
}

/**
 * Detect before/after indicators in text
 */
const BEFORE_PATTERNS = [
  /before/i,
  /pre-treatment/i,
  /original/i,
  /old/i,
];

const AFTER_PATTERNS = [
  /after/i,
  /post-treatment/i,
  /result/i,
  /new/i,
  /completed/i,
];

/**
 * Check if image is marked as "before"
 */
function isBeforeImage(img: Element): boolean {
  const alt = img.getAttribute('alt') || '';
  const src = img.getAttribute('src') || '';
  const title = img.getAttribute('title') || '';
  const parentText = img.parentElement?.textContent || '';
  
  const searchText = `${alt} ${src} ${title} ${parentText}`.toLowerCase();
  
  return BEFORE_PATTERNS.some(pattern => pattern.test(searchText));
}

/**
 * Check if image is marked as "after"
 */
function isAfterImage(img: Element): boolean {
  const alt = img.getAttribute('alt') || '';
  const src = img.getAttribute('src') || '';
  const title = img.getAttribute('title') || '';
  const parentText = img.parentElement?.textContent || '';
  
  const searchText = `${alt} ${src} ${title} ${parentText}`.toLowerCase();
  
  return AFTER_PATTERNS.some(pattern => pattern.test(searchText));
}

/**
 * Extract before/after pairs from slider/comparison widgets
 */
export async function extractFromSliders(page: Page): Promise<BeforeAfterPair[]> {
  const pairs = await page.evaluate(
    ({ beforePatterns, afterPatterns }) => {
      const results: Array<{
        before: { url: string; alt?: string };
        after: { url: string; alt?: string };
        'side-by-side': boolean;
      }> = [];
      
      // Helper functions in browser context
      function isBeforeImageBrowser(img: Element): boolean {
        const alt = img.getAttribute('alt') || '';
        const src = img.getAttribute('src') || '';
        const title = img.getAttribute('title') || '';
        const parentText = img.parentElement?.textContent || '';
        
        const searchText = `${alt} ${src} ${title} ${parentText}`.toLowerCase();
        
        return beforePatterns.some((pattern: string) => new RegExp(pattern, 'i').test(searchText));
      }
      
      function isAfterImageBrowser(img: Element): boolean {
        const alt = img.getAttribute('alt') || '';
        const src = img.getAttribute('src') || '';
        const title = img.getAttribute('title') || '';
        const parentText = img.parentElement?.textContent || '';
        
        const searchText = `${alt} ${src} ${title} ${parentText}`.toLowerCase();
        
        return afterPatterns.some((pattern: string) => new RegExp(pattern, 'i').test(searchText));
      }
      
      const widgets = document.querySelectorAll('[class*="before-after"], [class*="comparison"], [class*="slider"]');
      
      widgets.forEach(widget => {
        const images = Array.from(widget.querySelectorAll('img'));
        
        if (images.length === 2) {
          const [img1, img2] = images;
          
          // Determine which is before and which is after
          const img1IsBefore = isBeforeImageBrowser(img1);
          const img2IsBefore = isBeforeImageBrowser(img2);
          
          let before, after;
          
          if (img1IsBefore && !img2IsBefore) {
            before = img1;
            after = img2;
          } else if (img2IsBefore && !img1IsBefore) {
            before = img2;
            after = img1;
          } else {
            // Default: assume left/first is before, right/second is after
            before = img1;
            after = img2;
          }
          
          const beforeImg = before as HTMLImageElement;
          const afterImg = after as HTMLImageElement;
          
          results.push({
            before: {
              url: beforeImg.src,
              alt: beforeImg.alt,
            },
            after: {
              url: afterImg.src,
              alt: afterImg.alt,
            },
            'side-by-side': true,
          });
        }
      });
      
      return results;
    },
    {
      beforePatterns: BEFORE_PATTERNS.map(p => p.source),
      afterPatterns: AFTER_PATTERNS.map(p => p.source),
    }
  );
  
  return pairs;
}

/**
 * Extract before/after pairs from sequential gallery images
 */
export async function extractFromGallery(page: Page): Promise<BeforeAfterPair[]> {
  const pairs: BeforeAfterPair[] = [];
  
  const images = await page.evaluate(
    ({ beforePatterns, afterPatterns }) => {
      function isBeforeImageBrowser(img: Element): boolean {
        const alt = img.getAttribute('alt') || '';
        const src = img.getAttribute('src') || '';
        const title = img.getAttribute('title') || '';
        const parentText = img.parentElement?.textContent || '';
        
        const searchText = `${alt} ${src} ${title} ${parentText}`.toLowerCase();
        
        return beforePatterns.some((pattern: string) => new RegExp(pattern, 'i').test(searchText));
      }
      
      function isAfterImageBrowser(img: Element): boolean {
        const alt = img.getAttribute('alt') || '';
        const src = img.getAttribute('src') || '';
        const title = img.getAttribute('title') || '';
        const parentText = img.parentElement?.textContent || '';
        
        const searchText = `${alt} ${src} ${title} ${parentText}`.toLowerCase();
        
        return afterPatterns.some((pattern: string) => new RegExp(pattern, 'i').test(searchText));
      }
      
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        url: (img as HTMLImageElement).src,
        alt: img.alt || '',
        title: img.title || '',
        isBefore: isBeforeImageBrowser(img),
        isAfter: isAfterImageBrowser(img),
      }));
    },
    {
      beforePatterns: BEFORE_PATTERNS.map(p => p.source),
      afterPatterns: AFTER_PATTERNS.map(p => p.source),
    }
  );
  
  // Look for consecutive before/after pairs
  for (let i = 0; i < images.length - 1; i++) {
    const current = images[i];
    const next = images[i + 1];
    
    if (current.isBefore && next.isAfter) {
      pairs.push({
        before: {
          url: current.url,
          alt: current.alt,
        },
        after: {
          url: next.url,
          alt: next.alt,
        },
        'side-by-side': false,
      });
      
      i++; // Skip next image since it's part of this pair
    }
  }
  
  return pairs;
}

/**
 * Extract category from surrounding context
 */
async function extractCategory(page: Page, imageUrl: string): Promise<string | undefined> {
  const category = await page.evaluate(
    (url) => {
      const img = document.querySelector(`img[src="${url}"]`);
      if (!img) return undefined;
      
      // Look for heading above image
      let el: Element | null = img;
      while (el && el.parentElement) {
        el = el.parentElement;
        const heading = el.querySelector('h1, h2, h3, h4');
        if (heading?.textContent) {
          return heading.textContent.trim();
        }
      }
      return undefined;
    },
    imageUrl
  ).catch(() => undefined);
  
  return category;
}

/**
 * Main before/after detection
 */
export async function detectBeforeAfterPairs(page: Page): Promise<BeforeAfterPair[]> {
  console.log('🔍 Detecting before/after image pairs...');
  
  const [sliderPairs, galleryPairs] = await Promise.all([
    extractFromSliders(page).catch(() => []),
    extractFromGallery(page).catch(() => []),
  ]);
  
  const allPairs = [...sliderPairs, ...galleryPairs];
  
  // Add categories
  for (const pair of allPairs) {
    pair.category = await extractCategory(page, pair.before.url);
  }
  
  console.log(`✅ Found ${allPairs.length} before/after pairs`);
  
  return allPairs;
}
