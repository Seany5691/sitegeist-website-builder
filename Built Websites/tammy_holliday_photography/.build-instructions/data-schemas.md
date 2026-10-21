# Data Schemas — Exact JSON Structure

## public/site-config.json

EVERY piece of copywriting on the website MUST be in this file.
Components read it via useSiteData() at runtime.

```json
{
  "businessName": "Tammy Holliday Photography",
  "city": "Gauteng",
  "ownerName": "Tammy Holliday",
  "phone": "27834799732",
  "email": "letsmeet@tammyholliday.co.za",
  "address": "2020

October 10, 2019",

  "hero": {
    "headline": "Welcome to Tammy Holliday Photography",
    "subheadline": "Quality photography services in Gauteng",
    "badge": "Trusted Local Business",
    "ctaText": "Book Your Session",
    "ctaLink": "#contact",
    "heroImageUrl": "https://tammyholliday.co.za/wp-content/uploads/2015/02/aboutme-cover11.jpg",
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
  "businessName": "Tammy Holliday Photography",
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
  "title": "Tammy Holliday Photography | Photography in Gauteng",
  "description": "Professional photography services in Gauteng. Contact Tammy Holliday Photography for quality service and exceptional results.",
  "keywords": ["Tammy Holliday Photography","Photography","Gauteng","Photography Gauteng","services"],
  "openGraph": {
    "title": "Tammy Holliday Photography | Photography in Gauteng",
    "description": "Professional photography services in Gauteng. Contact Tammy Holliday Photography for quality service and exceptional results.",
    "type": "website"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "Tammy Holliday Photography | Photography in Gauteng",
    "description": "Professional photography services in Gauteng. Contact Tammy Holliday Photography for quality service and exceptional results."
  },
  "jsonLd": {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Tammy Holliday Photography",
  "description": "Professional photography services in Gauteng. Contact Tammy Holliday Photography for quality service and exceptional results.",
  "telephone": "27834799732",
  "email": "letsmeet@tammyholliday.co.za",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2020\n\nOctober 10, 2019",
    "addressLocality": "Gauteng",
    "addressCountry": "ZA"
  }
}
}
```

## public/llms.txt

```
# Tammy Holliday Photography

## About
[Brief description]

## Services
[List of services]

## Location
Gauteng

## Contact
Phone: 27834799732
Email: letsmeet@tammyholliday.co.za
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