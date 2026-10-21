'use client'

import { useState, useEffect } from 'react'

export function useSiteData() {
  const [config, setConfig] = useState<any>(null)
  const [imageMap, setImageMap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/site-config.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/image-map.json').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([cfg, img]) => {
      setConfig(cfg)
      setImageMap(img)
      // Delay to prevent flash of skeleton (min 300ms for smooth transition)
      setTimeout(() => {
        setLoading(false)
        setIsLoading(false)
      }, 300)
    }).catch(err => {
      console.error('Failed to load site data:', err)
      setLoading(false)
      setIsLoading(false)
    })
  }, [])

  return { config, imageMap, loading, isLoading }
}
