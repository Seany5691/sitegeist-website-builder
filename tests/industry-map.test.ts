import { resolveArchetypeFromIndustry } from '../lib/industry-map'
import { detectIndustry } from '../lib/prompt-builder'

const cases = [
  'Ready-Mix Concrete Suppliers',
  'Construction Companies',
  'Plumbing Companies',
  'Medical Practices',
  'Law Firms',
  'Security Services',
  'Restaurants and Cafes',
  'Hair Salons and Barbershops',
  'Pharmacies',
  'Civil Engineering Contractors',
  'Earthmoving & Plant Hire',
  'Manufacturing',
  '',
  'Something Unknown',
]

describe('Industry-as-truth mapping', () => {
  it('maps every closed-list label to an archetype', () => {
    for (const c of cases.slice(0, 12)) {
      const id = resolveArchetypeFromIndustry(c)
      expect(id, c).toBeTruthy()
    }
    expect(resolveArchetypeFromIndustry('Ready-Mix Concrete Suppliers')).toBe('trades')
    expect(resolveArchetypeFromIndustry('Medical Practices')).toBe('medical')
    expect(resolveArchetypeFromIndustry('Security Services')).toBe('security')
  })

  it('does NOT classify concrete as nonprofit via keyword trap', () => {
    const archetype = detectIndustry(
      'JJ Sand&Ready Mix',
      'Ready Mix Concrete Supplier Potchefstroom | JJ Sand & Ready Mix',
      '',
      [{ title: 'Ready-Mix Concrete Supply', description: 'mix designs on file for slabs, foundations, and driveways' }],
      '',
      'Ready-Mix Concrete Suppliers'
    )
    expect(archetype.id).toBe('trades')
    expect(archetype.id).not.toBe('nonprofit')
  })

  it('still detects nonprofit when strong signals are present and industry blank', () => {
    const archetype = detectIndustry(
      'Hope Community Food Bank',
      '',
      'charity nonprofit donate volunteer',
      [],
      '',
      ''
    )
    expect(archetype.id).toBe('nonprofit')
  })
})
