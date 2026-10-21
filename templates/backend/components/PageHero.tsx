'use client'

import { useSiteData } from '@/lib/use-site-data'

type Props = {
  page: string
  fallbackTitle: string
  fallbackSubtitle: string
  fallbackImage: string
}

export default function PageHero({ page, fallbackTitle, fallbackSubtitle, fallbackImage }: Props) {
  const { config } = useSiteData()
  const hero = config?.pageHeroes?.[page] || {}

  const title = hero.title || fallbackTitle
  const subtitle = hero.subtitle || fallbackSubtitle
  const image = hero.imageUrl || fallbackImage

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="relative container mx-auto px-4 text-center text-white">
        <h1 className="heading-display mb-4">{title}</h1>
        {subtitle && <p className="body-text-large max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  )
}
