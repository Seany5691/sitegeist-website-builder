'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    text: "Lekwa Security's response time is impeccable. They are professional, courteous, and give us great confidence in the safety of our business premises. Highly recommended.",
    name: 'S. Botha',
    role: 'Commercial Client',
    rating: 5,
    source: 'Google',
  },
  {
    text: "Since partnering with Lekwa Security Services, we've seen a significant reduction in security incidents. Their team is always alert and ready to respond.",
    name: 'M. van der Merwe',
    role: 'Industrial Client',
    rating: 5,
    source: 'Google',
  },
  {
    text: "The drone surveillance service has given us a completely new perspective on site security. Excellent technology combined with professional operators.",
    name: 'J. Pretorius',
    role: 'Property Manager',
    rating: 5,
    source: 'Google',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const goNext = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const goPrev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="relative py-20 md:py-28 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            What Our Clients Say
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <m.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <Quote className="w-10 h-10 text-primary/30 mx-auto mb-6" />
              <blockquote className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-8 font-light italic">
                &ldquo;{testimonials[current].text}&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-white font-semibold">{testimonials[current].name}</p>
              <p className="text-sm text-gray-500">{testimonials[current].role}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-500">
                via {testimonials[current].source}
              </span>
            </m.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={goPrev}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-primary w-6' : 'bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
