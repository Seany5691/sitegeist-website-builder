# Data Schemas — Exact JSON Structure

## public/site-config.json

EVERY piece of copywriting on the website MUST be in this file.
Components read it via useSiteData() at runtime.

```json
{
  "businessName": "Mamma & Mia Cakes And Catering",
  "city": "North West",
  "ownerName": "Lety Gibbon",
  "phone": "27721565654",
  "email": "",
  "address": "North West",

  "hero": {
    "headline": "Baked with Love in North West",
    "subheadline": "Custom cakes and cupcakes made fresh daily by Lety Gibbon, using family recipes and local ingredients.",
    "badge": "Serving North West Since 2012",
    "ctaText": "Order Your Custom Cake",
    "ctaLink": "#contact",
    "heroImageUrl": "",
    "heroImageAlt": "Descriptive alt text"
  },

  "about": {
    "title": "Our Story",
    "tagline": "",
    "paragraph1": "First paragraph",
    "paragraph2": "Second paragraph",
    "paragraph3": "Third paragraph",
    "imageUrl": "",
    "imageAlt": "Descriptive alt text"
  },

  "pageContent": {
    "servicesTitle": "Our Services",
    "servicesDescription": "",
    "servicesCtaTitle": "",
    "servicesCtaText": "",
    "contactTitle": "Contact Us",
    "contactDescription": "",
    "portfolioTitle": "Our Work",
    "portfolioDescription": "",
    "testimonialsTitle": "What Our Customers Say",
    "testimonialsSubtitle": "Happy Clients",
    "faqTitle": "Frequently Asked Questions",
    "faqSubtitle": "Questions & Answers",
    "galleryTitle": "Our Work",
    "gallerySubtitle": "",
    "aboutTitle": "About Us",
    "aboutSubtitle": "",
    "ctaTitle": "",
    "ctaText": "",
    "pricingTitle": "Our Pricing",
    "pricingSubtitle": ""
  },

  "services": [
    { "title": "Service Name", "description": "Service description", "priceTag": "", "icon": "Star" }
  ],
  "testimonials": [
    { "name": "Client Name", "text": "Testimonial text", "rating": 5, "source": "Google", "photoUrl": "" }
  ],
  "faq": [
    { "question": "Question?", "answer": "Answer." }
  ],
  "pricing": [
    { "service": "Service Name", "price": "R0", "details": "" }
  ],
  "team": [
    { "name": "Name", "role": "Role", "bio": "", "imageUrl": "" }
  ],
  "businessHours": [
    { "dayOfWeek": "Monday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Tuesday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Wednesday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Thursday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Friday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" },
    { "dayOfWeek": "Sunday", "opens": "Closed", "closes": "Closed" }
  ],
  "socialLinks": {
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "linkedin": ""
  },
  "logoUrl": ""
}
```

## public/image-map.json

```json
{
  "businessName": "Mamma & Mia Cakes And Catering",
  "totalImages": 0,
  "categories": {
    "Category Name": {
      "thumbnail": "https://images.unsplash.com/...",
      "images": [
        "https://images.unsplash.com/...",
        "https://images.unsplash.com/..."
      ]
    }
  }
}
```

Each category MUST include a "thumbnail" field.

## public/seo.json

```json
{
  "title": "Mamma & Mia Cakes | Custom Bakery in North West",
  "description": "Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.",
  "keywords": ["custom cakes North West","bakery North West","cupcakes Klerksdorp","wedding cakes Potchefstroom","order cakes online North West"],
  "openGraph": {
    "title": "Mamma & Mia Cakes | Custom Bakery in North West",
    "description": "Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.",
    "type": "website"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "Mamma & Mia Cakes | Custom Bakery in North West",
    "description": "Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration."
  },
  "jsonLd": {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Mamma & Mia Cakes And Catering",
  "description": "Order custom cakes & cupcakes from Mamma & Mia Cakes in North West. Fresh daily, local ingredients. Call Lety at 072 156 5654 for your celebration.",
  "telephone": "27721565654",
  "email": "",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "North West",
    "addressLocality": "North West",
    "addressCountry": "ZA"
  }
}
}
```

## public/llms.txt

```
# Mamma & Mia Cakes And Catering

## About
[Brief description]

## Services
[List of services]

## Location
North West

## Contact
Phone: 27721565654
Email: 
```

## FAQPage Schema (add to FAQ section)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text."
      }
    }
  ]
}
```