import dynamic from 'next/dynamic'

export const revalidate = 0

const DashboardRedirect = dynamic(() => import('./DashboardRedirect'), { ssr: false })

export default function DashboardPage() {
  return <DashboardRedirect />
}
