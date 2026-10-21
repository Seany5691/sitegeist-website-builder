/**
 * Service Enhancement Helpers for Prompt Builder
 * Implements GAP 29: Complete Service Data Structure
 */

import { IndustryArchetype } from '@/types/site-config';

export interface EnhancedService {
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  imageAlt: string;
  ctaText: string;
  ctaLink: string;
  features?: string[];
  pricing?: string;
}

/**
 * Map service names to appropriate Lucide icons
 */
export function mapServiceToIcon(serviceTitle: string, archetypeId: string): string {
  const serviceLower = serviceTitle.toLowerCase();
  
  // Security services
  if (/armed|response|security|patrol/i.test(serviceLower)) return 'Shield';
  if (/drone|surveillance|aerial|cctv/i.test(serviceLower)) return 'Camera';
  if (/guard|static|officer/i.test(serviceLower)) return 'UserCheck';
  if (/business|corporate|commercial/i.test(serviceLower)) return 'Building2';
  if (/residential|home/i.test(serviceLower)) return 'Home';
  
  // Photography services
  if (/wedding/i.test(serviceLower)) return 'Heart';
  if (/portrait|headshot/i.test(serviceLower)) return 'User';
  if (/family/i.test(serviceLower)) return 'Users';
  if (/newborn|baby/i.test(serviceLower)) return 'Baby';
  if (/maternity|pregnancy/i.test(serviceLower)) return 'Heart';
  if (/event/i.test(serviceLower)) return 'Calendar';
  if (/product/i.test(serviceLower)) return 'Package';
  
  // Restaurant/Food services
  if (/menu|dish|food/i.test(serviceLower)) return 'UtensilsCrossed';
  if (/drink|beverage|cocktail/i.test(serviceLower)) return 'Wine';
  if (/catering|event/i.test(serviceLower)) return 'ChefHat';
  if (/delivery|takeaway/i.test(serviceLower)) return 'Truck';
  if (/reservation|booking/i.test(serviceLower)) return 'CalendarCheck';
  
  // Medical services
  if (/general|consultation/i.test(serviceLower)) return 'Stethoscope';
  if (/dental/i.test(serviceLower)) return 'Smile';
  if (/physio|therapy/i.test(serviceLower)) return 'Activity';
  if (/vaccine|injection/i.test(serviceLower)) return 'Syringe';
  if (/emergency/i.test(serviceLower)) return 'Ambulance';
  
  // Spa/Beauty services
  if (/massage|therapy/i.test(serviceLower)) return 'Hand';
  if (/facial|skin/i.test(serviceLower)) return 'Sparkles';
  if (/nail|manicure|pedicure/i.test(serviceLower)) return 'Sparkles';
  if (/hair|salon/i.test(serviceLower)) return 'Scissors';
  if (/wax/i.test(serviceLower)) return 'Flame';
  
  // Construction/Trades
  if (/plumb/i.test(serviceLower)) return 'Wrench';
  if (/electric/i.test(serviceLower)) return 'Zap';
  if (/paint/i.test(serviceLower)) return 'Paintbrush';
  if (/roof/i.test(serviceLower)) return 'Home';
  if (/hvac|air/i.test(serviceLower)) return 'Wind';
  if (/flooring/i.test(serviceLower)) return 'Layers';
  
  // Automotive
  if (/repair|service/i.test(serviceLower)) return 'Wrench';
  if (/tyre|tire|wheel/i.test(serviceLower)) return 'CircleDot';
  if (/brake/i.test(serviceLower)) return 'AlertCircle';
  if (/engine/i.test(serviceLower)) return 'Settings';
  
  // Legal
  if (/divorce|family/i.test(serviceLower)) return 'Users';
  if (/criminal|defence/i.test(serviceLower)) return 'Shield';
  if (/property|conveyancing/i.test(serviceLower)) return 'Home';
  if (/contract|commercial/i.test(serviceLower)) return 'FileText';
  
  // Real Estate
  if (/residential|home/i.test(serviceLower)) return 'Home';
  if (/commercial|office/i.test(serviceLower)) return 'Building2';
  if (/rent|rental|lease/i.test(serviceLower)) return 'Key';
  if (/valuation|appraisal/i.test(serviceLower)) return 'TrendingUp';
  
  // Education
  if (/tutor/i.test(serviceLower)) return 'BookOpen';
  if (/course|program/i.test(serviceLower)) return 'GraduationCap';
  if (/exam|test/i.test(serviceLower)) return 'FileCheck';
  
  // Fitness
  if (/personal|training/i.test(serviceLower)) return 'Dumbbell';
  if (/yoga|pilates/i.test(serviceLower)) return 'Heart';
  if (/spin|cycling/i.test(serviceLower)) return 'Bike';
  if (/nutrition|diet/i.test(serviceLower)) return 'Apple';
  
  // Default by archetype
  const archetypeDefaults: Record<string, string> = {
    'photography': 'Camera',
    'restaurant': 'UtensilsCrossed',
    'bakery': 'Cake',
    'medical': 'Heart',
    'beauty': 'Sparkles',
    'security': 'Shield',
    'trades': 'Hammer',
    'automotive': 'Car',
    'legal': 'Scale',
    'finance': 'Calculator',
    'realestate': 'Home',
    'education': 'GraduationCap',
    'fitness': 'Dumbbell',
    'hospitality': 'BedDouble',
    'retail': 'ShoppingBag',
    'saas': 'Laptop',
    'nonprofit': 'HandHeart',
  };
  
  return archetypeDefaults[archetypeId] || 'CheckCircle';
}

/**
 * Generate service-specific CTA text based on service and archetype
 */
export function generateServiceCTA(serviceTitle: string, archetypeId: string): string {
  const serviceLower = serviceTitle.toLowerCase();
  
  // Action-specific CTAs
  if (/consultation|assessment|evaluation/i.test(serviceLower)) return 'Book a Consultation';
  if (/quote|estimate/i.test(serviceLower)) return 'Get a Free Quote';
  if (/session|appointment/i.test(serviceLower)) return 'Book Your Session';
  if (/package|pricing/i.test(serviceLower)) return 'View Packages';
  if (/emergency|urgent|immediate/i.test(serviceLower)) return 'Call Now';
  if (/reservation|booking/i.test(serviceLower)) return 'Reserve Now';
  
  // Archetype-specific defaults
  const archetypeDefaults: Record<string, string> = {
    'photography': 'Book Your Session',
    'restaurant': 'Reserve a Table',
    'bakery': 'Order Now',
    'medical': 'Book Appointment',
    'beauty': 'Book Treatment',
    'security': 'Get a Quote',
    'trades': 'Request Service',
    'automotive': 'Schedule Service',
    'legal': 'Schedule Consultation',
    'finance': 'Request Proposal',
    'realestate': 'Schedule Viewing',
    'education': 'Enroll Now',
    'fitness': 'Start Your Journey',
    'hospitality': 'Book Now',
    'retail': 'Shop Now',
    'saas': 'Start Free Trial',
    'nonprofit': 'Get Involved',
  };
  
  return archetypeDefaults[archetypeId] || 'Learn More';
}

/**
 * Select stock image for service if no real image available
 */
export function selectStockImageForService(serviceTitle: string, archetypeId: string): string {
  const serviceLower = serviceTitle.toLowerCase();
  
  // Photography services
  if (/wedding/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80';
  if (/family/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80';
  if (/newborn|baby/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80';
  if (/maternity/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1493101561740-e745892775b2?w=800&q=80';
  if (/portrait/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
  
  // Security services
  if (/armed|response/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1598661045893-0cc9f7afbf79?w=800&q=80';
  if (/drone|surveillance/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80';
  if (/guard/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
  
  // Restaurant/Food
  if (/menu|dish/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
  if (/catering/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80';
  if (/drink|cocktail/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80';
  
  // Medical
  if (/consultation|doctor/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80';
  if (/dental/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80';
  if (/physio/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
  
  // Beauty/Spa
  if (/massage/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80';
  if (/facial|skin/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80';
  if (/hair/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80';
  if (/nail/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80';
  
  // Construction/Trades
  if (/plumb/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80';
  if (/electric/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
  if (/paint/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80';
  if (/roof/i.test(serviceLower)) return 'https://images.unsplash.com/photo-1632394315699-e0ca30e33b7e?w=800&q=80';
  
  // Archetype-specific defaults
  const archetypeDefaults: Record<string, string> = {
    'photography': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'bakery': 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80',
    'medical': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    'beauty': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
    'security': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    'trades': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    'legal': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    'realestate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'education': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'hospitality': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    'saas': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'nonprofit': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
  };
  
  return archetypeDefaults[archetypeId] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
}

/**
 * Build complete service instructions for prompt
 */
export function buildServiceInstructions(
  services: Array<{ title: string; description: string; priceTag?: string; price?: string; features?: string[] }>,
  archetype: IndustryArchetype
): string {
  const lines: string[] = [];
  
  lines.push('==================================================');
  lines.push('6. SERVICES SECTION (FULL STRUCTURE)');
  lines.push('==================================================');
  lines.push('');
  lines.push('Use this EXACT data for the Services component. Each service card MUST include ALL fields below.');
  lines.push('');

  services.forEach((service, index) => {
    const icon = mapServiceToIcon(service.title, archetype.id);
    const imageUrl = selectStockImageForService(service.title, archetype.id);
    const ctaText = generateServiceCTA(service.title, archetype.id);
    const pricing = service.priceTag || service.price || 'Get a Custom Quote';

    lines.push(`${index + 1}. ${service.title}`);
    lines.push(`   - Description: ${service.description}`);
    lines.push(`   - Icon: ${icon} (import { ${icon} } from 'lucide-react')`);
    lines.push(`   - Image: ${imageUrl}`);
    lines.push(`   - Image Alt: "${service.title} service offered by the business"`);
    lines.push(`   - CTA: "${ctaText}"`);
    lines.push(`   - CTA Link: #contact?service=${encodeURIComponent(service.title)}`);
    
    if (service.features && service.features.length > 0) {
      lines.push(`   - Features:`);
      service.features.forEach(feature => {
        lines.push(`     * ${feature}`);
      });
    }
    
    lines.push(`   - Pricing: "${pricing}"`);
    lines.push('');
  });

  lines.push('IMPLEMENTATION RULES:');
  lines.push('- Each service card MUST display: icon, title, description, image (optional), CTA button');
  lines.push('- Layout: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)');
  lines.push('- Card hover effect: group hover:-translate-y-1 hover:shadow-xl transition-all duration-300');
  lines.push('- Icon: Display above title, colored with brand primary, size-12');
  lines.push('- Image: If included, aspect ratio 16/9, use <img> tag with object-cover');
  lines.push('- CTA button: Full-width, bg-primary text-white rounded-lg px-6 py-3 hover:bg-primary/90');
  lines.push('- Features list: If present, display as bullet points with checkmark icons');
  lines.push('- Price: Display prominently below description, bold text, primary color');
  lines.push('- Responsive: Single column on mobile, 2 columns on tablet, 3 columns on desktop');
  lines.push('');
  lines.push('CARD STRUCTURE:');
  lines.push('<div class="group p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">');
  lines.push('  <Icon class="w-12 h-12 text-primary mb-4" />');
  lines.push('  <h3 class="text-2xl font-bold mb-3">{title}</h3>');
  lines.push('  <p class="text-muted mb-4">{description}</p>');
  lines.push('  {features && <ul class="mb-4 space-y-2">{features.map(f => <li><Check /> {f}</li>)}</ul>}');
  lines.push('  {pricing && <p class="text-lg font-bold text-primary mb-4">{pricing}</p>}');
  lines.push('  <a href={ctaLink} class="block w-full text-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition">{ctaText}</a>');
  lines.push('</div>');
  lines.push('');

  return lines.join('\n');
}
