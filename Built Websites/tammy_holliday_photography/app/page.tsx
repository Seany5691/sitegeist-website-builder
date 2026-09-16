import dynamic from 'next/dynamic'

export const revalidate = 0

const HomeContent = dynamic(() => import('./HomeContent'), { ssr: false })

export default function Home() {
  return <HomeContent />
}
