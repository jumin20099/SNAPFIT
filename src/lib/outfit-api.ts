// 코디 관련 API 함수들

export interface OutfitData {
  items: any[]
  background: {
    type: 'color' | 'image'
    selectedBackground: string
    customColor: string
  }
  timestamp: number
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

  const response = await fetch('/api/outfits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      outfitItem: JSON.stringify(outfitData),
      outfitThumbnail: null, // 썸네일은 나중에 구현
      isPublic: true
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
