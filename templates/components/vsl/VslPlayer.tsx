'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useSiteData } from '@/lib/use-site-data'

const FEATURE_ID = 'vsl'

type VslSize = 'small' | 'medium' | 'large'

type VslData = {
  headline?: string
  subheadline?: string
  videoUrl?: string
  videoUpload?: string
  poster?: string
  size?: VslSize
  autoplay?: boolean
  delaySeconds?: number
  showControls?: boolean
  ctaLabel?: string
  ctaUrl?: string
}

type Source =
  | { kind: 'youtube'; id: string }
  | { kind: 'vimeo'; id: string; hash?: string }
  | { kind: 'file'; src: string }

/* ------------------------------------------------------------------ */
/* Inline glyphs (play / volume are not in the shared features/icons set) */
/* ------------------------------------------------------------------ */

function PlayGlyph({ size = 24, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path d="M8.4 5.16a1 1 0 0 1 1.52-.85l9.4 6.02a1.25 1.25 0 0 1 0 2.1l-9.4 6.02a1 1 0 0 1-1.52-.86V5.16z" />
    </svg>
  )
}

function VolumeGlyph({
  muted,
  size = 18,
  style,
}: {
  muted: boolean
  size?: number
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path d="M11 5 6.6 9H3.2A1.2 1.2 0 0 0 2 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2H6.6L11 19V5z" />
      {muted ? (
        <>
          <path d="m16.2 9.4 5 5.2" />
          <path d="m21.2 9.4-5 5.2" />
        </>
      ) : (
        <>
          <path d="M15.4 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18.4 6.6a8 8 0 0 1 0 10.8" />
        </>
      )}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* URL helpers                                                         */
/* ------------------------------------------------------------------ */

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

function parseYouTubeId(raw: string): string | null {
  const u = safeUrl(raw)
  if (!u) return null
  const host = u.hostname.replace(/^www\./i, '').toLowerCase()
  if (host === 'youtu.be') {
    const id = u.pathname.split('/').filter(Boolean)[0]
    return id || null
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const v = u.searchParams.get('v')
    if (v) return v
    const parts = u.pathname.split('/').filter(Boolean)
    const head = (parts[0] || '').toLowerCase()
    if ((head === 'embed' || head === 'shorts' || head === 'live' || head === 'v') && parts[1]) {
      return parts[1]
    }
  }
  return null
}

function parseVimeo(raw: string): { id: string; hash?: string } | null {
  const u = safeUrl(raw)
  if (!u) return null
  const host = u.hostname.replace(/^www\./i, '').toLowerCase()
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null
  const parts = u.pathname.split('/').filter(Boolean)
  if ((parts[0] || '').toLowerCase() === 'video' && parts[1]) {
    const hash = u.searchParams.get('h') || undefined
    return { id: parts[1], hash }
  }
  const idx = parts.findIndex(p => /^\d+$/.test(p))
  if (idx === -1) return null
  const hash = parts[idx + 1] || u.searchParams.get('h') || undefined
  return { id: parts[idx], hash }
}

function resolveSource(data: VslData): Source | null {
  const upload = String(data.videoUpload || '').trim()
  const url = String(data.videoUrl || '').trim()
  const raw = upload || url
  if (!raw) return null

  const yt = parseYouTubeId(raw)
  if (yt) return { kind: 'youtube', id: yt }

  const vimeo = parseVimeo(raw)
  if (vimeo) return { kind: 'vimeo', id: vimeo.id, hash: vimeo.hash }

  return { kind: 'file', src: raw }
}

function buildEmbedSrc(
  source: Source,
  opts: { autoplay: boolean; muted: boolean; showControls: boolean }
): string {
  if (source.kind === 'youtube') {
    const params = new URLSearchParams()
    params.set('rel', '0')
    params.set('modestbranding', '1')
    params.set('playsinline', '1')
    params.set('enablejsapi', '1')
    if (opts.autoplay) params.set('autoplay', '1')
    if (opts.muted) params.set('mute', '1')
    if (!opts.showControls) params.set('controls', '0')
    return `https://www.youtube.com/embed/${source.id}?${params.toString()}`
  }
  if (source.kind === 'vimeo') {
    const params = new URLSearchParams()
    if (opts.autoplay) params.set('autoplay', '1')
    if (opts.muted) params.set('muted', '1')
    if (!opts.showControls) params.set('controls', '0')
    if (source.hash) params.set('h', source.hash)
    return `https://player.vimeo.com/video/${source.id}?${params.toString()}`
  }
  return ''
}

function youtubePoster(id: string): string {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
}

const SIZE_STYLES: Record<VslSize, CSSProperties> = {
  small: { width: '100%', maxWidth: 560 },
  medium: { width: '100%', maxWidth: 820 },
  large: { width: '100%', maxWidth: 'min(100%, calc(100vw - 2rem))' },
}

const PLAYER_BORDER = '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)'
const PLAYER_SHADOW =
  '0 28px 60px -18px color-mix(in srgb, var(--color-text) 28%, transparent), 0 10px 24px -12px color-mix(in srgb, var(--color-primary) 22%, transparent)'

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function VslPlayer() {
  const { config } = useSiteData()
  const data: VslData = (config?.featureData?.[FEATURE_ID] as VslData) || {}

  const source = useMemo(() => resolveSource(data), [
    data.videoUpload,
    data.videoUrl,
  ])

  const size: VslSize =
    data.size === 'small' || data.size === 'large' ? data.size : 'medium'
  const autoplay = data.autoplay === true
  const delaySeconds = Math.max(0, Number(data.delaySeconds) || 0)
  const showControls = data.showControls !== false

  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState<boolean>(autoplay)
  const [posterFailed, setPosterFailed] = useState(false)
  // Frozen at activation time so unmuting never remounts the iframe.
  const [embedSrc, setEmbedSrc] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Autoplay (or delayed autoplay) for whatever source we resolved.
  useEffect(() => {
    if (!source || activated || !autoplay) return
    const t = window.setTimeout(() => {
      setMuted(true)
      setActivated(true)
      if (source.kind === 'file') {
        const el = videoRef.current
        if (el) {
          el.muted = true
          el.play().catch(() => {})
        }
      } else {
        setEmbedSrc(
          buildEmbedSrc(source, { autoplay: true, muted: true, showControls })
        )
      }
    }, delaySeconds * 1000)
    return () => window.clearTimeout(t)
  }, [source, activated, autoplay, delaySeconds, showControls])

  // Keep the DOM mute flag in sync with state for native playback.
  useEffect(() => {
    const el = videoRef.current
    if (el) el.muted = muted
  }, [muted, activated])

  // No source at all → never render a broken player.
  if (!source) return null

  const isEmbed = source.kind === 'youtube' || source.kind === 'vimeo'

  const handlePlayClick = () => {
    // User gesture: start with sound when the viewer asked for it.
    setMuted(false)
    setActivated(true)
    if (source.kind === 'file') {
      const el = videoRef.current
      if (el) {
        el.muted = false
        el.play().catch(() => {})
      }
    } else {
      setEmbedSrc(
        buildEmbedSrc(source, { autoplay: true, muted: false, showControls })
      )
    }
  }

  const handleUnmute = () => {
    setMuted(false)
    if (source.kind === 'file' && videoRef.current) {
      videoRef.current.muted = false
      return
    }
    const frame = iframeRef.current
    if (!frame || !frame.contentWindow) return
    if (source.kind === 'youtube') {
      frame.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
        '*'
      )
      frame.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      )
    } else if (source.kind === 'vimeo') {
      frame.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*')
      frame.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*')
    }
  }

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }

  // Poster layer only pre-activation — the native <video poster> handles the
  // rest, so pausing never slaps the cover image back over the frame.
  const customPoster = String(data.poster || '').trim()
  const fallbackPoster =
    source.kind === 'youtube' && !posterFailed ? youtubePoster(source.id) : ''
  const posterUrl = customPoster || fallbackPoster
  const showPosterLayer = !activated
  const showBrandedPanel = !posterUrl || posterFailed

  const showBigPlay = !activated && !autoplay
  const showUnmute = activated && muted

  return (
    <section id="vsl" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading block */}
        {(data.headline || data.subheadline) && (
          <div className="text-center">
            <div
              className="mx-auto mb-5 rounded-full"
              style={{
                width: 56,
                height: 3,
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              }}
              aria-hidden="true"
            />
            {data.headline && (
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-text)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.12,
                }}
              >
                {data.headline}
              </h2>
            )}
            {data.subheadline && (
              <p
                className="mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
              >
                {data.subheadline}
              </p>
            )}
          </div>
        )}

        {/* Player */}
        <div
          className="mx-auto"
          style={{
            ...SIZE_STYLES[size],
            marginTop: data.headline || data.subheadline ? '2.5rem' : 0,
          }}
        >
          {/* Tinted frame panel */}
          <div
            className="rounded-3xl"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 4%, var(--color-bg))',
              border: '1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)',
              padding: '0.75rem',
            }}
          >
            <div
              role="region"
              aria-label={data.headline ? `Video: ${data.headline}` : 'Video player'}
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: '16 / 9',
                background: 'color-mix(in srgb, var(--color-text) 8%, var(--color-bg))',
                border: PLAYER_BORDER,
                boxShadow: PLAYER_SHADOW,
              }}
            >
              {/* Native video */}
              {source.kind === 'file' && (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={source.src}
                  poster={showBrandedPanel ? undefined : posterUrl}
                  controls={showControls}
                  playsInline
                  muted={muted}
                  preload="metadata"
                  onPlay={() => {
                    setPlaying(true)
                    setActivated(true)
                  }}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  onVolumeChange={e => setMuted(e.currentTarget.muted)}
                />
              )}

              {/* Embed (armed once playback is requested) */}
              {isEmbed && activated && (
                <iframe
                  ref={iframeRef}
                  key={embedSrc}
                  src={embedSrc}
                  title={data.headline ? `Video: ${data.headline}` : 'Video player'}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}

              {/* Poster / branded panel before playback */}
              {showPosterLayer && (
                <div className="absolute inset-0">
                  {!showBrandedPanel && posterUrl ? (
                    <img
                      src={posterUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                      onError={() => setPosterFailed(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background:
                          'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 24%, var(--color-bg)) 0%, color-mix(in srgb, var(--color-accent) 16%, var(--color-bg)) 52%, color-mix(in srgb, var(--color-primary) 32%, var(--color-bg)) 100%)',
                      }}
                      aria-hidden="true"
                    />
                  )}
                  {/* Soft scrim so the play control always reads */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at center, color-mix(in srgb, var(--color-text) 18%, transparent) 0%, color-mix(in srgb, var(--color-text) 38%, transparent) 100%)',
                    }}
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Big centred play button (autoplay off) */}
              {showBigPlay && (
                <button
                  type="button"
                  onClick={handlePlayClick}
                  aria-label="Play video"
                  className="absolute inset-0 w-full h-full flex items-center justify-center group focus:outline-none"
                  style={{ background: 'transparent', cursor: 'pointer' }}
                >
                  <span
                    className="flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
                    style={{
                      width: 84,
                      height: 84,
                      background: 'var(--color-primary-cta)',
                      color: '#ffffff',
                      boxShadow:
                        '0 18px 44px color-mix(in srgb, var(--color-primary) 45%, transparent), 0 6px 16px color-mix(in srgb, var(--color-text) 22%, transparent)',
                    }}
                  >
                    <PlayGlyph size={30} style={{ marginLeft: 3 }} />
                  </span>
                </button>
              )}

              {/* Click-to-pause layer when native controls are hidden */}
              {source.kind === 'file' && activated && !showControls && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause video' : 'Play video'}
                  className="absolute inset-0 w-full h-full focus:outline-none"
                  style={{ background: 'transparent', cursor: 'pointer' }}
                />
              )}

              {/* Unmute affordance (autoplay starts muted) */}
              {showUnmute && (
                <button
                  type="button"
                  onClick={handleUnmute}
                  className="absolute inline-flex items-center gap-2 rounded-full font-semibold transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
                  style={{
                    bottom: showControls && source.kind === 'file' ? '3.25rem' : '1rem',
                    left: '1rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.8125rem',
                    background: 'color-mix(in srgb, var(--color-text) 72%, transparent)',
                    color: '#ffffff',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0 8px 24px color-mix(in srgb, var(--color-text) 28%, transparent)',
                    border: '1px solid color-mix(in srgb, #ffffff 18%, transparent)',
                  }}
                  aria-label="Unmute video"
                >
                  <VolumeGlyph muted size={16} />
                  <span>Unmute</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Optional CTA */}
        {data.ctaLabel && data.ctaUrl && (
          <div className="mt-10 flex justify-center">
            <a
              href={data.ctaUrl}
              target={data.ctaUrl.startsWith('http') ? '_blank' : undefined}
              rel={data.ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center rounded-full font-semibold text-sm sm:text-base transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
              style={{
                background: 'var(--color-primary-cta)',
                color: '#ffffff',
                padding: '0.95rem 2.25rem',
                boxShadow:
                  '0 14px 32px color-mix(in srgb, var(--color-primary) 32%, transparent), 0 2px 8px color-mix(in srgb, var(--color-text) 12%, transparent)',
              }}
            >
              {data.ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
