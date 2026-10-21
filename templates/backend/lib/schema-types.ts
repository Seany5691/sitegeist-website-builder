/**
 * Industry → Schema.org sub-type mapping for high-precision entity recognition.
 * Falls back to LocalBusiness when the industry is unknown.
 */
const SCHEMA_TYPE_MAP: Record<string, string> = {
  // Food & hospitality
  Bakery: 'Bakery',
  Restaurant: 'Restaurant',
  Cafe: 'CafeOrCoffeeShop',
  Catering: 'FoodEstablishment',
  'Catering Service': 'FoodEstablishment',
  Bar: 'BarOrPub',
  // Trades
  Plumber: 'Plumber',
  Electrician: 'Electrician',
  HVAC: 'HVACBusiness',
  'HVAC Business': 'HVACBusiness',
  Locksmith: 'Locksmith',
  Painter: 'HousePainter',
  Roofing: 'RoofingContractor',
  Landscaping: 'HomeAndConstructionBusiness',
  Construction: 'GeneralContractor',
  Engineering: 'ProfessionalService',
  Mechanic: 'AutoRepair',
  'Auto Repair': 'AutoRepair',
  // Professional
  Lawyer: 'LegalService',
  'Law Firm': 'LegalService',
  Attorney: 'Attorney',
  Accountant: 'AccountingService',
  'Financial Advisor': 'FinancialService',
  Insurance: 'InsuranceAgency',
  RealEstate: 'RealEstateAgent',
  'Real Estate': 'RealEstateAgent',
  Architect: 'Architect',
  // Health & wellness
  Dentist: 'Dentist',
  Doctor: 'MedicalBusiness',
  Clinic: 'MedicalClinic',
  Chiropractor: 'Chiropractic',
  Physiotherapy: 'Physiotherapy',
  Salon: 'BeautySalon',
  'Hair Salon': 'HairSalon',
  Spa: 'HealthAndBeautyBusiness',
  Fitness: 'HealthClub',
  Gym: 'ExerciseGym',
  Yoga: 'ExerciseGym',
  // Retail & services
  Retail: 'Store',
  Shop: 'Store',
  Store: 'Store',
  PrintShop: 'PrintShop',
  'Print Shop': 'PrintShop',
  Photography: 'Photographer',
  Photographer: 'Photographer',
  Cleaning: 'HomeAndConstructionBusiness',
  'Cleaning Service': 'HomeAndConstructionBusiness',
  // Community
  Church: 'Church',
  NGO: 'NGO',
  Nonprofit: 'NGO',
  Charity: 'NGO',
  Missionary: 'NGO',
  School: 'School',
  Education: 'EducationalOrganization',
  // Other
  Travel: 'TravelAgency',
  Hotel: 'Hotel',
  PetCare: 'PetStore',
  Veterinary: 'VeterinaryCare',
  Automotive: 'AutomotiveBusiness',
  'Event Planning': 'EventPlanner',
  Florist: 'Florist',
}

export function resolveSchemaType(industry?: string, explicitSchemaType?: string): string {
  if (explicitSchemaType) return explicitSchemaType
  if (!industry) return 'LocalBusiness'

  const direct = SCHEMA_TYPE_MAP[industry]
  if (direct) return direct

  const normalized = industry.trim().toLowerCase()
  for (const [key, value] of Object.entries(SCHEMA_TYPE_MAP)) {
    if (key.toLowerCase() === normalized) return value
  }

  // Loose contains match e.g. "Custom Bakery & Cakes"
  for (const [key, value] of Object.entries(SCHEMA_TYPE_MAP)) {
    if (normalized.includes(key.toLowerCase())) return value
  }

  return 'LocalBusiness'
}

export { SCHEMA_TYPE_MAP }
