/**
 * Closed-set industry → archetype mapping.
 *
 * Every label the lead scraper produces maps to exactly ONE design archetype.
 * When the form/Excel industry is present, this map is the source of truth —
 * keyword guessing is skipped entirely.
 *
 * Archetype ids live in prompt-builder.ts (INDUSTRY_ARCHETYPES).
 */

const INDUSTRY_TO_ARCHETYPE: Record<string, string> = {
  // Medical & health
  'Pharmacies': 'medical',
  'Medical Practices': 'medical',
  'Dental Clinics': 'medical',
  'Optometrists': 'medical',
  'Veterinary Clinics': 'medical',
  'Chiropractors': 'medical',
  'Orthodontic Practices': 'medical',

  // Legal / finance / professional
  'Law Firms': 'legal',
  'Accounting Firms': 'finance',
  'Financial Services': 'finance',
  'Insurance Agencies': 'finance',
  'Tax Preparation Services': 'finance',

  // Real estate
  'Real Estate Agencies': 'realestate',
  'Real Estate Firms': 'realestate',
  'Property Management': 'realestate',
  'Property Development': 'realestate',

  // Automotive
  'Auto Repair Shops': 'automotive',
  'Car Dealerships': 'automotive',
  'Tire Shops': 'automotive',
  'Automotive Component Manufacturing': 'automotive',
  'Truck Body Builders & Heavy Vehicle Repair': 'automotive',

  // Construction & trades
  'Construction Companies': 'trades',
  'Plumbing Companies': 'trades',
  'Electrical Contractors': 'trades',
  'Landscaping Services': 'trades',
  'Civil Engineering Contractors': 'trades',
  'Earthmoving & Plant Hire': 'trades',
  'Ready-Mix Concrete Suppliers': 'trades',
  'Scaffolding & Formwork Suppliers': 'trades',
  'Renewable Energy & Solar Contractors': 'trades',
  'Commercial HVAC & Climate Control': 'trades',
  'Architecture Firms': 'trades',
  'Engineering Firms': 'trades',
  'Interior Design Firms': 'trades',

  // Industrial / manufacturing
  'Manufacturing': 'trades',
  'Heavy Manufacturing & Production': 'trades',
  'Metal Fabrication & Engineering': 'trades',
  'Plastic & Polymer Manufacturing': 'trades',
  'Chemical & Industrial Gas Production': 'trades',
  'Textile & Garment Factories': 'trades',
  'Pulp & Paper Mills': 'trades',
  'Packaging & Container Manufacturing': 'trades',
  'Food & Beverage Processing Plants': 'trades',
  'FMCG Manufacturing': 'trades',
  'Glass & Ceramic Manufacturing': 'trades',
  'Industrial Automation & Robotics': 'trades',
  'Waste Management & Recycling Services': 'trades',
  'Industrial Cleaning & Hygiene': 'trades',
  'Cold Storage & Refrigeration Logistics': 'trades',
  'Material Handling & Forklift Suppliers': 'trades',
  'Non-Destructive Testing (NDT) Services': 'trades',
  'Industrial Pump & Valve Suppliers': 'trades',
  'Telecommunications Infrastructure': 'trades',
  'Mining Equipment & Supply': 'trades',
  'Safety Equipment & PPE Suppliers': 'trades',
  'Scientific Laboratory & Testing Services': 'trades',
  'Calibration & Measurement Services': 'trades',
  'Agricultural Equipment & Machinery': 'trades',
  'Agricultural Farms and Suppliers': 'trades',
  'Fertilizer & Pesticide Distributors': 'trades',
  'Irrigation System Specialists': 'trades',
  'Animal Feed & Nutrition Manufacturers': 'trades',
  'Grain Handling & Silo Services': 'trades',
  'Abattoirs & Meat Wholesale': 'trades',

  // Logistics
  'Logistics and Transportation': 'general',
  'Freight Companies': 'general',
  'Warehousing & 3PL Logistics': 'general',
  'Courier & Distribution Hubs': 'general',
  'Freight Forwarding & Customs Clearing': 'general',
  'Shipping & Maritime Services': 'general',

  // Food & hospitality
  'Restaurants and Cafes': 'restaurant',
  'Catering Companies': 'restaurant',
  'Hotels': 'hospitality',
  'Travel Agencies': 'hospitality',

  // Retail
  'Supermarkets': 'retail',
  'Clothing Stores': 'retail',
  'Electronics Retail Stores': 'retail',
  'Wholesale Distributors': 'retail',
  'Printing and Copy Shops': 'retail',

  // Beauty & fitness
  'Hair Salons and Barbershops': 'beauty',
  'Fitness Centers': 'beauty',

  // Education
  'Educational Institutions': 'education',

  // Security
  'Security Services': 'security',

  // Creative / marketing
  'Advertising Agencies': 'photography',
  'Marketing Firms': 'photography',

  // Community / general
  'Funeral Parlours': 'general',
}

function normalizeIndustryKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ')
}

const NORMALIZED_LOOKUP: Record<string, string> = Object.fromEntries(
  Object.entries(INDUSTRY_TO_ARCHETYPE).map(([k, v]) => [normalizeIndustryKey(k), v])
)

/**
 * Resolve a scraper/form industry label to an archetype id.
 * Returns null when the label is blank or not in the closed list
 * (caller may then fall back to keyword detection).
 */
export function resolveArchetypeFromIndustry(industry: string | null | undefined): string | null {
  if (!industry) return null
  const key = normalizeIndustryKey(industry)
  if (NORMALIZED_LOOKUP[key]) return NORMALIZED_LOOKUP[key]

  // Tolerate trailing descriptors: "Ready-Mix Concrete Suppliers (Natal)" etc.
  for (const [label, archetype] of Object.entries(INDUSTRY_TO_ARCHETYPE)) {
    const n = normalizeIndustryKey(label)
    if (key.startsWith(n) || n.startsWith(key)) return archetype
  }
  return null
}

export function getIndustryLabelToArchetypeMap(): Record<string, string> {
  return { ...INDUSTRY_TO_ARCHETYPE }
}
