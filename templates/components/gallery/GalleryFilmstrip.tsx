'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useMemo } from 'react'

type GalleryProps = {
 /** home = limited preview on the homepage; full = complete gallery page */
 mode?: 'home' | 'full'
}

export default function GalleryFilmstrip({ mode = 'full' }: GalleryProps) {
 const { imageMap, config } = useSiteData()
 const [openFolder, setOpenFolder] = useState<string | null>(null)
 const pc = config?.pageContent || {}
 const settings = config?.gallerySettings || {}
 const [isDragging, setIsDragging] = useState(false)

 const sectionTitle = pc.galleryTitle || 'Our Work'
 const sectionSubtitle = pc.gallerySubtitle || ''

 const categories = useMemo(() => imageMap?.categories || {}, [imageMap])

 // Explicit folder order from dashboard (falls back to insertion order)
 const categoryNames = useMemo(() => {
 const keys = Object.keys(categories)
 const order: string[] = settings.folderOrder || imageMap?.categoryOrder || []
 const ordered = order.filter(name => keys.includes(name))
 const rest = keys.filter(name => !ordered.includes(name))
 return [...ordered, ...rest]
 }, [categories, settings.folderOrder, imageMap])

 const allImages = useMemo(() => {
 const list: { url: string; category: string }[] = []
 categoryNames.forEach(catName => {
 (categories[catName].images || []).forEach((img: any) => {
 list.push({
 url: typeof img === 'string' ? img : img.src || img.imageUrl || img,
 category: catName,
 })
 })
 })
 return list
 }, [categories, categoryNames])

 if (allImages.length === 0) return null

 // Homepage folders mode (required by gallerySettings contract on every gallery template)
 const homeFolderLimit = Math.max(1, Number(settings.homeFolderLimit) || 6)
 const showFoldersOnHome = mode === 'home' && settings.homeMode === 'folders'

 if (showFoldersOnHome && openFolder && categories[openFolder]) {
 const folderImages = (categories[openFolder].images || []).map((img: any): { url: string; category: string } => ({
 url: typeof img === 'string' ? img : img.src || img.imageUrl || img,
 category: openFolder,
 }))
 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <button
 onClick={() => setOpenFolder(null)}
 className="text-sm font-medium mb-4 px-4 py-2 rounded-full"
 style={{ color: 'var(--color-primary)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
 >
 ← Back to folders
 </button>
 <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{openFolder}</h2>
 </div>
 <div className="flex flex-wrap justify-center gap-4">
 {folderImages.map((img, i) => (
 <div key={img.url + i} className="rounded-2xl overflow-hidden">
 <img src={img.url} alt={img.category} className="w-full h-auto object-cover" loading="lazy" />
 </div>
 ))}
 </div>
 </div>
 </section>
 )
 }

 if (showFoldersOnHome) {
 const visibleFolders = categoryNames.slice(0, homeFolderLimit)
 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{sectionTitle}</h2>
 {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto mt-3" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
 </AnimateOnScroll>
 <div className="flex flex-wrap justify-center gap-5">
 {visibleFolders.map((catName) => {
 const catData = categories[catName] || {}
 const imgs = catData.images || []
 const thumbUrl = catData.thumbnail || (imgs[0] ? (typeof imgs[0] === 'string' ? imgs[0] : imgs[0].src || imgs[0].imageUrl) : '')
 return (
 <button
 key={catName}
 onClick={() => setOpenFolder(catName)}
 className="group relative w-[min(100%,340px)] rounded-2xl overflow-hidden text-left"
 style={{ aspectRatio: '4/3' }}
 >
 {thumbUrl ? (
 <img src={thumbUrl} alt={catName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
 ) : (
 <div className="w-full h-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))' }}>
 <span className="text-4xl" style={{ color: 'var(--color-primary)' }}>📁</span>
 </div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-5">
 <div>
 <div className="text-white font-semibold text-lg">{catName}</div>
 <div className="text-white/80 text-sm">{imgs.length} photo{imgs.length !== 1 ? 's' : ''}</div>
 </div>
 </div>
 </button>
 )
 })}
 </div>
 {categoryNames.length > homeFolderLimit && (
 <div className="text-center mt-10">
 <a href="/portfolio" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
 View full Gallery
 </a>
 </div>
 )}
 </div>
 </section>
 )
 }


 // ----- Home preview: limited by gallerySettings, centred for small counts -----
 const defaultFilter = settings.homeFilter && (settings.homeFilter === 'All' || categoryNames.includes(settings.homeFilter))
 ? settings.homeFilter
 : 'All'
 const pictureLimit = Math.max(1, Number(settings.homePictureLimit) || 8)

 const pool = defaultFilter === 'All' ? allImages : allImages.filter(img => img.category === defaultFilter)
 const displayImages = mode === 'home' ? pool.slice(0, pictureLimit) : allImages
 const showViewFull = mode === 'home' && pool.length > displayImages.length

 return (
 <section id="gallery" className="py-16 overflow-hidden" style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
 <AnimateOnScroll className="text-center">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>Portfolio</span>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
 {sectionTitle}
 </h2>
 {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
 </AnimateOnScroll>
 </div>

 {displayImages.length <= 2 ? (
 /* Small counts: centred tiles instead of a sparse marquee */
 <div className="flex flex-wrap justify-center gap-4 px-4">
 {displayImages.map((img, i) => (
 <div key={`${img.url}-${i}`}
 className="flex-none w-64 aspect-[3/4] rounded-lg overflow-hidden img-treated">
 <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
 </div>
 ))}
 </div>
 ) : (
 <>
 {/* Filmstrip row 1 */}
 <div className="flex gap-4 overflow-hidden mb-4"
 style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
 onMouseDown={() => setIsDragging(true)}
 onMouseUp={() => setIsDragging(false)}
 onMouseLeave={() => setIsDragging(false)}>
 <div className="flex gap-4 animate-filmstrip">
 {[...displayImages, ...displayImages].map((img, i) => (
 <div key={i} className="flex-shrink-0 w-64 aspect-[3/4] rounded-lg overflow-hidden img-treated">
 <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
 </div>
 ))}
 </div>
 </div>

 {/* Filmstrip row 2 (reverse) */}
 <div className="flex gap-4 overflow-hidden"
 style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
 onMouseDown={() => setIsDragging(true)}
 onMouseUp={() => setIsDragging(false)}
 onMouseLeave={() => setIsDragging(false)}>
 <div className="flex gap-4 animate-filmstrip-reverse">
 {[...displayImages, ...displayImages].reverse().map((img, i) => (
 <div key={i} className="flex-shrink-0 w-48 aspect-[3/4] rounded-lg overflow-hidden">
 <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
 </div>
 ))}
 </div>
 </div>
 </>
 )}

 {showViewFull && (
 <div className="text-center mt-10 px-4">
 <a href="/portfolio"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
 style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
 View full Gallery
 </a>
 </div>
 )}
 </section>
 )
}
