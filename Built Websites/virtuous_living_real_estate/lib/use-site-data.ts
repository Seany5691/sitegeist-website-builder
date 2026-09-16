'use client'

import { useState, useEffect } from 'react'

export function useSiteData() {
  const [config, setConfig] = useState<any>(null)
  const [imageMap, setImageMap] = useState<any>(null)

  useEffect(() => {
    fetch('/site-config.json')
      .then(r => r.ok ? r.json() : null)
      .then(setConfig)
      .catch(() => {})

    fetch('/image-map.json')
      .then(r => r.ok ? r.json() : null)
      .then(setImageMap)
      .catch(() => {})
  }, [])

  return { config, imageMap }
}
