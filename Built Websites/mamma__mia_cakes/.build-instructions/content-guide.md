# Content & Copywriting Guide

## Writing Style

- Direct, warm, conversational human voice
- Focus on concrete facts, not vague claims
- Include specific suburbs/towns served
- Use local references and landmarks
- Active voice, not passive
- Benefits over features
- Short, scannable paragraphs

## Banned Words & Phrases

These make every website look generic. NEVER use them:

- "delight", "delightful"
- "exceptional attention to detail"
- "unforgettable journey"
- "elevate", "elevate your"
- "tailored solutions"
- "seamless experience"
- "cutting-edge", "state-of-the-art"
- "world-class", "best-in-class"
- "innovative", "revolutionary", "game-changing"
- "passionate about"
- "committed to excellence"
- "goes above and beyond"
- "one-stop shop", "second to none"
- "dedicated team", "years of experience"
- "customer-centric", "results-driven"
- "turnkey solution", "synergy", "leverage"
- "holistic approach", "proven track record"
- "trusted partner" (show trust through testimonials instead)

## Instead, Use Specific Language

- BAD: "We're passionate about quality" → GOOD: "We bake fresh every morning at 4am"
- BAD: "Years of experience" → GOOD: "Serving Gauteng since 2012"
- BAD: "Exceptional attention to detail" → GOOD: "Every cake is hand-decorated by Lety"
- BAD: "Trusted partner" → GOOD: "Over 200 five-star Google reviews"

## Image Alt Text

- Every image MUST have descriptive alt text
- Include local context: "Custom three-tier chocolate birthday cake in Gauteng"
- Never leave alt text empty or generic

## Currency

- +27 (South Africa) → R (ZAR)
- +1 (USA) → $ (USD)
- +44 (UK) → £ (GBP)
- +61 (Australia) → A$ (AUD)

## Telephone Protocol

- Format: <a href="tel:+27834799732">083 479 9732</a>
- WhatsApp: https://wa.me/[clean_phone]?text=Hi%20[BusinessName]

## SEO Requirements

- Every page MUST have a canonical URL
- Twitter cards: summary_large_image
- OpenGraph: og:title, og:description, og:type, og:image
- Internal linking between service pages
- Descriptive anchor text (not "click here")

## Image Optimization

- Lazy loading for below-fold images
- Descriptive alt text with local context
- WebP format preferred

---

==================================================
6. SERVICES SECTION (FULL STRUCTURE)
==================================================

Use this EXACT data for the Services component. Each service card MUST include ALL fields below.

1. Celebration Cakes
   - Description: From a two-tier birthday cake for 50 guests to an elegant three-tier wedding cake, we design and bake for your special occasion. Every cake includes a free tasting consultation with Lety.
   - Icon: Cake (import { Cake } from 'lucide-react')
   - Image: https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80
   - Image Alt: "Celebration Cakes service offered by the business"
   - CTA: "Order Now"
   - CTA Link: #contact?service=Celebration%20Cakes
   - Pricing: "Get a Custom Quote"

2. Corporate Catering
   - Description: Impress your team with our continental breakfast platters, lunchtime savoury trays, and afternoon tea boxes, delivered warm to offices across North West.
   - Icon: Building2 (import { Building2 } from 'lucide-react')
   - Image: https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80
   - Image Alt: "Corporate Catering service offered by the business"
   - CTA: "Order Now"
   - CTA Link: #contact?service=Corporate%20Catering
   - Pricing: "Get a Custom Quote"

3. Daily Bakery Counter
   - Description: Walk in for our famous cheese rolls, cinnamon buns, and classic Victoria sponge. Our counter is stocked fresh from 7am until sold out.
   - Icon: Cake (import { Cake } from 'lucide-react')
   - Image: https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80
   - Image Alt: "Daily Bakery Counter service offered by the business"
   - CTA: "Order Now"
   - CTA Link: #contact?service=Daily%20Bakery%20Counter
   - Pricing: "Get a Custom Quote"

4. Custom Cake Consultation
   - Description: Sit down with us to plan your dream cake. We’ll guide you through flavours, fillings, and design sketches to bring your idea to life.
   - Icon: Stethoscope (import { Stethoscope } from 'lucide-react')
   - Image: https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80
   - Image Alt: "Custom Cake Consultation service offered by the business"
   - CTA: "Book a Consultation"
   - CTA Link: #contact?service=Custom%20Cake%20Consultation
   - Pricing: "Get a Custom Quote"

IMPLEMENTATION RULES:
- Each service card MUST display: icon, title, description, image (optional), CTA button
- Layout: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Card hover effect: group hover:-translate-y-1 hover:shadow-xl transition-all duration-300
- Icon: Display above title, colored with brand primary, size-12
- Image: If included, aspect ratio 16/9, use <img> tag with object-cover
- CTA button: Full-width, bg-primary text-white rounded-lg px-6 py-3 hover:bg-primary/90
- Features list: If present, display as bullet points with checkmark icons
- Price: Display prominently below description, bold text, primary color
- Responsive: Single column on mobile, 2 columns on tablet, 3 columns on desktop

CARD STRUCTURE:
<div class="group p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
  <Icon class="w-12 h-12 text-primary mb-4" />
  <h3 class="text-2xl font-bold mb-3">{title}</h3>
  <p class="text-muted mb-4">{description}</p>
  {features && <ul class="mb-4 space-y-2">{features.map(f => <li><Check /> {f}</li>)}</ul>}
  {pricing && <p class="text-lg font-bold text-primary mb-4">{pricing}</p>}
  <a href={ctaLink} class="block w-full text-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition">{ctaText}</a>
</div>
