// lib/fallback-strategies.ts

import { MasterSiteConfig } from '@/types/site-config'

export interface FallbackConfig {
  useStockImages: boolean;
  generatePlaceholderTestimonials: boolean;
  generatePlaceholderServices: boolean;
  useGenericAboutText: boolean;
}

/**
 * Archetype-specific hero images for Premium Enforcer fallback system
 * High-quality Unsplash images that match industry aesthetic
 */
const ARCHETYPE_HERO_IMAGES: Record<string, string[]> = {
  'bakery': [
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920&q=80'
  ],
  'photography': [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&q=80',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80'
  ],
  'medical': [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80'
  ],
  'dental': [
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1920&q=80',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920&q=80'
  ],
  'legal': [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1920&q=80'
  ],
  'trades': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80'
  ],
  'plumbing': [
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1920&q=80',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80'
  ],
  'electrical': [
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=80'
  ],
  'hvac': [
    'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=80'
  ],
  'realestate': [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80'
  ],
  'construction': [
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80'
  ],
  'hospitality': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80'
  ],
  'restaurant': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80'
  ],
  'fitness': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80'
  ],
  'retail': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80'
  ],
  'salon': [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1920&q=80'
  ],
  'manufacturing': [
    'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80'
  ],
  'logistics': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80',
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80'
  ],
  'engineering': [
    'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80'
  ]
}

/**
 * PREMIUM ENFORCER: Ensure hero section ALWAYS has a background image
 * Called during build process before component selection
 */
export function ensureHeroImage(siteConfig: MasterSiteConfig, archetype: string): void {
  if (!siteConfig.hero.heroImageUrl || siteConfig.hero.heroImageUrl.trim() === '') {
    const images = ARCHETYPE_HERO_IMAGES[archetype] || ARCHETYPE_HERO_IMAGES['default']
    const randomIndex = Math.floor(Math.random() * images.length)
    siteConfig.hero.heroImageUrl = images[randomIndex]
    
    console.log(`[Premium Enforcer] Injected hero image for ${archetype}: ${siteConfig.hero.heroImageUrl}`)
  }
}

/**
 * Generate fallback hero image URL (Unsplash)
 */
export function getFallbackHeroImage(archetype: string, brandColors: string[]): string {
  const queries: Record<string, string> = {
    'spa-wellness': 'spa,wellness,relaxation',
    'photography': 'camera,photography,creative',
    'construction': 'construction,building,renovation',
    'restaurant': 'food,restaurant,dining',
    'fitness': 'fitness,gym,workout',
    'medical': 'medical,healthcare,clinic',
    'salon': 'salon,beauty,hair',
    'law': 'law,justice,office',
    'real-estate': 'real-estate,property,house',
    'automotive': 'car,automotive,vehicle',
    'retail': 'shopping,store,retail',
  };
  
  const query = queries[archetype] || 'business,professional,office';
  const color = brandColors[0]?.replace('#', '') || '';
  
  return `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80&fit=crop&crop=entropy&auto=format&query=${query}${color ? `&color=${color}` : ''}`;
}

/**
 * Generate fallback logo (text-based SVG)
 */
export function getFallbackLogo(businessName: string): string {
  // Generate SVG logo with business initials
  const initials = businessName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const svg = `
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="12" fill="var(--color-brand-primary)"/>
  <text 
    x="50%" 
    y="50%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    fill="white" 
    font-size="48" 
    font-weight="700"
    font-family="system-ui, -apple-system, sans-serif"
  >
    ${initials}
  </text>
</svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate placeholder testimonials
 */
export function generatePlaceholderTestimonials(archetype: string, count: number = 3): Array<{
  name: string;
  text: string;
  rating: number;
}> {
  const templates: Record<string, string[]> = {
    'spa-wellness': [
      'Amazing experience! The atmosphere is so relaxing and the staff is incredibly professional.',
      'I always leave feeling refreshed and rejuvenated. Highly recommend their services!',
      'The attention to detail and personalized care sets them apart. My go-to place for self-care.',
    ],
    'photography': [
      'Absolutely stunning photos! Captured our special day perfectly.',
      'Professional, creative, and a joy to work with. The results exceeded our expectations.',
      'An artist with the camera. Our photos tell a beautiful story.',
    ],
    'construction': [
      'Quality workmanship and excellent communication throughout the project.',
      'Transformed our space beyond our expectations. Professional and reliable.',
      'Attention to detail and commitment to excellence. Highly recommend!',
    ],
    'restaurant': [
      'Delicious food and wonderful atmosphere. A must-visit!',
      'Best dining experience in town. The attention to detail is remarkable.',
      'Fresh ingredients, creative dishes, and fantastic service.',
    ],
  };
  
  const testimonialTexts = templates[archetype] || templates['spa-wellness'];
  
  const names = [
    'Sarah M.',
    'John D.',
    'Emily R.',
    'Michael T.',
    'Jessica L.',
    'David K.',
  ];
  
  return testimonialTexts.slice(0, count).map((text, i) => ({
    name: names[i] || 'Client',
    text,
    rating: 5,
  }));
}

/**
 * Generate placeholder services
 */
export function generatePlaceholderServices(archetype: string): Array<{
  name: string;
  description: string;
}> {
  const services: Record<string, Array<{ name: string; description: string }>> = {
    'spa-wellness': [
      { name: 'Massage Therapy', description: 'Relaxing and therapeutic massage treatments tailored to your needs.' },
      { name: 'Facial Treatments', description: 'Rejuvenating facials using premium skincare products.' },
      { name: 'Body Treatments', description: 'Luxurious body wraps and scrubs for complete relaxation.' },
    ],
    'photography': [
      { name: 'Portrait Photography', description: 'Professional portrait sessions that capture your unique personality.' },
      { name: 'Event Photography', description: 'Comprehensive coverage of your special occasions and celebrations.' },
      { name: 'Commercial Photography', description: 'High-quality images for business and marketing needs.' },
    ],
    'construction': [
      { name: 'Residential Construction', description: 'Custom home building and renovation services.' },
      { name: 'Commercial Projects', description: 'Professional construction solutions for businesses.' },
      { name: 'Remodeling & Renovation', description: 'Transform your space with our expert remodeling services.' },
    ],
  };
  
  return services[archetype] || services['spa-wellness'];
}

/**
 * Generate generic about text
 */
export function generateGenericAboutText(businessName: string, archetype: string): string {
  const templates: Record<string, string> = {
    'spa-wellness': `${businessName} is dedicated to providing exceptional wellness experiences. Our team of skilled professionals is committed to helping you relax, rejuvenate, and restore balance to your life. With a focus on personalized care and attention to detail, we create a sanctuary where you can escape the stresses of everyday life.`,
    'photography': `${businessName} specializes in capturing life's most precious moments with artistry and professionalism. Our experienced photographers bring creativity and technical expertise to every session, ensuring that your memories are preserved in stunning, timeless images that you'll treasure forever.`,
    'construction': `${businessName} brings quality craftsmanship and reliable service to every project. With years of experience and a commitment to excellence, we transform your vision into reality. From concept to completion, our team ensures attention to detail, timely delivery, and outstanding results.`,
    'restaurant': `${businessName} offers an exceptional dining experience with fresh, quality ingredients and creative culinary artistry. Our passionate team is dedicated to providing memorable meals in a welcoming atmosphere, where every detail contributes to your enjoyment.`,
  };
  
  return templates[archetype] || templates['spa-wellness'];
}

/**
 * Apply fallbacks to scraped data
 */
export function applyFallbacks(
  data: any,
  archetype: string = 'professional-services',
  brandColors: string[] = ['#0ea5e9'],
  config: FallbackConfig = {
    useStockImages: true,
    generatePlaceholderTestimonials: true,
    generatePlaceholderServices: true,
    useGenericAboutText: true,
  }
): any {
  const result = { ...data };
  
  // Fallback hero image
  if (!result.heroImage && config.useStockImages) {
    result.heroImage = getFallbackHeroImage(archetype, brandColors);
    result._fallbacks = result._fallbacks || [];
    result._fallbacks.push('heroImage');
  }
  
  // Fallback logo
  if (!result.logo) {
    result.logo = getFallbackLogo(result.businessName || 'Business');
    result._fallbacks = result._fallbacks || [];
    result._fallbacks.push('logo');
  }
  
  // Fallback testimonials
  if ((!result.testimonials || result.testimonials.length < 2) && config.generatePlaceholderTestimonials) {
    result.testimonials = generatePlaceholderTestimonials(archetype, 3);
    result._fallbacks = result._fallbacks || [];
    result._fallbacks.push('testimonials');
  }
  
  // Fallback services
  if ((!result.services || result.services.length < 2) && config.generatePlaceholderServices) {
    result.services = generatePlaceholderServices(archetype);
    result._fallbacks = result._fallbacks || [];
    result._fallbacks.push('services');
  }
  
  // Fallback about text
  if (!result.about && config.useGenericAboutText) {
    result.about = generateGenericAboutText(result.businessName || 'Our Business', archetype);
    result._fallbacks = result._fallbacks || [];
    result._fallbacks.push('about');
  }
  
  // Fallback gallery images (use hero as first gallery image)
  if ((!result.galleryImages || result.galleryImages.length === 0) && result.heroImage) {
    result.galleryImages = [result.heroImage];
    result._fallbacks = result._fallbacks || [];
    result._fallbacks.push('galleryImages');
  }
  
  return result;
}
