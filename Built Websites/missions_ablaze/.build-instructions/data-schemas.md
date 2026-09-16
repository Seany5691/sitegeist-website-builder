# Data Schemas — Exact JSON Structure

## public/site-config.json

EVERY piece of copywriting on the website MUST be in this file.
Components read it via useSiteData() at runtime.

```json
{
  "businessName": "Missions Ablaze",
  "city": "Tongaat, KwaZulu-Natal",
  "ownerName": "Tinus Lindeque",
  "phone": "27329450185",
  "email": "ablaze@missionsablaze.org.za",
  "address": "Tongaat, KwaZulu-Natal",

  "hero": {
    "headline": "Hope Served Daily in Tongaat.",
    "subheadline": "Since 1995, Missions Ablaze has provided nutritious meals and community support from our kitchen in Tongaat, KwaZulu-Natal. Your partnership fuels this vital work.",
    "badge": "Serving Tongaat Since 1995 • Registered NPO & PBO",
    "ctaText": "Become a Monthly Partner",
    "ctaLink": "#contact",
    "heroImageUrl": "https://missionsablaze.org.za/wp-content/uploads/2025/03/IMG-20250312-WA0041.jpg",
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
  "businessName": "Missions Ablaze",
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
  "title": "Missions Ablaze | Food Aid & Community Kitchen in Tongaat, KZN",
  "description": "Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.",
  "keywords": ["Tongaat charity","food parcels KwaZulu-Natal","community kitchen Tongaat","Missions Ablaze","donate food aid KZN","NPO Tongaat","volunteer Tongaat"],
  "openGraph": {
    "title": "Missions Ablaze | Food Aid & Community Kitchen in Tongaat, KZN",
    "description": "Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.",
    "type": "website"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "Missions Ablaze | Food Aid & Community Kitchen in Tongaat, KZN",
    "description": "Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185."
  },
  "jsonLd": {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Missions Ablaze",
  "description": "Missions Ablaze, a registered NPO & PBO in Tongaat, provides daily meals and food parcels across KwaZulu-Natal. Donate or volunteer. Call 032 945 0185.",
  "telephone": "27329450185",
  "email": "ablaze@missionsablaze.org.za",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Tongaat, KwaZulu-Natal",
    "addressLocality": "Tongaat, KwaZulu-Natal",
    "addressCountry": "ZA"
  }
}
}
```

## public/llms.txt

```
# Missions Ablaze

## About
[Brief description]

## Services
[List of services]

## Location
Tongaat, KwaZulu-Natal

## Contact
Phone: 27329450185
Email: ablaze@missionsablaze.org.za
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