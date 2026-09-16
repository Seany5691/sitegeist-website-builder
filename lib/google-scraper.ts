/**
 * Google Maps & Reviews Scraper
 * Extracts business info, reviews, photos, and hours from Google Maps
 */

import { chromium, Browser } from 'playwright'

export interface GoogleBusinessData {
  name: string
  rating: number
  reviewCount: number
  reviews: Array<{
    author: string
    text: string
    rating: number
    date: string
  }>
  hours: Array<{
    day: string
    opens: string
    closes: string
  }>
  photos: string[]
  description: string
  address: string
  phone: string
  website: string
  categories: string[]
}

export async function scrapeGoogleMaps(url: string): Promise<GoogleBusinessData | null> {
  console.log(`[Google Scraper] Scraping: ${url}`)
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // Wait for content to load
    await page.waitForTimeout(3000)
    
    // Scroll to load reviews
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(1000)
    }
    
    // Extract business data
    const data = await page.evaluate(() => {
      const getText = (selector: string) => {
        const el = document.querySelector(selector)
        return el?.textContent?.trim() || ''
      }
      
      const getAllText = (selector: string) => {
        return Array.from(document.querySelectorAll(selector))
          .map(el => el.textContent?.trim())
          .filter(Boolean) as string[]
      }
      
      // Business name
      const name = getText('h1') || getText('[data-attrid="title"]')
      
      // Rating
      const ratingText = getText('[aria-label*="stars"]') || getText('[class*="rating"]')
      const ratingMatch = ratingText.match(/([\d.]+)/)
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0
      
      // Review count
      const reviewText = getText('[aria-label*="reviews"]') || getText('[class*="review"]')
      const reviewMatch = reviewText.match(/(\d+)/)
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0
      
      // Reviews
      const reviewElements = document.querySelectorAll('[data-review-id], [class*="review-item"]')
      const reviews = Array.from(reviewElements).slice(0, 10).map(el => {
        const author = el.querySelector('[class*="author"]')?.textContent?.trim() || 'Customer'
        const text = el.querySelector('[class*="text"]')?.textContent?.trim() || ''
        const ratingEl = el.querySelector('[aria-label*="star"]')
        const ratingMatch = ratingEl?.getAttribute('aria-label')?.match(/(\d+)/)
        const reviewRating = ratingMatch ? parseInt(ratingMatch[1]) : 5
        const date = el.querySelector('[class*="date"]')?.textContent?.trim() || ''
        return { author, text, rating: reviewRating, date }
      }).filter(r => r.text.length > 10)
      
      // Hours
      const hoursElements = document.querySelectorAll('[class*="hour"], [data-attrid*="hours"]')
      const hours: Array<{ day: string; opens: string; closes: string }> = []
      
      hoursElements.forEach(el => {
        const text = el.textContent || ''
        const dayMatch = text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)
        const timeMatch = text.match(/(\d{1,2}:\d{2})\s*–\s*(\d{1,2}:\d{2})/)
        
        if (dayMatch && timeMatch) {
          hours.push({
            day: dayMatch[1],
            opens: timeMatch[1],
            closes: timeMatch[2],
          })
        }
      })
      
      // Photos
      const photoElements = document.querySelectorAll('img[src*="googleusercontent"], img[src*="maps"]')
      const photos = Array.from(photoElements)
        .map(img => (img as HTMLImageElement).src)
        .filter(src => src && !src.includes('icon') && !src.includes('logo'))
        .slice(0, 20)
      
      // Description
      const description = getText('[class*="description"]') || 
                          getText('[data-attrid="description"]') ||
                          getText('[class*="about"]')
      
      // Address
      const address = getText('[data-attrid*="address"]') || 
                      getText('[class*="address"]') ||
                      getText('[aria-label*="Address"]')
      
      // Phone
      const phone = getText('[data-attrid*="phone"]') || 
                    getText('[class*="phone"]') ||
                    getText('[aria-label*="Phone"]')
      
      // Website
      const websiteEl = document.querySelector('a[data-attrid*="website"]') || 
                        document.querySelector('a[href*="http"]')
      const website = (websiteEl as HTMLAnchorElement)?.href || ''
      
      // Categories
      const categories = getAllText('[class*="category"], [data-attrid*="category"]')
      
      return {
        name,
        rating,
        reviewCount,
        reviews,
        hours,
        photos,
        description,
        address,
        phone,
        website,
        categories,
      }
    })
    
    await page.close()
    await context.close()
    
    console.log(`[Google Scraper] Extracted: ${data.name}, ${data.rating}★, ${data.reviews.length} reviews, ${data.photos.length} photos`)
    
    return data
    
  } catch (error) {
    console.error('[Google Scraper] Failed:', error)
    return null
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Search Google Maps for a business and scrape the first result
 */
export async function searchAndScrapeGoogle(businessName: string, city: string): Promise<GoogleBusinessData | null> {
  const searchQuery = encodeURIComponent(`${businessName} ${city}`)
  const searchUrl = `https://www.google.com/maps/search/${searchQuery}`
  
  console.log(`[Google Scraper] Searching: ${businessName} in ${city}`)
  
  let browser: Browser | null = null
  
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    
    const page = await context.newPage()
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // Wait for results
    await page.waitForTimeout(3000)
    
    // Click the first result
    const firstResult = await page.$('[class*="result"], [class*="place"]')
    if (firstResult) {
      await firstResult.click()
      await page.waitForTimeout(2000)
    }
    
    // Get the current URL (should be a place URL)
    const currentUrl = page.url()
    
    if (currentUrl.includes('/place/')) {
      // We're on a place page, scrape it
      await context.close()
      await browser.close()
      return scrapeGoogleMaps(currentUrl)
    }
    
    await context.close()
    await browser.close()
    
    return null
  } catch (error) {
    console.error('[Google Scraper] Search failed:', error)
    if (browser) await browser.close()
    return null
  }
}
