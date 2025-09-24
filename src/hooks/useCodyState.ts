'use client'

import { useState, useCallback } from 'react'
import { MannequinPart, categoryToMannequinMap } from '@/constants/cody-categories'

interface Product {
  productIdx: number
  productName: string
  productImage: string
  productPrice: number
  majorCategory: string
  subCategory: string
  storeName: string
}

interface CodyState {
  selectedProducts: Record<string, Product | null>
  categorySelection: {
    gender: string
    majorCategory: string
    subCategory: string
  }
  isCategoryPanelOpen: boolean
}

const initialState: CodyState = {
  selectedProducts: {
    tops: null,
    outer: null,
    bottoms: null,
    'dress-skirt': null,
    shoes: null,
    bag: null,
    accessories: null
  },
  categorySelection: {
    gender: 'all',
    majorCategory: '',
    subCategory: ''
  },
  isCategoryPanelOpen: false
}

export function useCodyState() {
  const [state, setState] = useState<CodyState>(initialState)

  // 카테고리 패널 토글
  const toggleCategoryPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCategoryPanelOpen: !prev.isCategoryPanelOpen
    }))
  }, [])

  // 카테고리 패널 열기
  const openCategoryPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCategoryPanelOpen: true
    }))
  }, [])

  // 카테고리 패널 닫기
  const closeCategoryPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCategoryPanelOpen: false
    }))
  }, [])

  // 성별 선택
  const selectGender = useCallback((gender: string) => {
    setState(prev => ({
      ...prev,
      categorySelection: {
        ...prev.categorySelection,
        gender,
        majorCategory: '',
        subCategory: ''
      }
    }))
  }, [])

  // 대분류 선택
  const selectMajorCategory = useCallback((majorCategory: string) => {
    setState(prev => ({
      ...prev,
      categorySelection: {
        ...prev.categorySelection,
        majorCategory,
        subCategory: ''
      }
    }))
  }, [])

  // 소분류 선택
  const selectSubCategory = useCallback((subCategory: string) => {
    setState(prev => ({
      ...prev,
      categorySelection: {
        ...prev.categorySelection,
        subCategory
      }
    }))
  }, [])

  // 상품 선택
  const selectProduct = useCallback((product: Product) => {
    const category = product.majorCategory
    const mannequinPart = categoryToMannequinMap[category]
    
    if (mannequinPart) {
      setState(prev => ({
        ...prev,
        selectedProducts: {
          ...prev.selectedProducts,
          [mannequinPart]: product
        }
      }))
    }
  }, [])

  // 마네킹 부위 클릭으로 상품 선택
  const selectProductByPart = useCallback((part: MannequinPart, product: Product) => {
    setState(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [part.category]: product
      }
    }))
  }, [])

  // 상품 제거
  const removeProduct = useCallback((category: string) => {
    setState(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [category]: null
      }
    }))
  }, [])

  // 모든 상품 제거
  const clearAllProducts = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedProducts: {
        tops: null,
        outer: null,
        bottoms: null,
        'dress-skirt': null,
        shoes: null,
        bag: null,
        accessories: null
      }
    }))
  }, [])

  // 전체보기 (모든 상품 표시)
  const showAllProducts = useCallback(() => {
    setState(prev => ({
      ...prev,
      categorySelection: {
        gender: prev.categorySelection.gender,
        majorCategory: '',
        subCategory: ''
      }
    }))
  }, [])

  // 코디 저장
  const saveCody = useCallback(async (name: string) => {
    const selectedProductsList = Object.values(state.selectedProducts).filter(Boolean)
    
    if (selectedProductsList.length === 0) {
      throw new Error('선택된 상품이 없습니다')
    }

    const codyData = {
      name,
      selectedProducts: state.selectedProducts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch('/api/cody/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codyData)
    })

    if (!response.ok) {
      throw new Error('코디 저장에 실패했습니다')
    }

    return response.json()
  }, [state.selectedProducts])

  // 이미지 다운로드
  const downloadImage = useCallback(async () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas를 생성할 수 없습니다')
    }

    // 캔버스 크기 설정
    canvas.width = 400
    canvas.height = 600

    // 배경 그리기
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 마네킹 그리기 (간단한 점선)
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, 300, 500)

    // 선택된 상품 이미지 그리기
    const selectedProductsList = Object.values(state.selectedProducts).filter(Boolean)
    
    for (const product of selectedProductsList) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = product?.productImage || '/placeholder.svg'
        })

        // 상품 이미지를 적절한 위치에 그리기
        if (!product) return
        const category = product.majorCategory
        const mannequinPart = categoryToMannequinMap[category]
        
        if (mannequinPart) {
          const x = 50 + (300 * 0.35) // 마네킹 내부 위치
          const y = 50 + (500 * 0.2) // 마네킹 내부 위치
          const width = 300 * 0.3
          const height = 500 * 0.25
          
          ctx.drawImage(img, x, y, width, height)
        }
      } catch (error) {
        console.error('이미지 로드 실패:', error)
      }
    }

    // 이미지 다운로드
    const link = document.createElement('a')
    link.download = `cody-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [state.selectedProducts])

  // 커뮤니티 export
  const exportToCommunity = useCallback(async (title: string, content: string) => {
    const selectedProductsList = Object.values(state.selectedProducts).filter(Boolean)
    
    if (selectedProductsList.length === 0) {
      throw new Error('선택된 상품이 없습니다')
    }

    // 마네킹 이미지 생성 (base64)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas를 생성할 수 없습니다')
    }

    canvas.width = 400
    canvas.height = 600
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 마네킹과 상품 이미지 그리기 (위와 동일한 로직)
    const mannequinImage = canvas.toDataURL('image/png')

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    let anonymousPassword: string | undefined

    if (!token) {
      const input = window.prompt('게시글 비밀번호를 입력해주세요 (4자 이상).')
      if (!input || input.trim().length < 4) {
        throw new Error('비밀번호는 4자 이상이어야 합니다')
      }
      anonymousPassword = input.trim()
    }

    const postData: Record<string, any> = {
      title,
      content,
      selectedProducts: selectedProductsList,
      mannequinImage,
      tags: ['코디', '패션', '스타일'],
      ...(anonymousPassword ? { anonymousPassword } : {})
    }

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(postData)
    })

    if (!response.ok) {
      throw new Error('커뮤니티 게시글 생성에 실패했습니다')
    }

    return response.json()
  }, [state.selectedProducts])

  return {
    // 상태
    selectedProducts: state.selectedProducts,
    categorySelection: state.categorySelection,
    isCategoryPanelOpen: state.isCategoryPanelOpen,
    
    // 액션
    toggleCategoryPanel,
    openCategoryPanel,
    closeCategoryPanel,
    selectGender,
    selectMajorCategory,
    selectSubCategory,
    selectProduct,
    selectProductByPart,
    removeProduct,
    clearAllProducts,
    showAllProducts,
    saveCody,
    downloadImage,
    exportToCommunity
  }
}
