// lib/content-extractors/faq-extractor.ts

import { Page } from 'playwright';

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

/**
 * Extract FAQs from accordion/toggle widgets
 */
export async function extractFromAccordions(page: Page): Promise<FAQ[]> {
  const faqs = await page.evaluate(() => {
    const results: Array<{ question: string; answer: string }> = [];
    
    const widgets = document.querySelectorAll('[class*="accordion"], [class*="faq"], [class*="collapse"]');
    
    widgets.forEach(widget => {
      // Look for question/answer pairs
      const items = widget.querySelectorAll('[class*="item"], [class*="question"]');
      
      items.forEach(item => {
        const questionEl = item.querySelector('[class*="question"], [class*="title"], [class*="header"]');
        const answerEl = item.querySelector('[class*="answer"], [class*="content"], [class*="body"]');
        
        const question = questionEl?.textContent?.trim();
        const answer = answerEl?.textContent?.trim();
        
        if (question && answer) {
          results.push({ question, answer });
        }
      });
    });
    
    return results;
  });
  
  return faqs;
}

/**
 * Extract FAQs from definition lists (<dl>, <dt>, <dd>)
 */
export async function extractFromDefinitionLists(page: Page): Promise<FAQ[]> {
  const faqs = await page.evaluate(() => {
    const results: Array<{ question: string; answer: string }> = [];
    
    const lists = document.querySelectorAll('dl');
    
    lists.forEach(list => {
      const dts = list.querySelectorAll('dt');
      const dds = list.querySelectorAll('dd');
      
      for (let i = 0; i < Math.min(dts.length, dds.length); i++) {
        const question = dts[i]?.textContent?.trim();
        const answer = dds[i]?.textContent?.trim();
        
        if (question && answer) {
          results.push({ question, answer });
        }
      }
    });
    
    return results;
  });
  
  return faqs;
}

/**
 * Extract FAQs from heading-paragraph pairs
 */
export async function extractFromHeadingPairs(page: Page): Promise<FAQ[]> {
  const faqs = await page.evaluate(() => {
    const results: Array<{ question: string; answer: string }> = [];
    
    const sections = document.querySelectorAll('section, .section, [class*="faq"]');
    
    sections.forEach(section => {
      // Check if section is FAQ-related
      const sectionHeading = section.querySelector('h1, h2')?.textContent?.toLowerCase() || '';
      if (!/faq|question|q&a/i.test(sectionHeading)) return;
      
      // Find h3/h4 followed by p
      const headings = section.querySelectorAll('h3, h4');
      
      headings.forEach(heading => {
        const question = heading.textContent?.trim();
        const nextEl = heading.nextElementSibling;
        const answer = nextEl?.tagName === 'P' ? nextEl.textContent?.trim() : undefined;
        
        if (question && answer) {
          results.push({ question, answer });
        }
      });
    });
    
    return results;
  });
  
  return faqs;
}

/**
 * Main FAQ extraction
 */
export async function extractFAQs(page: Page): Promise<FAQ[]> {
  console.log('❓ Extracting FAQs...');
  
  const [accordionFAQs, dlFAQs, headingFAQs] = await Promise.all([
    extractFromAccordions(page).catch(() => []),
    extractFromDefinitionLists(page).catch(() => []),
    extractFromHeadingPairs(page).catch(() => []),
  ]);
  
  const allFAQs = [...accordionFAQs, ...dlFAQs, ...headingFAQs];
  
  // Deduplicate by question
  const uniqueFAQs = allFAQs.reduce((acc, faq) => {
    const exists = acc.find(f => f.question.toLowerCase() === faq.question.toLowerCase());
    if (!exists) acc.push(faq);
    return acc;
  }, [] as FAQ[]);
  
  console.log(`✅ Extracted ${uniqueFAQs.length} FAQs`);
  
  return uniqueFAQs;
}
