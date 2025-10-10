'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Report, useReport } from '@/hooks/useReport'
import { REPORT_CATEGORIES, REPORT_STATUS_LABELS } from '@/features/report/constants'
import { ReportButton } from '@/features/report/ReportButton'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  nickname: string
  email?: string
  profileImage?: string
  createdAt?: string
}

const categoryLabelMap = REPORT_CATEGORIES.reduce<Record<string, string>>((acc, category) => {
  acc[category.value] = category.label
  return acc
}, {})

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'reports' | 'settings'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [isReportsLoading, setIsReportsLoading] = useState(false)
  const { getMyReports } = useReport()

  console.log('MyPage 렌더링됨, activeTab:', activeTab)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          setProfile(null)
          return
        }
        const response = await fetch('/api/user/info', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('사용자 정보를 불러오지 못했습니다.')
        }
        const data = await response.json()
        setProfile({
          id: data.userIdx || data.id || '',
          nickname: data.nickname || '사용자',
          email: data.email,
          profileImage: data.profileImage,
          createdAt: data.createdAt
        })
      } catch (error) {
        console.error(error)
      } finally {
        setIsProfileLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const loadReports = async () => {
    try {
      setIsReportsLoading(true)
      const items = await getMyReports(0, 50)
      setReports(items)
    } catch (error) {
      toast.error('신고 내역을 불러오지 못했습니다')
    } finally {
      setIsReportsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'reports' && reports.length === 0 && !isReportsLoading) {
      loadReports()
    }
  }, [activeTab])

  const orderedReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reports])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-sm text-gray-500">내 정보와 신고 내역을 한눈에 확인하세요.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('탭 변경:', value)
          setActiveTab(value as typeof activeTab)
        }}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="reports" data-testid="my-reports-tab">신고 내역</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>내 프로필</CardTitle>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ) : profile ? (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">{profile.nickname}</div>
                    {profile.email && <div className="text-sm text-gray-500">{profile.email}</div>}
                    {profile.createdAt && (
                      <div className="text-sm text-gray-500">
                        가입일: {new Date(profile.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">로그인 후 이용 가능합니다.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>내 신고 내역</CardTitle>
                  <p className="text-sm text-gray-500">최근 50개의 신고 내역을 보여드립니다.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadReports} disabled={isReportsLoading}>
                  새로고침
                </Button>
              </CardHeader>
              <CardContent>
                {isReportsLoading && reports.length === 0 ? (
                  <div className="space-y-3" data-testid="my-reports-list">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                  </div>
                ) : orderedReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500" data-testid="my-reports-list">
                    <span className="text-3xl mb-2">📭</span>
                    <p>접수된 신고 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="my-reports-list">
                    {orderedReports.map((report) => (
                      <div
                        key={report.reportId}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                        data-testid="report-item"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{report.targetType}</Badge>
                            <Badge variant="outline">{categoryLabelMap[report.category] || report.category}</Badge>
                          </div>
                          <Badge variant="outline" data-testid="report-status">
                            {REPORT_STATUS_LABELS[report.status] || report.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-700 mb-1">{report.reason}</div>
                        <div className="text-xs text-gray-500">
                          접수일: {new Date(report.createdAt).toLocaleString('ko-KR')}
                        </div>
                        <div className="mt-2">
                          <ReportButton
                            targetType={report.targetType}
                            targetId={report.targetType === 'USER' ? undefined : report.targetId}
                            targetUserId={report.targetUserId}
                            variant="ghost"
                            size="sm"
                            label="다시 신고"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>설정</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">추가 설정 기능이 곧 제공될 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
