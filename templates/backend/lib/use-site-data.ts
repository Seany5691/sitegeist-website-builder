'use client'

import { useState, useEffect } from 'react'

type SiteData = {
  config: any
  imageMap: any
}

// Shared in-flight request so every component does not fire its own fetches
let sharedRequest: Promise<SiteData> | null = null
let sharedData: SiteData | null = null

async function fetchSiteData(): Promise<SiteData> {
  const timestamp = Date.now()
  try {
    const res = await fetch(`/api/site-data?t=${timestamp}`, { cache: 'no-store' })
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error('site-data request failed')
    }
    const data = await res.json()
    if (!data?.success) throw new Error('site-data unsuccessful')
    return {
      config: data.siteConfig || null,
      imageMap: data.imageMap || null,
    }
  } catch (err) {
    console.error('Failed to load site data from API, trying static fallback:', err)
    const [cfg, img] = await Promise.all([
      fetch(`/site-config.json?t=${timestamp}`, { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`/image-map.json?t=${timestamp}`, { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
    return { config: cfg, imageMap: img }
  }
}

function loadSiteData(): Promise<SiteData> {
  if (sharedData) return Promise.resolve(sharedData)
  if (!sharedRequest) {
    sharedRequest = fetchSiteData()
      .then(data => {
        sharedData = data
        return data
      })
      .finally(() => {
        sharedRequest = null
      })
  }
  return sharedRequest
}

export function useSiteData() {
  const [config, setConfig] = useState<any>(null)
  const [imageMap, setImageMap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    loadSiteData()
      .then(({ config: cfg, imageMap: img }) => {
        if (cancelled) return
        setConfig(cfg)
        setImageMap(img)
        // Brief delay so skeletons do not flash on fast responses
        setTimeout(() => {
          if (cancelled) return
          setLoading(false)
          setIsLoading(false)
        }, 300)
      })
      .catch(err => {
        console.error('Failed to load site data:', err)
        if (cancelled) return
        setConfig(null)
        setImageMap(null)
        setLoading(false)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { config, imageMap, loading, isLoading }
}

/** Call after a dashboard save so the next mount refetches */
export function invalidateSiteDataCache() {
  sharedData = null
  sharedRequest = null
}
