// lib/image-quality-scorer.ts

export interface ImageScore {
  url: string;
  score: number; // 0-100
  dimensions?: { width: number; height: number };
  fileSize?: number;
  aspectRatio?: number;
  qualityFlags: {
    isThumbnail: boolean;
    isIcon: boolean;
    isLogo: boolean;
    isDecorative: boolean;
    isHeroWorthy: boolean;
    isGalleryWorthy: boolean;
  };
}

/**
 * Score image based on URL heuristics and context
 * (Simplified version without image download/analysis)
 */
export function scoreImageByUrl(
  url: string,
  alt?: string,
  width?: number,
  height?: number
): ImageScore {
  let score = 50; // Base score
  
  const urlLower = url.toLowerCase();
  const altLower = (alt || '').toLowerCase();
  
  // URL-based scoring
  if (urlLower.includes('hero') || urlLower.includes('banner')) {
    score += 30;
  } else if (urlLower.includes('gallery') || urlLower.includes('portfolio')) {
    score += 20;
  } else if (urlLower.includes('thumb') || urlLower.includes('icon')) {
    score -= 30;
  } else if (urlLower.includes('logo')) {
    score -= 25;
  } else if (urlLower.includes('avatar') || urlLower.includes('profile')) {
    score -= 20;
  }
  
  // Check for common indicators of low quality
  if (urlLower.includes('150x150') || urlLower.includes('200x200')) {
    score -= 20;
  }
  
  // Check for high-res indicators
  if (urlLower.includes('1920') || urlLower.includes('1080') || urlLower.includes('2k') || urlLower.includes('4k')) {
    score += 20;
  }
  
  // Dimension-based scoring (if available)
  let aspectRatio: number | undefined;
  if (width && height && width > 0 && height > 0) {
    aspectRatio = width / height;
    const totalPixels = width * height;
    
    // Resolution scoring
    if (totalPixels >= 1920 * 1080) score += 25; // Full HD or higher
    else if (totalPixels >= 1280 * 720) score += 15; // HD
    else if (totalPixels >= 800 * 600) score += 10; // SD
    else if (totalPixels < 400 * 300) score -= 20; // Too small
    
    // Aspect ratio scoring (prefer landscape for hero)
    if (aspectRatio >= 1.5 && aspectRatio <= 2.5) score += 15; // Good landscape
    else if (aspectRatio >= 1.0 && aspectRatio <= 1.5) score += 10; // Square-ish
    else if (aspectRatio >= 0.7 && aspectRatio <= 1.0) score += 5; // Portrait
  }
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));
  
  // Determine quality flags
  const isThumbnail = (width && width < 300) || urlLower.includes('thumb') || urlLower.includes('small');
  const isIcon = (width && width < 100) || urlLower.includes('icon');
  const isLogo = urlLower.includes('logo');
  const isDecorative = (width && width < 200) || urlLower.includes('decorator') || urlLower.includes('ornament');
  const isHeroWorthy = score >= 70 && !isThumbnail && !isIcon && !isLogo;
  const isGalleryWorthy = score >= 50 && !isIcon && !isLogo && !isDecorative;
  
  return {
    url,
    score,
    dimensions: width && height ? { width, height } : undefined,
    aspectRatio,
    qualityFlags: {
      isThumbnail,
      isIcon,
      isLogo,
      isDecorative,
      isHeroWorthy,
      isGalleryWorthy,
    },
  };
}

/**
 * Score multiple images and return sorted by score
 */
export function scoreImages(
  images: Array<{ url: string; alt?: string; width?: number; height?: number }>
): ImageScore[] {
  return images
    .map(img => scoreImageByUrl(img.url, img.alt, img.width, img.height))
    .sort((a, b) => b.score - a.score);
}

/**
 * Filter images for hero section (top scoring, hero-worthy images)
 */
export function selectHeroImages(
  images: Array<{ url: string; alt?: string; width?: number; height?: number }>,
  count: number = 5
): string[] {
  const scored = scoreImages(images);
  return scored
    .filter(img => img.qualityFlags.isHeroWorthy)
    .slice(0, count)
    .map(img => img.url);
}

/**
 * Filter images for gallery section
 */
export function selectGalleryImages(
  images: Array<{ url: string; alt?: string; width?: number; height?: number }>,
  minCount: number = 12
): string[] {
  const scored = scoreImages(images);
  const galleryWorthy = scored.filter(img => img.qualityFlags.isGalleryWorthy);
  
  // If we don't have enough gallery-worthy images, lower the threshold
  if (galleryWorthy.length < minCount) {
    return scored
      .filter(img => !img.qualityFlags.isIcon && !img.qualityFlags.isLogo)
      .slice(0, minCount)
      .map(img => img.url);
  }
  
  return galleryWorthy.map(img => img.url);
}

/**
 * Simple image analysis for scraped images
 */
export function analyzeImageSet(images: ImageScore[]): {
  totalImages: number;
  heroWorthyCount: number;
  galleryWorthyCount: number;
  lowQualityCount: number;
  averageScore: number;
  recommendations: string[];
} {
  const heroWorthyCount = images.filter(img => img.qualityFlags.isHeroWorthy).length;
  const galleryWorthyCount = images.filter(img => img.qualityFlags.isGalleryWorthy).length;
  const lowQualityCount = images.filter(img => img.score < 30).length;
  const averageScore = images.length > 0 
    ? Math.round(images.reduce((sum, img) => sum + img.score, 0) / images.length)
    : 0;
  
  const recommendations: string[] = [];
  
  if (heroWorthyCount === 0) {
    recommendations.push('⚠️ No hero-worthy images found. Consider using stock images or manual upload.');
  } else if (heroWorthyCount < 3) {
    recommendations.push('⚠️ Limited hero image options. May need fallback images.');
  }
  
  if (galleryWorthyCount < 12) {
    recommendations.push(`⚠️ Only ${galleryWorthyCount} gallery-worthy images found. Gallery may appear sparse.`);
  }
  
  if (lowQualityCount > images.length * 0.3) {
    recommendations.push(`⚠️ ${lowQualityCount} low-quality images detected (${Math.round(lowQualityCount / images.length * 100)}% of total).`);
  }
  
  if (averageScore < 50) {
    recommendations.push('⚠️ Overall image quality is below average. Consider re-scraping with better source.');
  }
  
  return {
    totalImages: images.length,
    heroWorthyCount,
    galleryWorthyCount,
    lowQualityCount,
    averageScore,
    recommendations,
  };
}
