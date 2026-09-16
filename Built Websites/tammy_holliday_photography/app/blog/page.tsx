import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const revalidate = 0

const BlogContent = dynamic(() => import('./BlogContent'), { ssr: false })

export const metadata: Metadata = {
  title: 'Blog | Tammy Holliday Photography',
  description: 'Photography tips, behind-the-scenes stories, and advice from Tammy Holliday.',
}

export default function BlogPage() {
  return <BlogContent />
}
