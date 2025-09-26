// 코디 관련 API 함수들

import { generateCodyThumbnail } from '@/lib/image-utils'

export interface OutfitData {
  name: string
  items: any[]
  background: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
  timestamp: number
  isPublic?: boolean
}

export interface OutfitResponse {
  outfitIdx: number
  user: {
    userIdx: string
    email: string
    nickname: string
  }
  outfitItem: string
  outfitThumbnail?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// 코디 저장
export async function saveOutfitToDatabase(outfitData: OutfitData): Promise<OutfitResponse> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('로그인이 필요합니다')
  }

  console.log('Frontend - Token:', token)
  console.log('Frontend - OutfitData:', outfitData)

  let thumbnailUrl: string | null = null

  try {
    const thumbnailBlob = await generateCodyThumbnail({
      items: outfitData.items,
      background: outfitData.background
    })

    const fileName = `outfit-thumbnail-${Date.now()}.png`
    const file = new File([thumbnailBlob], fileName, { type: 'image/png' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', 'outfit_thumbnail')
    formData.append('refId', Date.now().toString())

    const uploadResponse = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      console.error('Frontend - 썸네일 업로드 실패 상태:', uploadResponse.status)
    } else {
      const uploadBody = await uploadResponse.json()
      thumbnailUrl = uploadBody.url ?? uploadBody.data?.url ?? null
      console.log('Frontend - 썸네일 업로드 성공:', thumbnailUrl)
    }
  } catch (error) {
    console.error('Frontend - 썸네일 생성 또는 업로드 중 오류:', error)
  }

  const response = await fetch('/api/outfits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      outfitName: outfitData.name,
      outfitItem: JSON.stringify(outfitData),
      outfitThumbnail: thumbnailUrl,
      isPublic: outfitData.isPublic ?? true
    })
  })

  console.log('Frontend - Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Frontend - Error response:', errorText)
    throw new Error('코디 저장에 실패했습니다')
  }

  return response.json()
}

// 내 코디 목록 조회
export async function getMyOutfits(): Promise<OutfitResponse[]> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('로그인이 필요합니다')
  }

  const response = await fetch('/api/outfits?type=my', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('코디 목록 조회에 실패했습니다')
  }

  return response.json()
}

// 공개 코디 목록 조회
export async function getPublicOutfits(): Promise<OutfitResponse[]> {
  const response = await fetch('/api/outfits?type=public', {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error('공개 코디 목록 조회에 실패했습니다')
  }

  return response.json()
}

// 코디 삭제
export async function deleteOutfit(outfitIdx: number): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('로그인이 필요합니다')
  }

  const response = await fetch(`/api/outfits/${outfitIdx}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('코디 삭제에 실패했습니다')
  }
}

// 코디 공개/비공개 상태 토글
export async function toggleOutfitVisibility(outfitIdx: number, isPublic: boolean): Promise<OutfitResponse> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('로그인이 필요합니다')
  }

  console.log('=== toggleOutfitVisibility 호출 ===')
  console.log('outfitIdx:', outfitIdx)
  console.log('isPublic:', isPublic)
  console.log('token:', token ? '존재함' : '없음')

  const requestBody = { isPublic }
  console.log('요청 body:', requestBody)

  const response = await fetch(`/api/outfits/${outfitIdx}/visibility`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  })

  console.log('응답 상태:', response.status)
  console.log('응답 OK:', response.ok)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('에러 응답:', errorText)
    throw new Error('코디 공개 상태 변경에 실패했습니다')
  }

  const result = await response.json()
  console.log('응답 데이터:', result)
  return result
}
