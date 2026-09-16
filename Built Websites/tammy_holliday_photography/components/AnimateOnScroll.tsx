'use client'

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

type AnimationType = 'fade-rise' | 'fade-scale' | 'clip-reveal' | 'stagger-children'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

interface AnimateOnScrollProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: AnimationType
  style?: CSSProperties
}

export function AnimateOnScroll({ children, delay = 0, className = '', animation = 'fade-rise', style }: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation()

  const getAnimationStyles = (): CSSProperties => {
    const base: CSSProperties = {
      transitionDelay: `${delay}ms`,
      ...style,
    }

    switch (animation) {
      case 'fade-rise':
        return {
          ...base,
          transition: `all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : `translateY(var(--motion-distance, 12px))`,
        }
      case 'fade-scale':
        return {
          ...base,
          transition: `all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }
      case 'clip-reveal':
        return {
          ...base,
          transition: `all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))`,
          opacity: isVisible ? 1 : 0,
          clipPath: isVisible ? 'inset(0)' : 'inset(0 0 100% 0)',
        }
      case 'stagger-children':
        return {
          ...base,
          transition: `all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : `translateY(var(--motion-distance, 12px))`,
        }
      default:
        return base
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  )
}

// Stagger container — wraps children and applies staggered delays
export function StaggerContainer({ children, className = '', staggerDelay = 40 }: { children: ReactNode; className?: string; staggerDelay?: number }) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                transition: `all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))`,
                transitionDelay: `${i * staggerDelay}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : `translateY(var(--motion-distance, 12px))`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}
