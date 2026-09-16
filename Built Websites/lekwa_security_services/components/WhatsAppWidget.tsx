'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-emerald-600 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">Lekwa Security</p>
                  <p className="text-emerald-100 text-xs">Typically replies instantly</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-emerald-50">
              <p className="text-sm text-gray-700 mb-4">
                Hi! How can we help you today? Chat with us on WhatsApp for a quick response.
              </p>
              <a
                href="https://wa.me/27140040336?text=Hi%2C%20I%27m%20interested%20in%20your%20security%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 bg-emerald-600 text-white text-center text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Start Chat
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </m.button>
    </div>
  )
}
