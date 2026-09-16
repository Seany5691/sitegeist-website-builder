Act as a Principal Frontend Engineer and Lead UI/UX Architect. Build a custom, production-ready Next.js 14 (App Router) web application for "Klerksdorp Engineering" from scratch using Tailwind CSS, Lucide React, and Framer Motion.

==================================================
1. AUTOMATED BRAND & DESIGN SYSTEM SPECIFICATIONS
==================================================

- Archetype: Visual Portfolio / Specialized Showcase (Auto-Detected)
- Layout Philosophy: Image-first editorial presentation with balanced whitespace.
- Color Palette: Rich Dark Charcoal (#121212) or Soft Neutral (#F5F5F0) with contrast accent.
- Typography: Playfair Display (Serif Headings) + Inter (Sans Body).
- Image Presentation: Clean responsive masonry grid with hover micro-interactions.
- Extracted Primary Color: #453e07
- Extracted Secondary Color: #c6352c
- Extracted Accent Color: #ccc847
- Extracted Background: #fafafa

==================================================
2. MEDIA & DEPLOYMENT PIPELINE
==================================================

- BUILD MODE: DEMO / TRIAL PREVIEW
- IMAGE LOADING INSTRUCTION: All image paths and page media mappings are structured in the JSON file 'public/assets/clients/klerksdorp-engineering/JSON/image-map.json'. Refer to this file to load all category assets and gallery routes directly from their remote URLs. Configure 'next.config.mjs' with required 'remotePatterns'. DO NOT attempt to load missing local image files.

==================================================
3. NAVIGATION & STRUCTURAL PARITY
==================================================
- Preserve the client's original site structure and page links while modernizing the layout and user experience:
- https://www.klerksdorpengineering.co.za/
- https://www.klerksdorpengineering.co.za/services-products/
- https://www.klerksdorpengineering.co.za/klerksdorp-exhausts/
- https://www.klerksdorpengineering.co.za/contact-us/
- Build explicit App Router pages for distinct sub-brands/custom routes (generate app/[slug]/page.tsx routes with dedicated content grids):
  * Route: /services-products (Create dedicated layout and content)
  * Route: /klerksdorp-exhausts (Create dedicated layout and content)
- Create an intuitive header navigation with desktop hover dropdowns/flyouts or interactive tabbed category filters.
- Ensure all category routes render dynamic galleries filtered directly from 'data/gallery-data.json'.

==================================================
4. CONVERSION & SEO ARCHITECTURE
==================================================
- Inject valid LocalBusiness JSON-LD schema into 'app/layout.tsx'.
- Primary Contact Phone / WhatsApp: 27180112453 (normalized for WhatsApp https://wa.me/27180112453) / 27180112453
- Direct Email: gideon@klerksdorpengineering.co.za
- Include a sticky floating WhatsApp button and an interactive inquiry form that redirects to WhatsApp.
- Analytics: Add placeholder Google Analytics GA4 script wrapper in app/layout.tsx configured for env variable process.env.NEXT_PUBLIC_GA_ID.

==================================================
5. CODE EXECUTION REQUIREMENTS
==================================================
- Write clean, modular, fully-typed TypeScript (.tsx) for every file.
- Generate complete files without skipping code or using comments like "// rest of the code here".
- Test component interactions with Framer Motion scroll and hover effects.

Execute the build generation now.