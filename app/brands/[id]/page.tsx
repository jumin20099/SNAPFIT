import BrandDetailPage from '@/components/brand/BrandDetailPage'

interface BrandPageProps {
  params: { id: string }
}

export default function BrandPage({ params }: BrandPageProps) {
  return <BrandDetailPage brandId={params.id} />
}
