import { useState, useEffect } from 'react'

interface RecentProduct {
  id: string
  name: string
  brand: string
  price: number
  imageUrl: string
  isLiked?: boolean
  rating?: number
  reviewCount?: number
  badge?: string
  shippingInfo?: string
}

const RECENT_PRODUCTS_KEY = 'recent_products'
const MAX_RECENT_PRODUCTS = 10

export function useRecentProducts() {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])

  // localStorage에서 최근 본 상품 로드
  useEffect(() => {
    const loadRecentProducts = () => {
      try {
        const stored = localStorage.getItem(RECENT_PRODUCTS_KEY)
        if (stored) {
          const products = JSON.parse(stored)
          setRecentProducts(products)
        }
      } catch (error) {
        console.error('최근 본 상품 로드 실패:', error)
      }
    }

    loadRecentProducts()
  }, [])

  // 상품 추가
  const addRecentProduct = (product: Omit<RecentProduct, 'isLiked'>) => {
    try {
      setRecentProducts(prev => {
        // 중복 제거 (같은 ID의 상품이 있으면 제거)
        const filtered = prev.filter(p => p.id !== product.id)
        
        // 새 상품을 맨 앞에 추가
        const updated = [product, ...filtered]
        
        // 최대 개수 제한
        const limited = updated.slice(0, MAX_RECENT_PRODUCTS)
        
        // localStorage에 저장
        localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(limited))
        
        return limited
      })
    } catch (error) {
      console.error('최근 본 상품 추가 실패:', error)
    }
  }

  // 상품 제거
  const removeRecentProduct = (productId: string) => {
    try {
      setRecentProducts(prev => {
        const updated = prev.filter(p => p.id !== productId)
        localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('최근 본 상품 제거 실패:', error)
    }
  }

  // 모든 최근 본 상품 제거
  const clearRecentProducts = () => {
    try {
      setRecentProducts([])
      localStorage.removeItem(RECENT_PRODUCTS_KEY)
    } catch (error) {
      console.error('최근 본 상품 전체 제거 실패:', error)
    }
  }

  return {
    recentProducts,
    addRecentProduct,
    removeRecentProduct,
    clearRecentProducts
  }
}
