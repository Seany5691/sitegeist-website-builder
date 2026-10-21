'use client'

import { useState, useEffect } from 'react'
import {
  Building2, User, MapPin, Phone, Globe, Sparkles, Copy, Check,
  ImageIcon, Code, ChevronRight, ChevronDown, Layers, Palette,
  Eye, Droplet, MessageSquare, Calculator, Users, Share2, Play,
  ShoppingCart, Loader2, FolderOpen, FileJson, Search, Zap,
  PhoneCall, Mail, Map, Clock, Star, HelpCircle, PenTool,
  Film, MousePointerClick, Sun, Calendar, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MasterSiteConfig, BuildSiteResponse, FeatureFlags } from '@/types/site-config'

// ============================================
// Feature Checkbox Definitions
// ============================================
const FEATURE_GROUPS = [
  {
    name: 'Conversion & Contact',
    icon: MessageSquare,
    features: [
      { key: 'whatsappWidget' as keyof FeatureFlags, label: 'WhatsApp Floating Widget', icon: MessageSquare },
      { key: 'clickToCall' as keyof FeatureFlags, label: 'Click-to-Call Buttons', icon: PhoneCall },
      { key: 'contactForm' as keyof FeatureFlags, label: 'Contact Form', icon: Mail },
      { key: 'googleMaps' as keyof FeatureFlags, label: 'Google Maps Embed', icon: Map },
      { key: 'businessHours' as keyof FeatureFlags, label: 'Business Hours Display', icon: Clock },
    ],
  },
  {
    name: 'Content Sections',
    icon: Layers,
    features: [
      { key: 'testimonials' as keyof FeatureFlags, label: 'Testimonials / Reviews', icon: Star },
      { key: 'faq' as keyof FeatureFlags, label: 'FAQ Accordion', icon: HelpCircle },
      { key: 'teamProfiles' as keyof FeatureFlags, label: 'Team Profiles', icon: Users },
      { key: 'pricingTables' as keyof FeatureFlags, label: 'Pricing Tables', icon: Calculator },
      { key: 'beforeAfterSlider' as keyof FeatureFlags, label: 'Before/After Slider', icon: Eye },
    ],
  },
  {
    name: 'Social & Marketing',
    icon: Share2,
    features: [
      { key: 'socialMediaLinks' as keyof FeatureFlags, label: 'Social Media Links', icon: Share2 },
      { key: 'newsletterSignup' as keyof FeatureFlags, label: 'Newsletter Signup', icon: Mail },
      { key: 'googleAnalytics' as keyof FeatureFlags, label: 'Google Analytics GA4', icon: Search },
      { key: 'facebookPixel' as keyof FeatureFlags, label: 'Facebook Pixel', icon: Share2 },
    ],
  },
  {
    name: 'Media & Visual',
    icon: Play,
    features: [
      { key: 'videoEmbed' as keyof FeatureFlags, label: 'Video Embed Section', icon: Film },
      { key: 'animatedScroll' as keyof FeatureFlags, label: 'Animated Scroll Effects', icon: Sparkles },
      { key: 'imageLightbox' as keyof FeatureFlags, label: 'Image Lightbox Gallery', icon: ImageIcon },
      { key: 'darkLightToggle' as keyof FeatureFlags, label: 'Dark/Light Mode Toggle', icon: Sun },
    ],
  },
  {
    name: 'E-Commerce',
    icon: ShoppingCart,
    features: [
      { key: 'productCatalog' as keyof FeatureFlags, label: 'Product Catalog', icon: ShoppingCart },
      { key: 'onlineBooking' as keyof FeatureFlags, label: 'Online Booking System', icon: Calendar },
    ],
  },
]

// ============================================
// Default Feature Flags
// ============================================
// Standard features enabled for EVERY business
const DEFAULT_FEATURES: FeatureFlags = {
  whatsappWidget: true,      // SA market standard
  clickToCall: true,         // Mobile standard
  contactForm: true,         // Every business needs this
  googleMaps: false,         // Industry-specific
  businessHours: true,       // Standard for any business
  testimonials: true,        // Social proof is universal
  faq: true,                 // Reduces support load
  blog: false,               // Industry-specific
  teamProfiles: false,       // Industry-specific
  pricingTables: false,      // Industry-specific
  beforeAfterSlider: false,  // Industry-specific
  socialMediaLinks: true,    // Standard for any business
  newsletterSignup: false,   // Industry-specific
  googleAnalytics: true,     // Standard for any business
  facebookPixel: false,      // Industry-specific
  videoEmbed: false,         // Industry-specific
  animatedScroll: true,      // Modern standard
  imageLightbox: true,       // Standard for any gallery
  darkLightToggle: false,    // Industry-specific
  productCatalog: false,     // Industry-specific
  onlineBooking: false,      // Industry-specific
}

// Industry-based feature auto-detection
function detectIndustryFeatures(config: MasterSiteConfig): Partial<FeatureFlags> {
  const text = `${config.businessName} ${config.seo?.title || ''} ${config.seo?.description || ''} ${config.services?.map(s => s.title + ' ' + s.description).join(' ') || ''}`.toLowerCase()

  const detected: Partial<FeatureFlags> = {}

  // Photography / Creative
  if (/photograph|photo|studio|wedding|portrait|gallery|artist|creative|media|film|video/.test(text)) {
    detected.imageLightbox = true
    detected.beforeAfterSlider = true
    detected.animatedScroll = true
    detected.socialMediaLinks = true
    detected.videoEmbed = true
  }

  // Restaurant / Food
  if (/restaurant|cafe|food|dining|bakery|catering|pizza|sushi|coffee/.test(text)) {
    detected.googleMaps = true
    detected.businessHours = true
    detected.videoEmbed = true
    detected.socialMediaLinks = true
    detected.newsletterSignup = true
  }

  // Medical / Healthcare
  if (/doctor|clinic|medical|dental|health|hospital|physio|chiropractic/.test(text)) {
    detected.contactForm = true
    detected.googleMaps = true
    detected.businessHours = true
    detected.onlineBooking = true
    detected.faq = true
  }

  // Legal / Attorney
  if (/law|legal|attorney|advocate|barrister|notary|conveyancing/.test(text)) {
    detected.contactForm = true
    detected.googleMaps = true
    detected.businessHours = true
    detected.faq = true
    detected.testimonials = true
  }

  // Trade / Construction
  if (/plumb|electric|hvac|roof|repair|auto|mechanic|cleaning|towing|construction|builder|painter|landscaping/.test(text)) {
    detected.beforeAfterSlider = true
    detected.clickToCall = true
    detected.contactForm = true
    detected.googleMaps = true
    detected.testimonials = true
  }

  // Retail / E-commerce
  if (/shop|store|retail|boutique|fashion|clothing|accessories|gift/.test(text)) {
    detected.productCatalog = true
    detected.newsletterSignup = true
    detected.socialMediaLinks = true
    detected.videoEmbed = true
  }

  // Real Estate
  if (/real estate|property|estate agent|realtor|listing|broker|developer/.test(text)) {
    detected.googleMaps = true
    detected.videoEmbed = true
    detected.contactForm = true
    detected.pricingTables = true
  }

  // Fitness / Gym
  if (/gym|fitness|training|yoga|pilates|crossfit|personal trainer|wellness/.test(text)) {
    detected.pricingTables = true
    detected.testimonials = true
    detected.videoEmbed = true
    detected.onlineBooking = true
    detected.socialMediaLinks = true
  }

  // Beauty / Salon / Spa
  if (/beauty|salon|spa|nail|hair|skin|massage|makeup|aesthetic/.test(text)) {
    detected.onlineBooking = true
    detected.beforeAfterSlider = true
    detected.googleMaps = true
    detected.businessHours = true
    detected.socialMediaLinks = true
  }

  // Education
  if (/school|academy|tutor|education|training|college|university|learning|course/.test(text)) {
    detected.faq = true
    detected.testimonials = true
    detected.newsletterSignup = true
    detected.videoEmbed = true
  }

  // Events / Venues
  if (/event|venue|wedding|conference|banquet|function|celebration|party/.test(text)) {
    detected.videoEmbed = true
    detected.imageLightbox = true
    detected.socialMediaLinks = true
    detected.googleMaps = true
    detected.onlineBooking = true
  }

  // SaaS / Tech
  if (/software|saas|tech|startup|app|platform|digital|cloud|api/.test(text)) {
    detected.pricingTables = true
    detected.faq = true
    detected.videoEmbed = true
    detected.newsletterSignup = true
  }

  // Non-Profit
  if (/non-profit|charity|community|ngo|foundation|volunteer|donation/.test(text)) {
    detected.socialMediaLinks = true
    detected.newsletterSignup = true
    detected.videoEmbed = true
    detected.testimonials = true
  }

  // Hospitality / Tourism
  if (/hotel|guesthouse|lodge|bnb|accommodation|tourism|travel|safari/.test(text)) {
    detected.googleMaps = true
    detected.videoEmbed = true
    detected.testimonials = true
    detected.businessHours = true
    detected.onlineBooking = true
    detected.imageLightbox = true
  }

  // Accounting / Finance
  if (/accounting|tax|financial|bookkeeping|audit|payroll|invest/.test(text)) {
    detected.contactForm = true
    detected.faq = true
    detected.businessHours = true
    detected.testimonials = true
  }

  return detected
}

// ============================================
// Progress Steps
// ============================================
const PROGRESS_STEPS = [
  { id: 'prepare', label: 'Preparing', icon: Loader2 },
  { id: 'scrape', label: 'Scraping Website', icon: Globe },
  { id: 'colors', label: 'Extracting Colors', icon: Palette },
  { id: 'analyze', label: 'Analyzing Content', icon: Search },
  { id: 'copy', label: 'Writing Copy', icon: PenTool },
  { id: 'design', label: 'Generating Design', icon: Sparkles },
  { id: 'save', label: 'Saving Files', icon: FolderOpen },
  { id: 'complete', label: 'Complete', icon: Check },
]

// ============================================
// Main Dashboard Component
// ============================================
export default function WebsiteBuilderDashboard() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    city: '',
    whatsappNumber: '',
    existingWebsiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    googleMapsUrl: '',
    industry: '',
    buildMode: 'TRIAL',
    serviceAreas: '',
    businessBackground: '',
    email: '',
    phoneNumber: '',
    specificServices: '',
    tagline: '',
    specificTestimonials: '',
    specificImageUrls: '',
  })

  // Client-uploaded logo — outranks scraped/generated logos
  const [uploadedLogo, setUploadedLogo] = useState<{
    url: string
    storedName: string
    name: string
    size: number
    width: number | null
    height: number | null
    isSvg: boolean
    transparent: boolean
  } | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  const handleLogoFile = async (file: File | undefined | null) => {
    if (!file) return
    setLogoError(null)
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-logo', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        setLogoError(json.message || 'Upload failed.')
        return
      }
      setUploadedLogo(json)
    } catch {
      setLogoError('Upload failed. Try again.')
    } finally {
      setLogoUploading(false)
    }
  }

  const [features, setFeatures] = useState<FeatureFlags>({ ...DEFAULT_FEATURES })
  const [autoDetectedFeatures, setAutoDetectedFeatures] = useState<Set<keyof FeatureFlags>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [result, setResult] = useState<BuildSiteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'prompt' | 'seo' | 'design' | 'rules' | 'content'>('config')
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(FEATURE_GROUPS.map(g => g.name)))

  // Prefill from ?trialId=... or direct query params (Send to Dashboard)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const trialId = params.get('trialId')
    const hasDirect =
      params.get('businessName') ||
      params.get('googleMapsUrl') ||
      params.get('whatsappNumber') ||
      params.get('ownerName')

    const apply = (data: Record<string, string>) => {
      setFormData(prev => ({
        ...prev,
        businessName: data.businessName || prev.businessName,
        ownerName: data.ownerName || prev.ownerName,
        city: data.city || prev.city,
        whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
        email: data.email || prev.email,
        existingWebsiteUrl: data.existingWebsiteUrl || prev.existingWebsiteUrl,
        googleMapsUrl: data.googleMapsUrl || prev.googleMapsUrl,
        facebookUrl: data.facebookUrl || prev.facebookUrl,
        instagramUrl: data.instagramUrl || prev.instagramUrl,
        industry: data.industry || prev.industry,
        serviceAreas: data.serviceAreas || prev.serviceAreas,
      }))
    }

    const loadEmailFromContact = async (contactId: string) => {
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data: contact } = await supabase
          .from('contacts')
          .select('email')
          .eq('id', contactId)
          .maybeSingle()
        return contact?.email || ''
      } catch {
        return ''
      }
    }

    if (hasDirect) {
      apply({
        businessName: params.get('businessName') || '',
        ownerName: params.get('ownerName') || '',
        city: params.get('city') || '',
        whatsappNumber: params.get('whatsappNumber') || '',
        email: params.get('email') || '',
        existingWebsiteUrl: params.get('existingWebsiteUrl') || '',
        googleMapsUrl: params.get('googleMapsUrl') || '',
        facebookUrl: params.get('facebookUrl') || '',
        instagramUrl: params.get('instagramUrl') || '',
        industry: params.get('industry') || '',
        serviceAreas: params.get('serviceAreas') || '',
      })
      // Email may live only on the contact — fill it in async if missing
      if (!params.get('email') && params.get('trialId')) {
        ;(async () => {
          const { createClient } = await import('@/lib/supabase')
          const supabase = createClient()
          const { data: trial } = await supabase
            .from('trial_websites')
            .select('contact_id')
            .eq('id', params.get('trialId'))
            .maybeSingle()
          if (trial?.contact_id) {
            const email = await loadEmailFromContact(trial.contact_id)
            if (email) setFormData(prev => ({ ...prev, email }))
          }
        })()
      }
      return
    }

    if (!trialId) return

    // Load the full trial row so nothing from GeistTrack is dropped
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data } = await supabase
          .from('trial_websites')
          .select('*')
          .eq('id', trialId)
          .maybeSingle()
        if (data) {
          // Email lives on the contact, not always on trial_websites
          let email = data.email || ''
          if (!email && data.contact_id) {
            try {
              const { data: contact } = await supabase
                .from('contacts')
                .select('email')
                .eq('id', data.contact_id)
                .maybeSingle()
              email = contact?.email || ''
            } catch {}
          }
          apply({
            businessName: data.business_name || '',
            ownerName: data.owner_name || '',
            city: data.city || '',
            whatsappNumber: data.phone_number || '',
            email,
            existingWebsiteUrl: data.existing_website_url || '',
            googleMapsUrl: data.maps_url || '',
            facebookUrl: data.facebook_url || '',
            instagramUrl: data.instagram_url || '',
            industry: data.industry || '',
            serviceAreas: Array.isArray(data.service_areas) ? data.service_areas.join(', ') : '',
          })
        }
      } catch (err) {
        console.warn('Failed to load trial prefill:', err)
      }
    })()
  }, [])

  // Simulate progress steps during loading
  // Realistic progress phases based on what data is available
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(null)
      return
    }

    const hasWebsite = !!formData.existingWebsiteUrl
    const steps = PROGRESS_STEPS.map(s => s.id)
    // Timing: scrape is slow if website exists, copy is always medium, rest is fast
    const delays = hasWebsite
      ? [500, 1000, 4000, 2000, 5000, 2000, 1000, 500]   // with website: scrape takes time
      : [500, 500, 1000, 1500, 5000, 2000, 1000, 500]     // without website: skip scrape fast

    let index = 0
    let timeout: NodeJS.Timeout

    const advance = () => {
      if (index < steps.length) {
        setCurrentStep(steps[index])
        timeout = setTimeout(advance, delays[index])
        index++
      }
    }

    timeout = setTimeout(advance, delays[0])
    return () => clearTimeout(timeout)
  }, [isLoading, formData.existingWebsiteUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleFeatureToggle = (key: keyof FeatureFlags) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const serviceAreas = formData.serviceAreas
        ? formData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const response = await fetch('/api/build-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceAreas,
          features,
          uploadedLogo: uploadedLogo
            ? { storedName: uploadedLogo.storedName, name: uploadedLogo.name }
            : null,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to build site')
      }

      // Auto-detect industry-specific features based on scraped content
      if (data.config) {
        const detectedFeatures = detectIndustryFeatures(data.config)
        const detectedKeys = new Set(Object.keys(detectedFeatures).filter(k => detectedFeatures[k as keyof FeatureFlags]) as (keyof FeatureFlags)[])
        setAutoDetectedFeatures(detectedKeys)
        setFeatures(prev => ({
          ...prev,
          ...detectedFeatures,
        }))
      }

      setResult(data)
      // Set default palette selection
      if (data.colorPalette) {
        setSelectedPaletteId(data.colorPalette.id)
      }
      // Scroll to top to show results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'config' | 'prompt') => {
    await navigator.clipboard.writeText(text)
    if (type === 'config') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    }
  }

  const enabledCount = Object.values(features).filter(Boolean).length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Sitegeist Builder
              </h1>
              <p className="text-xs text-white/40">AI-Powered Website Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/built-websites"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/70 hover:text-white"
            >
              <Globe className="w-4 h-4" />
              Built Websites
            </a>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Business Details */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Business Details</h2>
                  <p className="text-sm text-white/50">Enter your client&apos;s information</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Pretoria Auto Repairs"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  {/* ── Logo upload ─────────────────────────────────────── */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                      Business Logo <span className="text-white/30">(optional — beats scraped &amp; generated)</span>
                    </label>

                    {!uploadedLogo ? (
                      <label
                        className="block bg-zinc-800/50 border border-dashed border-white/15 rounded-lg px-4 py-5 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-zinc-800/70 transition-all"
                        onDragOver={(e) => { e.preventDefault() }}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleLogoFile(e.dataTransfer.files?.[0])
                        }}
                      >
                        <input
                          type="file"
                          accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
                          className="hidden"
                          onChange={(e) => handleLogoFile(e.target.files?.[0])}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-7 h-7 text-white/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span className="text-sm text-white/55">
                            {logoUploading ? 'Uploading…' : 'Drop your logo here, or click to browse'}
                          </span>
                          <span className="text-xs text-white/30">SVG, PNG, WebP or JPG · up to 4 MB · PNG/SVG with transparency works best</span>
                        </div>
                      </label>
                    ) : (
                      <div className="bg-zinc-800/50 border border-white/10 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex gap-2 shrink-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={uploadedLogo.url} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={uploadedLogo.url} alt="Logo preview on dark" className="max-w-full max-h-full object-contain" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{uploadedLogo.name}</p>
                            <p className="text-xs text-white/45">
                              {uploadedLogo.width && uploadedLogo.height
                                ? `${uploadedLogo.width}×${uploadedLogo.height} · `
                                : ''}
                              {(uploadedLogo.size / 1024).toFixed(0)} KB
                              {uploadedLogo.isSvg ? ' · SVG' : uploadedLogo.transparent ? ' · transparency' : ' · JPG (no transparency)'}
                            </p>
                            {!uploadedLogo.transparent && !uploadedLogo.isSvg && (
                              <p className="text-xs text-amber-400/80 mt-1">Tip: PNG or SVG with a transparent background looks better in the header.</p>
                            )}
                            {uploadedLogo.width && uploadedLogo.width < 256 && !uploadedLogo.isSvg && (
                              <p className="text-xs text-amber-400/80 mt-1">Small image — may look soft on high-res screens.</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <label className="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 cursor-pointer transition-colors text-white/80">
                                Replace
                                <input
                                  type="file"
                                  accept=".svg,.png,.webp,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => { setUploadedLogo(null); setLogoError(null) }}
                                className="text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors text-white/70"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {logoError && (
                      <p className="text-xs text-red-400">{logoError}</p>
                    )}
                    <p className="text-xs text-white/35">
                      Without a logo we use the one scraped from the website, or generate one for you.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Owner Name <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="e.g., Johannes van der Merwe"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Pretoria"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 0821234567"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Existing Website URL <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="url"
                      name="existingWebsiteUrl"
                      value={formData.existingWebsiteUrl}
                      onChange={handleInputChange}
                      placeholder="https://www.example.co.za"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Facebook Page <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      placeholder="https://www.facebook.com/pagename"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Instagram Profile <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="url"
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleInputChange}
                      placeholder="https://www.instagram.com/username"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Google Maps <span className="text-white/30">(optional - for reviews & photos)</span>
                    </label>
                    <input
                      type="url"
                      name="googleMapsUrl"
                      value={formData.googleMapsUrl}
                      onChange={handleInputChange}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Industry <span className="text-white/30">(optional - auto-detected if empty)</span>
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Photography, Restaurant, Medical, Legal"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Service Areas <span className="text-white/30">(comma-separated, optional)</span>
                    </label>
                    <textarea
                      name="serviceAreas"
                      value={formData.serviceAreas}
                      onChange={handleInputChange}
                      placeholder="e.g., Pretoria, Centurion, Sandton, Midrand"
                      rows={2}
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <PenTool className="w-4 h-4" />
                      Business Background <span className="text-white/30">(optional - helps copywriting)</span>
                    </label>
                    <textarea
                      name="businessBackground"
                      value={formData.businessBackground}
                      onChange={handleInputChange}
                      placeholder="Tell us about the business - what makes it special, what it actually does, any quirks..."
                      rows={3}
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-white/30">(optional)</span>
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="info@example.co.za" className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number <span className="text-white/30">(optional - if different from WhatsApp)</span>
                    </label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="012 345 6789" className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Specific Services <span className="text-white/30">(optional - client-requested services to highlight)</span>
                    </label>
                    <textarea name="specificServices" value={formData.specificServices} onChange={handleInputChange} placeholder="Emergency callout, 24/7 availability, free quotes..." rows={3} className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Tagline / Motto <span className="text-white/30">(optional)</span>
                    </label>
                    <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} placeholder="Your Safety, Our Commitment" className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Specific Testimonials <span className="text-white/30">(optional - client-provided testimonials)</span>
                    </label>
                    <textarea name="specificTestimonials" value={formData.specificTestimonials} onChange={handleInputChange} placeholder="Paste any testimonials the client wants included..." rows={3} className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Specific Image URLs <span className="text-white/30">(optional - one URL per line)</span>
                    </label>
                    <textarea name="specificImageUrls" value={formData.specificImageUrls} onChange={handleInputChange} placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg" rows={3} className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Build Mode
                    </label>
                    <select
                      name="buildMode"
                      value={formData.buildMode}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
                    >
                      <option value="TRIAL">Trial Mode (Remote image URLs, faster preview)</option>
                      <option value="PRODUCTION">Production Mode (Downloads all images locally)</option>
                    </select>
                  </div>
                </div>

                {/* Feature Checkboxes */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold">Website Features</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40">{enabledCount} enabled</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFeatures({ ...DEFAULT_FEATURES })
                          setAutoDetectedFeatures(new Set())
                        }}
                        className="text-xs text-white/40 hover:text-white/70 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {FEATURE_GROUPS.map(group => {
                      const GroupIcon = group.icon
                      const isExpanded = expandedGroups.has(group.name)
                      const groupEnabledCount = group.features.filter(f => features[f.key]).length

                      return (
                        <div key={group.name} className="bg-zinc-800/30 rounded-lg border border-white/5">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.name)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <GroupIcon className="w-4 h-4 text-white/50" />
                              <span className="text-sm text-white/70">{group.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/40">{groupEnabledCount}/{group.features.length}</span>
                              <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isExpanded && "rotate-180")} />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-3 space-y-2">
                              {group.features.map(feature => {
                                const FeatureIcon = feature.icon
                                const isAutoDetected = autoDetectedFeatures.has(feature.key)
                                return (
                                  <label
                                    key={feature.key}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={features[feature.key]}
                                      onChange={() => handleFeatureToggle(feature.key)}
                                      className="w-4 h-4 rounded border-white/20 bg-zinc-700 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                                    />
                                    <FeatureIcon className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/70">{feature.label}</span>
                                    {isAutoDetected && (
                                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                        Detected
                                      </span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full mt-6 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all",
                    isLoading
                      ? "bg-zinc-800 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Building Website Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Build Website Engine
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Progress Indicator */}
            {isLoading && (
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6">
                <div className="space-y-3">
                  {PROGRESS_STEPS.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = currentStep === step.id
                    const isComplete = currentStep && PROGRESS_STEPS.findIndex(s => s.id === currentStep) > index

                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isActive ? "bg-cyan-500 text-white animate-pulse" :
                          isComplete ? "bg-green-500 text-white" :
                          "bg-zinc-800 text-white/30"
                        )}>
                          {isComplete ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                        </div>
                        <span className={cn(
                          "text-sm transition-colors",
                          isActive ? "text-cyan-400 font-medium" :
                          isComplete ? "text-green-400" :
                          "text-white/30"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Stats Cards */}
            {result && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/50">Pages Scraped</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{result.pagesScraped}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/50">Portfolio Images</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{result.imagesExtracted}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/50">Logos Found</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{result.logosExtracted}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">Status</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">Done</p>
                </div>
              </div>
            )}

            {/* Brand Assets */}
            {result?.config?.brandAssets && (
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Brand Assets</h3>
                    <p className="text-xs text-white/50">Extracted Logo & Colors</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {result.config.brandAssets.logoUrl && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                        <img
                          src={result.config.brandAssets.logoUrl}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Logo URL</p>
                        <p className="text-xs text-white/70 truncate max-w-[200px]">{result.config.brandAssets.logoUrl}</p>
                      </div>
                    </div>
                  )}

                  {result.config.brandAssets.brandColors && (
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-white/50 mb-2">Primary</p>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: result.config.brandAssets.brandColors.primary }} />
                          <span className="text-xs font-mono">{result.config.brandAssets.brandColors.primary}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-2">Secondary</p>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: result.config.brandAssets.brandColors.secondary }} />
                          <span className="text-xs font-mono">{result.config.brandAssets.brandColors.secondary}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-2">Accent</p>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: result.config.brandAssets.brandColors.accent }} />
                          <span className="text-xs font-mono">{result.config.brandAssets.brandColors.accent}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-2">Background</p>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: result.config.brandAssets.brandColors.bg }} />
                          <span className="text-xs font-mono">{result.config.brandAssets.brandColors.bg}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color Palette Selector */}
            {result?.availablePalettes && result.availablePalettes.length > 0 && (
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Brand Colors</h3>
                      <p className="text-xs text-white/50">Select a color palette for this industry</p>
                    </div>
                  </div>
                  {result.colorPalette && selectedPaletteId !== result.colorPalette.id && (
                    <button
                      onClick={() => setSelectedPaletteId(result.colorPalette!.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Reset to Auto-Detected
                    </button>
                  )}
                </div>

                {/* Palette Dropdown */}
                <select
                  value={selectedPaletteId || ''}
                  onChange={(e) => setSelectedPaletteId(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer mb-4"
                >
                  {result.availablePalettes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.mood}
                    </option>
                  ))}
                </select>

                {/* Selected Palette Preview */}
                {(() => {
                  const selected = result.availablePalettes.find(p => p.id === selectedPaletteId) || result.colorPalette
                  if (!selected) return null
                  return (
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-14 h-14 rounded-lg border border-white/20" style={{ backgroundColor: selected.primary }} />
                          <span className="text-[10px] text-white/40">Primary</span>
                          <span className="text-[10px] font-mono text-white/50">{selected.primary}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-14 h-14 rounded-lg border border-white/20" style={{ backgroundColor: selected.secondary }} />
                          <span className="text-[10px] text-white/40">Secondary</span>
                          <span className="text-[10px] font-mono text-white/50">{selected.secondary}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-14 h-14 rounded-lg border border-white/20" style={{ backgroundColor: selected.accent }} />
                          <span className="text-[10px] text-white/40">Accent</span>
                          <span className="text-[10px] font-mono text-white/50">{selected.accent}</span>
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-xs text-white/50">{selected.name}</p>
                        <p className="text-[10px] text-white/30">{selected.mood}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Output Folder */}
            {result?.buildFolder && (
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50">Output Folder</p>
                    <p className="text-sm text-white/70 truncate">{result.buildFolder}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Build Trial Website Button */}
            {result?.buildSlug && (
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    const clientFolder = formData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
                    const selectedPalette = result?.availablePalettes?.find(p => p.id === selectedPaletteId) || result?.colorPalette
                    try {
                      const response = await fetch('/api/build-website', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ businessFolder: clientFolder, selectedPalette }),
                      })
                      const data = await response.json()
                      if (data.success) {
                        alert(`MiMo Code CLI launched! Building website for ${formData.businessName}...`)
                      } else {
                        alert(`Error: ${data.error}`)
                      }
                    } catch (err) {
                      alert(`Error: ${err}`)
                    }
                  }}
                  className="w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Build Trial Website Now
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    const clientFolder = formData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
                    const selectedPalette = result?.availablePalettes?.find(p => p.id === selectedPaletteId) || result?.colorPalette
                    try {
                      const response = await fetch('/api/build-website', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ businessFolder: clientFolder, selectedPalette, reroll: true }),
                      })
                      const data = await response.json()
                      if (data.success) {
                        alert(`Reroll launched! Rebuilding ${formData.businessName} with a fresh design...`)
                      } else {
                        alert(`Error: ${data.error}`)
                      }
                    } catch (err) {
                      alert(`Error: ${err}`)
                    }
                  }}
                  className="w-full py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white border border-white/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reroll Design (Keep Data)
                </button>
              </div>
            )}

            {/* Tabbed Output Viewer */}
            {result && (
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 overflow-x-auto">
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'config' as const, label: 'Config', icon: FileJson },
                      { id: 'prompt' as const, label: 'Prompt', icon: Code },
                      { id: 'seo' as const, label: 'SEO', icon: Search },
                      { id: 'design' as const, label: 'Design', icon: Palette },
                      { id: 'rules' as const, label: 'Rules', icon: Shield },
                      { id: 'content' as const, label: 'Content', icon: PenTool },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn("px-2.5 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap", activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70")}
                      >
                        <tab.icon className="w-3.5 h-3.5 inline mr-1" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const content = activeTab === 'config' ? JSON.stringify(result.config, null, 2)
                        : activeTab === 'prompt' ? (result.prompt || '')
                        : activeTab === 'seo' ? JSON.stringify(result.config.seo, null, 2)
                        : activeTab === 'design' ? (result.buildInstructions?.designSystem || '')
                        : activeTab === 'rules' ? (result.buildInstructions?.technicalRules || '')
                        : (result.buildInstructions?.contentGuide || '')
                      copyToClipboard(content, activeTab === 'prompt' ? 'prompt' : 'config')
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs"
                  >
                    {(activeTab === 'prompt' ? promptCopied : copied) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 max-h-[500px] overflow-auto">
                  {activeTab === 'config' && (
                    <pre className="json-viewer text-sm text-cyan-300 whitespace-pre-wrap">
                      {JSON.stringify(result.config, null, 2)}
                    </pre>
                  )}
                  {activeTab === 'prompt' && (
                    <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono">
                      {result.prompt}
                    </pre>
                  )}
                  {activeTab === 'seo' && (
                    <pre className="json-viewer text-sm text-green-300 whitespace-pre-wrap">
                      {JSON.stringify(result.config.seo, null, 2)}
                    </pre>
                  )}
                  {activeTab === 'design' && (
                    <pre className="text-xs text-amber-300/80 whitespace-pre-wrap font-mono">
                      {result.buildInstructions?.designSystem || 'No design system data available'}
                    </pre>
                  )}
                  {activeTab === 'rules' && (
                    <pre className="text-xs text-red-300/80 whitespace-pre-wrap font-mono">
                      {result.buildInstructions?.technicalRules || 'No technical rules available'}
                    </pre>
                  )}
                  {activeTab === 'content' && (
                    <pre className="text-xs text-purple-300/80 whitespace-pre-wrap font-mono">
                      {result.buildInstructions?.contentGuide || 'No content guide available'}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !isLoading && (
              <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-cyan-400/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/70 mb-2">Ready to Build</h3>
                  <p className="text-sm text-white/40 max-w-md">
                    Enter your client&apos;s business details, select the features you want, and click Build to generate a stunning website configuration.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
