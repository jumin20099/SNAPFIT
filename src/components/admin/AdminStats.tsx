'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminStatsProps {
  totalReports: number
  pendingReports: number
  totalProducts: number
  pendingProducts: number
  totalPartners: number
  pendingPartners: number
}

export function AdminStats({
  totalReports,
  pendingReports,
  totalProducts,
  pendingProducts,
  totalPartners,
  pendingPartners
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">신고 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReports}</div>
          <p className="text-xs text-muted-foreground">
            대기 중: {pendingReports}건
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">상품 승인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            대기 중: {pendingProducts}건
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">파트너 신청</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPartners}</div>
          <p className="text-xs text-muted-foreground">
            대기 중: {pendingPartners}건
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
