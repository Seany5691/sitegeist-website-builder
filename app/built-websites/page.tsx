'use client'

import { useState, useEffect } from 'react'
import {
  Globe, RefreshCw, Eye, Trash2, Search, Filter,
  CheckCircle, XCircle, Clock, Loader2, ArrowLeft,
  Building2, Calendar, MapPin, Phone, ExternalLink,
  AlertTriangle, RotateCcw, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface TrialWebsite {
  id: string
  lead_id: string | null
  contact_id: string | null
  business_name: string
  owner_name: string
  phone_number: string
  city: string | null
  industry: string | null
  existing_website_url: string | null
  build_status: string
  build_mode: string
  build_slug: string | null
  build_folder: string | null
  error_message: string | null
  trial_url: string | null
  client_status: string
  created_at: string
  updated_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', icon: Clock },
  scraping: { label: 'Scraping', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Loader2 },
  generating: { label: 'Generating', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', icon: Loader2 },
  building: { label: 'Building', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: Loader2 },
  complete: { label: 'Complete', color: 'text-green-400 bg-green-500/10 border-green-500/30', icon: CheckCircle },
  failed: { label: 'Failed', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
}

export default function BuiltWebsitesPage() {
  const [websites, setWebsites] = useState<TrialWebsite[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [rebuilding, setRebuilding] = useState<string | null>(null)
  const [resetting, setResetting] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadWebsites()
  }, [])

  async function loadWebsites() {
    setLoading(true)
    const { data, error } = await supabase
      .from('trial_websites')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setWebsites(data)
    }
    setLoading(false)
  }

  async function handleRebuild(website: TrialWebsite) {
    if (!confirm(`Rebuild website for ${website.business_name}? This will create a new build.`)) return

    setRebuilding(website.id)
    try {
      // Reset build status to pending
      await supabase
        .from('trial_websites')
        .update({ build_status: 'pending', error_message: null })
        .eq('id', website.id)

      // Trigger rebuild via build-trial endpoint
      const res = await fetch('/api/build-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trialWebsiteId: website.id,
          businessName: website.business_name,
          ownerName: website.owner_name,
          city: website.city || '',
          whatsappNumber: website.phone_number,
          existingWebsiteUrl: website.existing_website_url || undefined,
          industry: website.industry || undefined,
          contactId: website.contact_id || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`Rebuild started for ${website.business_name}. Check back in a few minutes.`)
      } else {
        alert(`Rebuild failed: ${data.error}`)
      }
      loadWebsites()
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setRebuilding(null)
    }
  }

  async function handleReset(website: TrialWebsite) {
    if (!confirm(`Reset build status for ${website.business_name}? This will mark it as pending without rebuilding.`)) return

    setResetting(website.id)
    try {
      await supabase
        .from('trial_websites')
        .update({ build_status: 'pending', error_message: null })
        .eq('id', website.id)
      loadWebsites()
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setResetting(null)
    }
  }

  async function handleDelete(website: TrialWebsite) {
    if (!confirm(`Delete trial website for ${website.business_name}? This cannot be undone.`)) return

    try {
      await supabase
        .from('trial_websites')
        .delete()
        .eq('id', website.id)
      loadWebsites()
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const filteredWebsites = websites.filter(w => {
    const matchesSearch = searchQuery === '' ||
      w.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.city && w.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.industry && w.industry.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || w.build_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = websites.reduce((acc, w) => {
    acc[w.build_status] = (acc[w.build_status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </a>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Built Websites
              </h1>
              <p className="text-xs text-white/40">{websites.length} total websites</p>
            </div>
          </div>
          <button
            onClick={loadWebsites}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/70"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const Icon = config.icon
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={`p-4 rounded-xl border transition-all ${
                  statusFilter === status
                    ? config.color + ' ring-2 ring-white/20'
                    : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${statusFilter === status ? '' : 'text-white/40'}`} />
                  <span className={`text-xs ${statusFilter === status ? '' : 'text-white/50'}`}>
                    {config.label}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${statusFilter === status ? '' : 'text-white/70'}`}>
                  {statusCounts[status] || 0}
                </p>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, owner, city, or industry..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        {/* Website List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="bg-zinc-900/50 rounded-2xl border border-white/10 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-cyan-400/50" />
              </div>
              <h3 className="text-lg font-semibold text-white/70 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No matching websites' : 'No websites built yet'}
              </h3>
              <p className="text-sm text-white/40 max-w-md">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Websites will appear here once they are built from GeistTrack or the CRM.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWebsites.map((website) => {
              const statusConfig = STATUS_CONFIG[website.build_status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon
              const isBuilding = ['pending', 'scraping', 'generating', 'building'].includes(website.build_status)

              return (
                <div
                  key={website.id}
                  className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {website.business_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                        {website.owner_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {website.owner_name}
                          </span>
                        )}
                        {website.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {website.city}
                          </span>
                        )}
                        {website.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {website.phone_number}
                          </span>
                        )}
                        {website.industry && (
                          <span className="text-white/30">{website.industry}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(website.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {website.error_message && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">{website.error_message}</p>
                        </div>
                      )}

                      {website.build_folder && (
                        <p className="mt-2 text-xs text-white/30 truncate">
                          Folder: {website.build_folder}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {website.build_status === 'pending' && (
                        <button
                          onClick={() => handleRebuild(website)}
                          disabled={rebuilding === website.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                          {rebuilding === website.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          Start Build
                        </button>
                      )}

                      {website.build_status === 'complete' && website.build_slug && (
                        <a
                          href={`/built-websites/${website.build_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                      )}

                      {(website.build_status === 'complete' || website.build_status === 'failed') && (
                        <button
                          onClick={() => handleRebuild(website)}
                          disabled={rebuilding === website.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-sm disabled:opacity-50"
                        >
                          {rebuilding === website.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Rebuild
                        </button>
                      )}

                      <button
                        onClick={() => handleReset(website)}
                        disabled={resetting === website.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors text-sm disabled:opacity-50"
                        title="Reset build status to pending"
                      >
                        {resetting === website.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        Reset
                      </button>

                      <button
                        onClick={() => handleDelete(website)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
