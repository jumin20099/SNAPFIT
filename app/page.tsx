import { Suspense } from 'react'
import { HomePage } from '@/components/home-page'
import { HomePageSkeleton } from '@/components/home-page-skeleton'

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  )
}
