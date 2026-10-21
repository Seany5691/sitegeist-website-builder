const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/lib/boilerplate-generator.ts'
let t = fs.readFileSync(p, 'utf8')

const START = 'function generateHomePage(sectionOrder?: number[]): string {'
const END = '\nfunction generateSubPage('

const startIdx = t.indexOf(START)
const endIdx = t.indexOf(END, startIdx)
if (startIdx < 0) { console.log('START not found'); process.exit(1) }
if (endIdx < 0) { console.log('END not found'); process.exit(1) }

const replacement = `/**
 * Homepage — composed at runtime by SectionRenderer, which reads the
 * Section Registry and siteConfig.controls. Nothing is hardcoded here, so
 * switching a section on/off in the dashboard re-flows the page cleanly.
 */
function generateHomePage(_sectionOrder?: number[]): string {
  return \`'use client'

import dynamic from 'next/dynamic'
import SectionRenderer from '@/components/SectionRenderer'
import { FeatureHost } from '@/components/features/FeatureHost'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export default function Home() {
  return (
    <>
      <FeatureHost placement="top-banner" />
      <Header />
      <FeatureHost placement="header" />
      <main>
        <SectionRenderer />
      </main>
      <Footer />
      <FeatureHost placement="footer" />
      <FeatureHost placement="floating" />
      <FeatureHost placement="modal" />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
\`
}
`

t = t.slice(0, startIdx) + replacement + t.slice(endIdx)
fs.writeFileSync(p, t, 'utf8')
console.log('generateHomePage replaced with registry-driven version')

// verify
const check = fs.readFileSync(p, 'utf8')
console.log('contains SectionRenderer:', check.includes('SectionRenderer'))
console.log('contains FeatureHost:', check.includes('FeatureHost'))
console.log('old hardcoded Hero gone:', !check.includes("const Hero = dynamic(() => import('@/components/Hero')"))
console.log('generateSubPage still present:', check.includes('function generateSubPage('))
