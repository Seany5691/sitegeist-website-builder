# Design System — Tammy Holliday Photography

## Design Seed: lmakad


DESIGN SEED: lmakad (Unique Visual Fingerprint)

LAYOUT STYLE: PLAYFUL
Fun, energetic design with rounded shapes, bright colors, and engaging interactions.

GRID DENSITY: masonry
Pinterest-style layout with varying heights. Perfect for diverse image collections.

HEADER STYLE: split
Header split into two sections - logo on left, nav on right with distinct backgrounds.

CARD GEOMETRY: rounded
Cards with 12-16px border radius. Friendly and modern.

ANIMATION EASING: bouncy
spring(1, 80, 10) with 500ms duration. Fun and playful.

SPACING SCALE: comfortable
Sections: 64-96px padding. Elements: 16-24px gaps. Standard spacing.

IMAGE ASPECT RATIO: square
1:1 aspect ratio for all images. Clean grid alignment.

COLOR INTENSITY: pastel
Low saturation, high lightness colors. Soft and approachable.

DENSITY PROFILE: dense
Tight spacing (48-64px padding), compact gaps. Information-rich layout. Great for catalogs, portfolios, and data-heavy sites.

DECORATIVE INTENSITY: expressive
Bold decorative elements. Strong gradient overlays, visible grain/noise textures, decorative shapes, floating elements, glassmorphism cards. Eye-catching and memorable.

TYPOGRAPHY PAIRING: modern-sans
Heading: Plus Jakarta Sans (geometric). Body: Inter. Clean, contemporary. Universal appeal for most industries.

MOTION INTENSITY: moderate
Balanced animations: 0.4s duration, 12px distance, 0.06s stagger. Noticeable but tasteful. Good default for most sites.

STAGGER STRENGTH: medium
Medium stagger (0.08s between children). Clear cascade effect. Engaging.

ART DIRECTION: warm-organic
Friendly and approachable: balanced spacing, moderate motion, warm tones, rounded shapes, friendly typography. Inviting and personal.

SECTION ORDER: Hero → Gallery → Testimonials → FAQ → About → Team → Services → Contact → Footer


## Color Palette (Selected)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | #fbc1a1 | Buttons, CTAs, active states |
| Secondary | #f69565 | Accents, hover states |
| Accent | #f9e594 | Highlights, badges |
| Background | #FAF8F5 | Page background |
| Text | #1a1a1a | Body text |
| Muted | #6b7280 | Secondary text |

## CSS Custom Properties

```css
:root {
  --color-primary: #fbc1a1;
  --color-secondary: #f69565;
  --color-accent: #f9e594;
  --color-bg: #FAF8F5;
  --color-text: #1a1a1a;
  --color-muted: #6b7280;
  --font-heading: Cormorant Garamond, serif;
  --font-body: Montserrat, sans-serif;
}
```

## Typography

- Heading: Cormorant Garamond — Refined serif with modern sans body
- Body: Montserrat
- Weight: medium
- Spacing: normal

## Mode: Light

- Page background: #F5F8F5
- Card surfaces: bg-white with subtle shadows
- Text: Dark gray for readability
- Borders: Light gray borders for definition

## Navigation

- / (Home)
- /portfolio (Gallery)
- /services (Services)
- /about (About)
- /contact (Contact)
- Custom routes:
  * /prices
  * /rates
  * /packages
  * /packages-and-pricing
  * /pricing-packages
  * /photo-packages
  * /photography-packages
  * /session-rates
  * /session-pricing
  * /investment
  * /invest
  * /our-work
  * /images
  * /photos
  * /work
  * /projects
  * /showcase
  * /collection
  * /lookbook
  * /my-portfolio
  * /my-work
  * /my-gallery
  * /menu
  * /treatments
  * /offerings
  * /case-studies
  * /completed-projects
  * /news
  * /stories
  * /articles
  * /posts
  * /updates
  * /teesh-and-family
  * /lerato-and-elias
  * /barbara-and-family
  * /sanele-and-family
  * /jenny
  * /baby-aria
  * /7-ways-to-make-your-rainy-day-photo-shoot-work-for-you-2
  * /kle-and-jacques
  * /get-to-know-me
  * /can-you-uncontrollably-do-what-you-do
  * /amy-and-jt-modderfontein-reserve
  * /tiffany-and-gary-edenvale-photographer
  * /ice-cream-couple-shoot-greenstone
  * /horse-portraiture-crystal-ridge
  * /riaan-and-michelle-jeppe-quandom
  * /chantelle-before-pageant-photo-shoot
  * /mariska-and-albert-in-the-veld
  * /van-heerden-family-benoni-photographer
  * /merchia-and-jason-barnard-stadium
  * /clinton-and-tanya-a-parktown-wedding
  * /answers-to-questions-you-have-no-idea-how-to-ask-your-photographer
  * /pretoria-wedding-photographer-debbie-and-rudolph-intimate-wedding
  * /terenure-family-shoot-yogani-and-boys-kempton-park
  * /east-rand-portrait-photographer-styled-portrait-sessions
  * /irene-dairy-farm-matric-dance-centurion-photographer-riela
  * /modderfontein-maternity-photographer-baby-bump-photo-shoot-karen-and-ben
  * /midrand-couple-photographer-engagement-session-pona-and-mzwandile
  * /family-photography-bronkhorstspruit-photographer-nikki-and-family
  * /benoni-couple-photographer-engagement-shoot-jacques-and-laura
  * /kempton-park-family-photographer-studio-photography-ralulimi-family
  * /greenstone-family-photographer-edenvale-family-shoot-nikki-part-2
  * /west-rand-maternity-photographer-bryanston-forest-david-and-renee
  * /johannesburg-wedding-photographer-thornbirds-wedding-venue-pona-and-mzwandile
  * /matric-dance-photography-kempton-park-leander-and-velme
  * /west-rand-engagement-photography-lonehill-wendy-and-alan
  * /midrand-wedding-photography-the-forest-walk-venue-tiffany-and-gary
  * /studio-photo-shoot-east-rand-family-photography-kim-and-family
  * /smash-the-cake-shoot-east-rand-photographer-taya
  * /engagement-photography-east-rand-megan-and-duncan
  * /engagement-photography-east-rand-yolandie-en-henrico
  * /engagement-shoot-44-stanley-luis-and-kate
  * /maboneng-couple-shoot-engagement-photographer-mizhaan-and-ashley
  * /benoni-photographer-matric-dance-chante
  * /centurion-matric-photography-irene-dairy-farm-renzo-and-shani
  * /magaliesburg-wedding-askari-lodge-wendy-and-alan
  * /west-rand-photographer-delta-park-esession-lesa-jo-and-julian
  * /kempton-park-photographer-matric-portraits-shavanna
  * /family-photography-greenstone-nicolene-and-family
  * /sasolburg-engagement-session-bongani-mabaso-eco-park-caleb-and-louisa
  * /bryanston-couple-session-forest-shoot-mienki-and-roan
  * /midrand-photographer-lory-park-zoo-melissa-and-marco
  * /joburg-engagement-shoot-botanical-gardens-farah-and-zubair
  * /shereview-wedding-pretoria-wedding-photographer-megan-and-duncan
  * /gauteng-wedding-photography-our-lady-of-lebanon-carla-maria-and-wade
  * /east-rand-newborn-photography-connor
  * /johannesburg-family-photography-the-little-familys-photo-shoot-at-home
  * /3289-2
  * /newborn-photography-baby-joshua
  * /edenvale-family-photography-lucy-and-robert
  * /engagement-shoot-toadbury-hall-jenny-and-roberto
  * /johannesburg-newborn-photography-adante
  * /red-ivory-wedding-taryn-and-ryan
  * /balfour-park-photographer-car-photo-shoot-naidu-family
  * /edenvale-couple-photography-joane-and-michael
  * /studio-new-baby-session-kempton-park-photographer
  * /family-studio-photo-shoot-kempton-park-photographer
  * /trash-dress-photography-legends-mx-christine-heinrich
  * /avianto-wedding-muldersdrift-monique-jacques
  * /emmerentia-dam-family-shoot-west-rand-photographer
  * /maternity-photo-session-rozanne-riaan
  * /delta-park-preggy-shoot-veronica-stefan
  * /shalwyn-wedding-photography-simone-kyle
  * /family-photography-east-rand
  * /chantelle-pieter-zambezi-point-wedding
  * /zian-cake-smash-studio-photography
  * /jenna-colin-riverside-sun-wedding
  * /timothy-new-born-shoot-studio-photography
  * /jaidene-sudeshan-couple-shoot-rosemary-hill
  * /baby-olivia-studio-photography
  * /newtown-engagement-shoot-chantelle-mark
  * /oakfield-farm-wedding-chervonne-sabastian
  * /matric-dance-shepstone-gardens
  * /westrand-matric-dance-jade-ryan
  * /1st-birthday-cake-smash-studio-photo-shoot
  * /family-photo-shoot-waterkloof-nature-reserve
  * /modderfontein-nature-reserve-family-shoot
  * /midrand-matric-farewell-matric-dance-photography
  * /family-new-baby-lifestyle-photo-shoots
  * /baby-milk-bath-photography-johannesburg
  * /baby-rebecca-midrand-studio-shoots
  * /slaughter-family-shoot-modderfontein
  * /lisa-big-family-extended-family-sessions
  * /nkosi-unathi-neema-jabu-cake-smash-family-shoots
  * /mpho-portrait-shoot
  * /kaelos-cake-smash
  * /choosing-your-images
  * /investments-maternity-photography
  * /preparing-for-your-personal-brand-and-content-creation-photo-shoot
  * /relaxed-couple-shoot-at-home-gauteng-midrand-photographer
  * /personal-brand-and-headshot-photography-a-collection
  * /suppliers
  * /portfolios/masonary-portfolio
  * /portfolios/ajax-portfolio
  * /portfolios/filterable-portfolio
  * /portfolios/no-gap-portfolio-2
  * /portfolios/portfolio-4-column
  * /portfolios/portfolio-2-column
  * /portfolios/paginated-portfolio
  * /portfolios/portrait-gallery
  * /pages
  * /pages/about-me
  * /pages/about-us
  * /pages/our-company
  * /pages/our-services-two
  * /contact-me
  * /blog/blog-standard
  * /blog/blog-small-list
  * /my-stories
  * /blog/blog-timeline
  * /features/pagebuilder-2
  * /features/shortcode-generator
  * /portfolios/portfolio-filterable-pagination
  * /features
  * /events
  * /portfolios/portfolio-gallery
  * /scrollable-with-slideshow
  * /portfolios/portfolio-box
  * /portfolios/parallax-portfolio
  * /portfolios/thumbnail-gallery
  * /fullscreen-gallery
  * /classic-layflat-2
  * /blog/blog-photocards
  * /worktype-albums
  * /portfolios
  * /portfolios/thumbnail-wall
  * /portfolios/portfolio-wall
  * /portfolios/custom-linked-thumbnail-gallery
  * /portfolios/custom-linked-wall
  * /shop
  * /slideshow-background-pages
  * /video-backround
  * /scrollable-with-video
  * /minimal-menu
  * /albums
  * /client-gallary
  * /home-new
  * /competition-entry
  * /guest-album
  * /memory-boxes
  * /brag-albums
  * /special-albums-2

## Header Style: split

- Sticky header with backdrop-blur on scroll
- Logo on left, navigation on right
- Mobile: hamburger menu with slide-down animation
- Include phone number and WhatsApp button

## Hero Section

- Headline: "Welcome to Tammy Holliday Photography"
- Subheadline: "Quality photography services in Gauteng"
- Badge: "Trusted Local Business"
- CTA: "Book Your Session"
- Hero image: https://tammyholliday.co.za/wp-content/uploads/2015/02/aboutme-cover11.jpg

## Animation & Spacing

- Animation: Smooth fade-ins, gentle parallax, elegant hover effects, lightbox gallery
- Spacing: Spacious sections (96-128px padding), generous whitespace, editorial feel

## Trust Signals

- Featured in publications
- Award badges
- Client count
- Years of experience
- Featured venues/events
- Professional memberships

## Conversion CTAs

- Book Your Session
- View Portfolio
- Check Availability
- Request a Quote
- See Packages

## Imagery Direction

Natural light, emotional storytelling, candid moments, warm tones, shallow depth of field, lifestyle shots