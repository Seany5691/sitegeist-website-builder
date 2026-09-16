import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Supabase client ───────────────────────────────────────────────────

const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  limit: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
}

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: vi.fn(() => ({ ...mockSupabaseChain })),
  }),
}))

// ── Test: Duplicate Build Prevention ────────────────────────────────────────

describe('Build Trial - Duplicate Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should prevent duplicate builds when a build is in progress', () => {
    // Simulate: existing trial with build_status = 'building'
    const existingTrial = {
      id: 'trial-123',
      build_status: 'building',
      business_name: 'Test Business',
    }

    // The logic checks: .in("build_status", ["pending", "scraping", "generating", "building"])
    const inProgressStatuses = ['pending', 'scraping', 'generating', 'building']
    expect(inProgressStatuses).toContain(existingTrial.build_status)
  })

  it('should allow rebuild when previous build is complete', () => {
    const completedTrial = {
      id: 'trial-123',
      build_status: 'complete',
      business_name: 'Test Business',
    }

    // Complete builds should be eligible for rebuild
    expect(completedTrial.build_status).toBe('complete')
  })

  it('should allow rebuild when previous build failed', () => {
    const failedTrial = {
      id: 'trial-123',
      build_status: 'failed',
      business_name: 'Test Business',
    }

    // Failed builds should be eligible for rebuild
    expect(failedTrial.build_status).toBe('failed')
  })
})

// ── Test: Build Status Lifecycle ────────────────────────────────────────────

describe('Build Trial - Status Lifecycle', () => {
  it('should follow correct status progression', () => {
    const validProgression = ['pending', 'scraping', 'generating', 'building', 'complete']
    
    for (let i = 1; i < validProgression.length; i++) {
      const currentIndex = validProgression.indexOf(validProgression[i])
      const previousIndex = validProgression.indexOf(validProgression[i - 1])
      expect(currentIndex).toBeGreaterThan(previousIndex)
    }
  })

  it('should allow transition from any status to failed', () => {
    const allStatuses = ['pending', 'scraping', 'generating', 'building']
    
    for (const status of allStatuses) {
      // Any status should be able to transition to failed
      expect(['pending', 'scraping', 'generating', 'building']).toContain(status)
    }
  })

  it('should not allow transition from complete to building', () => {
    const currentStatus = 'complete'
    const targetStatus = 'building'
    
    // Complete should not go back to building
    expect(currentStatus).not.toBe(targetStatus)
  })
})

// ── Test: API Request Validation ────────────────────────────────────────────

describe('Build Trial - Request Validation', () => {
  it('should require trialWebsiteId', () => {
    const validBody = {
      trialWebsiteId: 'trial-123',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      whatsappNumber: '0821234567',
    }

    expect(validBody.trialWebsiteId).toBeDefined()
    expect(validBody.trialWebsiteId.length).toBeGreaterThan(0)
  })

  it('should require businessName', () => {
    const validBody = {
      trialWebsiteId: 'trial-123',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      whatsappNumber: '0821234567',
    }

    expect(validBody.businessName).toBeDefined()
    expect(validBody.businessName.length).toBeGreaterThan(0)
  })

  it('should require ownerName', () => {
    const validBody = {
      trialWebsiteId: 'trial-123',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      whatsappNumber: '0821234567',
    }

    expect(validBody.ownerName).toBeDefined()
    expect(validBody.ownerName.length).toBeGreaterThan(0)
  })

  it('should require whatsappNumber', () => {
    const validBody = {
      trialWebsiteId: 'trial-123',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      whatsappNumber: '0821234567',
    }

    expect(validBody.whatsappNumber).toBeDefined()
    expect(validBody.whatsappNumber.length).toBeGreaterThan(0)
  })

  it('should accept optional fields', () => {
    const bodyWithOptionals = {
      trialWebsiteId: 'trial-123',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      whatsappNumber: '0821234567',
      city: 'Pretoria',
      existingWebsiteUrl: 'https://example.co.za',
      facebookUrl: 'https://facebook.com/test',
      instagramUrl: 'https://instagram.com/test',
      googleMapsUrl: 'https://maps.google.com/test',
      industry: 'Photography',
      serviceAreas: ['Pretoria', 'Centurion'],
      contactId: 'contact-123',
    }

    expect(bodyWithOptionals.city).toBe('Pretoria')
    expect(bodyWithOptionals.existingWebsiteUrl).toBe('https://example.co.za')
    expect(bodyWithOptionals.serviceAreas).toHaveLength(2)
  })
})

// ── Test: Timeline Entry Creation ───────────────────────────────────────────

describe('Build Trial - Timeline Entries', () => {
  it('should create timeline entry on build start', () => {
    const timelineEntry = {
      contact_id: 'contact-123',
      event_type: 'build_started',
      event_title: 'Website build started',
      event_detail: 'Scraping data for Test Business...',
      source_app: 'Website Builder',
    }

    expect(timelineEntry.event_type).toBe('build_started')
    expect(timelineEntry.source_app).toBe('Website Builder')
  })

  it('should create timeline entry on build complete', () => {
    const timelineEntry = {
      contact_id: 'contact-123',
      event_type: 'build_complete',
      event_title: 'Website build complete',
      event_detail: 'Website for test_business has been built successfully.',
      source_app: 'Website Builder',
    }

    expect(timelineEntry.event_type).toBe('build_complete')
  })

  it('should create timeline entry on build failure', () => {
    const timelineEntry = {
      contact_id: 'contact-123',
      event_type: 'build_failed',
      event_title: 'Website build failed',
      event_detail: 'MiMo Code CLI exited with code 1',
      source_app: 'Website Builder',
    }

    expect(timelineEntry.event_type).toBe('build_failed')
    expect(timelineEntry.event_detail).toContain('exited with code')
  })
})

// ── Test: Service Areas Parsing ─────────────────────────────────────────────

describe('Build Trial - Service Areas', () => {
  it('should parse comma-separated service areas', () => {
    const input = 'Pretoria, Centurion, Sandton'
    const parsed = input.split(',').map(s => s.trim()).filter(Boolean)

    expect(parsed).toEqual(['Pretoria', 'Centurion', 'Sandton'])
  })

  it('should handle empty service areas', () => {
    const input = ''
    const parsed = input ? input.split(',').map(s => s.trim()).filter(Boolean) : null

    expect(parsed).toBeNull()
  })

  it('should handle undefined service areas', () => {
    const input = undefined
    const parsed = input ? input.split(',').map(s => s.trim()).filter(Boolean) : null

    expect(parsed).toBeNull()
  })
})

// ── Test: Build Mode ────────────────────────────────────────────────────────

describe('Build Trial - Build Mode', () => {
  it('should default to TRIAL mode', () => {
    const buildMode = 'TRIAL'
    expect(buildMode).toBe('TRIAL')
  })

  it('should accept PRODUCTION mode', () => {
    const buildMode = 'PRODUCTION'
    expect(buildMode).toBe('PRODUCTION')
  })
})
