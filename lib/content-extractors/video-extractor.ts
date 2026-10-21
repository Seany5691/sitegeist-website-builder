// lib/content-extractors/video-extractor.ts

import { Page } from 'playwright';

export interface VideoContent {
  url: string;
  platform: 'youtube' | 'vimeo' | 'native' | 'other';
  thumbnail?: string;
  title?: string;
  embedCode?: string;
  category?: 'testimonial' | 'tour' | 'demo' | 'about' | 'other';
}

/**
 * Extract YouTube videos
 */
export async function extractYouTubeVideos(page: Page): Promise<VideoContent[]> {
  const videos = await page.evaluate(() => {
    const iframes = Array.from(document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]'));
    
    return iframes.map(iframe => {
      const src = (iframe as HTMLIFrameElement).src;
      
      // Extract video ID
      const match = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      const videoId = match?.[1];
      
      if (!videoId) return null;
      
      return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        platform: 'youtube' as const,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedCode: src,
      };
    }).filter((v): v is { url: string; platform: 'youtube'; thumbnail: string; embedCode: string } => v !== null);
  });
  
  return videos;
}

/**
 * Extract Vimeo videos
 */
export async function extractVimeoVideos(page: Page): Promise<VideoContent[]> {
  const videos = await page.evaluate(() => {
    const iframes = Array.from(document.querySelectorAll('iframe[src*="vimeo.com"]'));
    
    return iframes.map(iframe => {
      const src = (iframe as HTMLIFrameElement).src;
      
      // Extract video ID
      const match = src.match(/vimeo\.com\/video\/(\d+)/);
      const videoId = match?.[1];
      
      if (!videoId) return null;
      
      return {
        url: `https://vimeo.com/${videoId}`,
        platform: 'vimeo' as const,
        embedCode: src,
      };
    }).filter((v): v is { url: string; platform: 'vimeo'; embedCode: string } => v !== null);
  });
  
  return videos;
}

/**
 * Extract native HTML5 videos
 */
export async function extractNativeVideos(page: Page): Promise<VideoContent[]> {
  const videos = await page.evaluate(() => {
    const videoElements = Array.from(document.querySelectorAll('video'));
    const results = [];
    
    for (const video of videoElements) {
      const source = video.querySelector('source');
      const src = video.src || source?.src;
      
      if (!src) continue;
      
      results.push({
        url: src,
        platform: 'native' as const,
        thumbnail: video.poster || undefined,
      });
    }
    
    return results;
  });
  
  return videos;
}

/**
 * Categorize video based on context
 */
async function categorizeVideo(page: Page, videoIdentifier: string): Promise<VideoContent['category']> {
  const context = await page.evaluate(
    (identifier) => {
      // Find iframe or video by src
      const el = document.querySelector(`iframe[src*="${identifier}"], video[src*="${identifier}"]`);
      
      if (!el) return '';
      
      // Get surrounding text
      let container: Element | null = el;
      while (container && container.parentElement) {
        container = container.parentElement;
        const heading = container.querySelector('h1, h2, h3')?.textContent?.toLowerCase() || '';
        const paragraph = container.querySelector('p')?.textContent?.toLowerCase() || '';
        
        return heading + ' ' + paragraph;
      }
      return '';
    },
    videoIdentifier
  ).catch(() => '');
  
  if (/testimonial|review|client|customer/i.test(context)) return 'testimonial';
  if (/tour|visit|location|facility/i.test(context)) return 'tour';
  if (/demo|how|tutorial|guide/i.test(context)) return 'demo';
  if (/about|story|mission|who we are/i.test(context)) return 'about';
  
  return 'other';
}

/**
 * Main video extraction
 */
export async function extractVideos(page: Page): Promise<VideoContent[]> {
  console.log('🎥 Extracting video content...');
  
  const [youtubeVideos, vimeoVideos, nativeVideos] = await Promise.all([
    extractYouTubeVideos(page).catch(() => []),
    extractVimeoVideos(page).catch(() => []),
    extractNativeVideos(page).catch(() => []),
  ]);
  
  const allVideos = [...youtubeVideos, ...vimeoVideos, ...nativeVideos];
  
  // Categorize videos
  for (const video of allVideos) {
    // Use a unique identifier from URL for categorization
    const identifier = video.url.split('/').pop()?.split('?')[0] || '';
    video.category = await categorizeVideo(page, identifier);
  }
  
  console.log(`✅ Extracted ${allVideos.length} videos:`, {
    youtube: youtubeVideos.length,
    vimeo: vimeoVideos.length,
    native: nativeVideos.length,
  });
  
  return allVideos;
}
