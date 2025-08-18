"use client"

import { useState, useEffect, useContext } from "react"
import { Search, Heart, Grid3X3, User, X, Users, Settings, Store, Package, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ProductCard from "@/components/product-card"
import ProductDetailPage from "@/components/product-detail-page"
import NotificationPage from "@/components/notification-page"
import { useModals } from "@/contexts/ModalContext"
import { useRouter } from "next/navigation"
import { useSSENotifications } from "@/hooks/useSSENotifications"

const categories = ["전체", "남성복", "여성복"]
const majorCategories = ["좋아요", "상의", "하의", "아우터", "신발", "가방", "패션소품"]

// 각 카테고리별 세부 카테고리 정의
const subCategoryDetails = {
  상의: [
    { name: "맨투맨/스웨트", image: "/placeholder.svg?height=100&width=100" },
    { name: "후드 티셔츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "셔츠/블라우스", image: "/placeholder.svg?height=100&width=100" },
    { name: "긴소매 티셔츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "반소매 티셔츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "피케/카라 티셔츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "니트/스웨터", image: "/placeholder.svg?height=100&width=100" },
    { name: "민소매 티셔츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "기타 상의", image: "/placeholder.svg?height=100&width=100" },
  ],
  하의: [
    { name: "데님 팬츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "트레이닝/조거 팬츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "코튼 팬츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "슈트 팬츠/슬랙스", image: "/placeholder.svg?height=100&width=100" },
    { name: "숏 팬츠", image: "/placeholder.svg?height=100&width=100" },
    { name: "레깅스", image: "/placeholder.svg?height=100&width=100" },
    { name: "점프 슈트/오버올", image: "/placeholder.svg?height=100&width=100" },
    { name: "기타 하의", image: "/placeholder.svg?height=100&width=100" },
  ],
  아우터: [
    { name: "후드 집업", image: "/placeholder.svg?height=100&width=100" },
    { name: "블루종/MA-1", image: "/placeholder.svg?height=100&width=100" },
    { name: "레더/라이더스 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "카디건", image: "/placeholder.svg?height=100&width=100" },
    { name: "트러커 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "슈트/블레이저 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "스타디움 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "나일론/코치 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "아노락 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "트레이닝 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "환절기 코트", image: "/placeholder.svg?height=100&width=100" },
    { name: "사파리/헌팅 재킷", image: "/placeholder.svg?height=100&width=100" },
    { name: "베스트", image: "/placeholder.svg?height=100&width=100" },
    { name: "숏패딩/헤비 아우터", image: "/placeholder.svg?height=100&width=100" },
    { name: "무스탕/퍼", image: "/placeholder.svg?height=100&width=100" },
    { name: "플리스/뽀글이", image: "/placeholder.svg?height=100&width=100" },
    { name: "겨울 싱글 코트", image: "/placeholder.svg?height=100&width=100" },
    { name: "겨울 더블 코트", image: "/placeholder.svg?height=100&width=100" },
    { name: "겨울 기타 코트", image: "/placeholder.svg?height=100&width=100" },
    { name: "롱패딩/헤비 아우터", image: "/placeholder.svg?height=100&width=100" },
    { name: "패딩 베스트", image: "/placeholder.svg?height=100&width=100" },
    { name: "기타 아우터", image: "/placeholder.svg?height=100&width=100" },
  ],
  신발: [
    { name: "스니커즈", image: "/placeholder.svg?height=100&width=100" },
    { name: "패딩/퍼 신발", image: "/placeholder.svg?height=100&width=100" },
    { name: "부츠/워커", image: "/placeholder.svg?height=100&width=100" },
    { name: "구두", image: "/placeholder.svg?height=100&width=100" },
    { name: "샌들/슬리퍼", image: "/placeholder.svg?height=100&width=100" },
    { name: "스포츠화", image: "/placeholder.svg?height=100&width=100" },
    { name: "신발용품", image: "/placeholder.svg?height=100&width=100" },
  ],
  가방: [
    { name: "메신저/크로스 백", image: "/placeholder.svg?height=100&width=100" },
    { name: "숄더백", image: "/placeholder.svg?height=100&width=100" },
    { name: "백팩", image: "/placeholder.svg?height=100&width=100" },
    { name: "토트백", image: "/placeholder.svg?height=100&width=100" },
    { name: "에코백", image: "/placeholder.svg?height=100&width=100" },
    { name: "보스턴/더플백", image: "/placeholder.svg?height=100&width=100" },
    { name: "웨이스트 백", image: "/placeholder.svg?height=100&width=100" },
    { name: "파우치 백", image: "/placeholder.svg?height=100&width=100" },
    { name: "브리프 케이스", image: "/placeholder.svg?height=100&width=100" },
    { name: "캐리어", image: "/placeholder.svg?height=100&width=100" },
    { name: "가방 소품", image: "/placeholder.svg?height=100&width=100" },
    { name: "지갑/머니클립", image: "/placeholder.svg?height=100&width=100" },
    { name: "클러치 백", image: "/placeholder.svg?height=100&width=100" },
  ],
  패션소품: [
    { name: "모자", image: "/placeholder.svg?height=100&width=100" },
    { name: "머플러", image: "/placeholder.svg?height=100&width=100" },
    { name: "주얼리", image: "/placeholder.svg?height=100&width=100" },
    { name: "양말/레그웨어", image: "/placeholder.svg?height=100&width=100" },
    { name: "선글라스/안경테", image: "/placeholder.svg?height=100&width=100" },
    { name: "액세서리", image: "/placeholder.svg?height=100&width=100" },
    { name: "시계", image: "/placeholder.svg?height=100&width=100" },
    { name: "벨트", image: "/placeholder.svg?height=100&width=100" },
  ],
}

const mockProducts: any[] = []

export default function SnapFitMobile() {
  const { isProductPanelOpen, setIsProductPanelOpen } = useModals()
  const router = useRouter()
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedMajorCategory, setSelectedMajorCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [products, setProducts] = useState(mockProducts)
  const [categoryProducts, setCategoryProducts] = useState<any[]>([])
  const [isLoadingCategory, setIsLoadingCategory] = useState(false)
  const [userInfo, setUserInfo] = useState<{ role?: string; email?: string } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false)
  const [codyItems, setCodyItems] = useState<{ [key: string]: any }>({})
  // 좋아요된 상품 ID 집합 (카테고리/검색 목록 하트 표시용)
  const [likedProductIds, setLikedProductIds] = useState<Set<number>>(new Set())

  // 좋아요 상태를 로컬 스토리지에 저장하는 함수 (보조 저장소)
  const saveLikedProductIds = (newLikedIds: Set<number>) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('likedProductIds', JSON.stringify(Array.from(newLikedIds)))
      } catch (error) {
        console.warn('로컬 스토리지 저장 실패:', error)
      }
    }
  }

  // 페이지 로드 시 좋아요 상태 복원 (서버 우선, 로컬 스토리지는 보조)
  useEffect(() => {
    const fetchLikedStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch('/api/likes/my', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            console.log('서버에서 좋아요 상태 복원:', data)
            // Like 엔티티에서 PRODUCT 타입의 targetIdx만 추출
            const likedIds: Set<number> = new Set(
              Array.isArray(data) 
                ? data
                    .filter((like: any) => like?.targetType === 'PRODUCT')
                    .map((like: any) => Number(like?.targetIdx))
                    .filter((id: any) => !isNaN(id))
                : []
            )
            console.log('서버에서 복원된 좋아요 ID들:', Array.from(likedIds))
            setLikedProductIds(likedIds)
            // 로컬 스토리지에 백업 (보조 저장소)
            saveLikedProductIds(likedIds)
          }
        } else {
          // 토큰이 없으면 로컬 스토리지에서 임시 복원 (오프라인 지원)
          console.log('토큰이 없어 로컬 스토리지에서 임시 복원 시도')
          const saved = localStorage.getItem('likedProductIds')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              setLikedProductIds(new Set(parsed))
              console.log('로컬 스토리지에서 임시 복원됨:', parsed)
            } catch (e) {
              console.warn('로컬 스토리지 복원 실패:', e)
            }
          }
        }
      } catch (error) {
        console.error('서버에서 좋아요 상태 복원 실패, 로컬 스토리지 시도:', error)
        // 서버 연결 실패 시 로컬 스토리지에서 복원 시도
        const saved = localStorage.getItem('likedProductIds')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setLikedProductIds(new Set(parsed))
            console.log('서버 연결 실패로 로컬 스토리지에서 복원됨:', parsed)
          } catch (e) {
            console.warn('로컬 스토리지 복원 실패:', e)
          }
        }
      }
    }

    fetchLikedStatus()
  }, [])

  // 검색 기능
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = new URLSearchParams({
        keyword: query.trim(),
        type: 'all',
      });


      
      const response = await fetch(`/api/products/search?${params.toString()}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error('검색에 실패했습니다.');
      }

      const data = await response.json();
      const withLikes = Array.isArray(data)
        ? data.map((p: any) => ({ ...p, liked: likedProductIds.has(p.productIdx) }))
        : []
      setSearchResults(withLikes);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    if (!isSearchMode) return;

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchMode]);

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/user/info', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  }

  // 좋아요된 상품 ID만 빠르게 조회 (카테고리/검색 목록 하트 표시용)
  const fetchLikedIds = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/likes/my', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (res.ok) {
        const data = await res.json()
        // Like 엔티티에서 PRODUCT 타입의 targetIdx만 추출
        const ids: number[] = Array.isArray(data) 
          ? data
              .filter((like: any) => like?.targetType === 'PRODUCT')
              .map((like: any) => Number(like?.targetIdx))
              .filter((id: any) => !isNaN(id))
          : []
        setLikedProductIds(new Set(ids))
      }
    } catch (_) {
      // ignore
    }
  }

  useEffect(() => {
    // URL에서 로그인 성공 토큰 확인
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const loginSuccess = urlParams.get('login')
    
    if (token && loginSuccess === 'success') {
      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem('token', token)
      
      // URL에서 토큰 파라미터 제거
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('token')
      newUrl.searchParams.delete('login')
      window.history.replaceState({}, '', newUrl.toString())
      
      // 사용자 정보 새로고침
      fetchUserInfo()
      fetchLikedIds()
      // fetchUnreadNotificationCount() // 실시간 알림 훅으로 대체
    } else {
      // 기존 로직
      fetchUserInfo()
      fetchLikedIds()
      // fetchUnreadNotificationCount() // 실시간 알림 훅으로 대체
    }
  }, [])

  // 좋아요한 상품들 상태
  const [likedProducts, setLikedProducts] = useState<any[]>([])
  const [isLoadingLikedProducts, setIsLoadingLikedProducts] = useState(false)

  // 알림 관련 상태
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  
  // 실시간 알림 훅 사용
  const { unreadCount: unreadNotificationCount, isConnected, error: notificationError, reconnect } = useSSENotifications()

  // 좋아요한 상품들 가져오기
  const fetchLikedProducts = async () => {
    setIsLoadingLikedProducts(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/likes/my', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const data = await response.json()
        // Like 엔티티에서 PRODUCT 타입의 targetIdx만 추출
        const likedIds: number[] = Array.isArray(data) 
          ? data
              .filter((like: any) => like?.targetType === 'PRODUCT')
              .map((like: any) => Number(like?.targetIdx))
              .filter((id: any) => !isNaN(id))
          : []
        setLikedProductIds(new Set(likedIds))
        const products = []
        
        for (const productId of likedIds) {
          const productResponse = await fetch(`/api/products/${productId}`, {
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          })
          if (productResponse.ok) {
            const productDetail = await productResponse.json()
            products.push({
              ...productDetail.product,
              liked: true
            })
          }
        }
        setLikedProducts(products)
      }
    } catch (error) {
      console.error('좋아요한 상품 가져오기 실패:', error)
    } finally {
      setIsLoadingLikedProducts(false)
    }
  }

  // 좋아요 탭이 선택될 때 좋아요한 상품들 가져오기
  useEffect(() => {
    if (selectedMajorCategory === "좋아요") {
      fetchLikedProducts()
    }
  }, [selectedMajorCategory])

  // 카테고리별 상품 가져오기
  const fetchCategoryProducts = async (major: string, sub?: string) => {
    setIsLoadingCategory(true)
    setSelectedMajorCategory(major)
    setSelectedSubCategory(sub || "")
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // 임시로 모든 상품을 가져와서 프론트엔드에서 필터링
      const response = await fetch('/api/products', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const allProducts = await response.json()
        
        // 프론트엔드에서 필터링
        let filteredProducts = allProducts.filter((product: any) => {
          if (major && product.majorCategory !== major) {
            return false
          }
          if (sub && sub !== "신상" && product.subCategory !== sub) {
            return false
          }
          if (sub === "신상" && !product.isNewProduct) {
            return false
          }
          return true
        })
        
        // 좋아요 상태 반영
        const productsWithLikes = filteredProducts.map((product: any) => ({
          ...product,
          liked: likedProductIds.has(product.productIdx)
        }))
        
        setCategoryProducts(productsWithLikes)
        
        setIsLoadingCategory(false)
      } else {
        console.error('상품 가져오기 실패:', response.status, response.statusText)
        setIsLoadingCategory(false)
      }
    } catch (error) {
      console.error('카테고리 상품 가져오기 실패:', error)
      setIsLoadingCategory(false)
    }
  }

  const addToCody = (product: any) => {
    const position = getCodyPosition(product.category, product.name)
    setCodyItems((prev) => ({
      ...prev,
      [position]: product,
    }))
  }

  const handleViewProductDetail = (product: any) => {
    // 현재 좋아요 상태를 확인하여 상품 정보에 포함
    const productId = product.productIdx || product.id
    const isLiked = productId ? likedProductIds.has(productId) : false
    console.log('상품 상세 열기 - 상품ID:', productId, '좋아요 상태:', isLiked, '전체 좋아요 ID들:', Array.from(likedProductIds)) // 디버깅용
    const productWithLikeStatus = {
      ...product,
      liked: isLiked
    }
    setSelectedProduct(productWithLikeStatus)
    setIsProductDetailOpen(true)
  }

  const handleCloseProductDetail = () => {
    setIsProductDetailOpen(false)
    setSelectedProduct(null)
  }

  const getCodyPosition = (category: string, name: string) => {
    switch (category) {
      case "상의":
        return "top"
      case "아우터":
        return "outer"
      case "하의":
        return "bottom"
      case "신발":
        return "shoes"
      case "가방":
        return "bag"
      case "패션소품":
        if (name.includes("모자")) return "hat"
        return "accessory"
      default:
        return "top"
    }
  }

  const removeCodyItem = (position: string) => {
    setCodyItems((prev) => {
      const newItems = { ...prev }
      delete newItems[position]
      return newItems
    })
  }

  const toggleLike = async (productId: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = new URLSearchParams({ targetIdx: String(productId), targetType: 'PRODUCT' })
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: params.toString(),
      })
      if (response.ok) {
        const data = await response.json() // { liked, count }
        // 서버 응답을 우선으로 상태 업데이트
        setLikedProductIds((prev: Set<number>) => {
          const next = new Set(prev)
          if (data?.liked) next.add(productId); else next.delete(productId)
          // 로컬 스토리지에 백업 저장 (보조 저장소)
          saveLikedProductIds(next)
          return next
        })
        // 좋아요 상태 업데이트 (mockProducts 영역)
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId ? { ...product, liked: !!data?.liked } : product
          )
        )
        // 상세페이지 열려있고 같은 상품이면 동기화
        setSelectedProduct((prev: any) => {
          if (prev && (prev.productIdx === productId || prev.id === productId)) {
            return { ...prev, liked: !!data?.liked }
          }
          return prev
        })
      } else {
        console.error('서버 응답 오류:', response.status)
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      // 에러 발생 시 서버에서 최신 상태를 다시 가져오기
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('/api/likes/my', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (response.ok) {
            const data = await response.json()
            const likedIds: Set<number> = new Set(
              Array.isArray(data) 
                ? data
                    .filter((like: any) => like?.targetType === 'PRODUCT')
                    .map((like: any) => Number(like?.targetIdx))
                    .filter((id: any) => !isNaN(id))
                : []
            )
            setLikedProductIds(likedIds)
            saveLikedProductIds(likedIds)
          }
        } catch (syncError) {
          console.error('상태 동기화 실패:', syncError)
        }
      }
    }
  }

  const toggleCategoryProductLike = async (productId: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const params = new URLSearchParams({ targetIdx: String(productId), targetType: 'PRODUCT' })
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: params.toString(),
      })
      if (response.ok) {
        const data = await response.json() // { liked, count }
        const likedNow = !!data?.liked
        // 카테고리 상품 목록에서 좋아요 상태 업데이트
        setCategoryProducts((prev) =>
          prev.map((product) =>
            product.productIdx === productId ? { ...product, liked: likedNow } : product
          )
        )
        // 상세페이지 열려있고 같은 상품이면 동기화
        setSelectedProduct((prev: any) => {
          if (prev && (prev.productIdx === productId || prev.id === productId)) {
            return { ...prev, liked: likedNow }
          }
          return prev
        })
        // 서버 응답을 우선으로 liked ID 집합 업데이트
        setLikedProductIds((prev: Set<number>) => {
          const next = new Set(prev)
          if (likedNow) next.add(productId); else next.delete(productId)
          console.log('좋아요 상태 업데이트 - 상품ID:', productId, '새로운 상태:', likedNow, '전체 좋아요 ID들:', Array.from(next))
          // 로컬 스토리지에 백업 저장 (보조 저장소)
          saveLikedProductIds(next)
          return next
        })
        // 좋아요 탭에서 롤백
        if (selectedMajorCategory === "좋아요") {
          fetchLikedProducts()
        }
      } else {
        console.error('서버 응답 오류:', response.status)
        if (selectedMajorCategory === "좋아요") {
          fetchLikedProducts()
        }
      }
    } catch (error) {
      console.error('카테고리 상품 좋아요 토글 에러:', error)
      // 에러 발생 시 서버에서 최신 상태를 다시 가져오기
      if (selectedMajorCategory === "좋아요") {
        fetchLikedProducts()
      } else {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const response = await fetch('/api/likes/my', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
              const data = await response.json()
              const likedIds: Set<number> = new Set(
                Array.isArray(data) 
                  ? data
                      .filter((like: any) => like?.targetType === 'PRODUCT')
                      .map((like: any) => Number(like?.targetIdx))
                      .filter((id: any) => !isNaN(id))
                  : []
              )
              setLikedProductIds(likedIds)
              saveLikedProductIds(likedIds)
            }
          } catch (syncError) {
            console.error('상태 동기화 실패:', syncError)
          }
        }
      }
    }
  }

  const filteredProducts = products.filter((product) => {
    if (selectedMajorCategory === "좋아요") {
      return product.liked
    }
    if (selectedMajorCategory && selectedMajorCategory !== "좋아요") {
      return product.category === selectedMajorCategory
    }
    return true
  })

  // 코디 컴포넌트를 재사용 가능하게 분리
  const CodyDisplay = ({ isCompact = false }: { isCompact?: boolean }) => (
    <div
      className={`${isCompact ? "h-full bg-gray-800" : "flex-1 bg-gray-900"} relative flex items-center justify-center`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
      </div>

      {/* Cody Items Positioned */}
      <div className="relative w-full h-full">
        {/* Hat Position */}
        <div className={`absolute ${isCompact ? "top-0" : "top-4"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.hat ? (
            <div className="relative group">
              <img
                src={codyItems.hat.image || "/placeholder.svg"}
                alt={codyItems.hat.name}
                className={`${isCompact ? "w-10 h-10" : "w-16 h-16"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("hat")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-10 h-10" : "w-16 h-16"}`}></div>
          )}
        </div>

        {/* Top Position */}
        <div className={`absolute ${isCompact ? "top-8" : "top-16"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.top ? (
            <div className="relative group">
              <img
                src={codyItems.top.image || "/placeholder.svg"}
                alt={codyItems.top.name}
                className={`${isCompact ? "w-12 h-16" : "w-20 h-24"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("top")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-12 h-16" : "w-20 h-24"}`}></div>
          )}
        </div>

        {/* Bag Position */}
        <div className={`absolute ${isCompact ? "top-14" : "top-24"} left-1/3 transform -translate-x-1/2`}>
          {codyItems.bag ? (
            <div className="relative group">
              <img
                src={codyItems.bag.image || "/placeholder.svg"}
                alt={codyItems.bag.name}
                className={`${isCompact ? "w-10 h-12" : "w-16 h-20"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("bag")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-10 h-12" : "w-16 h-20"}`}></div>
          )}
        </div>

        {/* Shoes Position */}
        <div className={`absolute ${isCompact ? "bottom-1" : "bottom-2"} left-1/2 transform -translate-x-1/2`}>
          {codyItems.shoes ? (
            <div className="relative group">
              <img
                src={codyItems.shoes.image || "/placeholder.svg"}
                alt={codyItems.shoes.name}
                className={`${isCompact ? "w-16 h-10" : "w-24 h-16"} object-contain`}
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute -top-1 -right-1 ${
                  isCompact ? "w-4 h-4" : "w-5 h-5"
                } p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                onClick={() => removeCodyItem("shoes")}
              >
                <X className={`${isCompact ? "w-2 h-2" : "w-3 h-3"}`} />
              </Button>
            </div>
          ) : (
            <div className={`${isCompact ? "w-16 h-10" : "w-24 h-16"}`}></div>
          )}
        </div>
      </div>
    </div>
  )



  return (
    <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Main Cody Display - 카테고리 창이 열렸을 때는 숨김 */}
      {!isProductPanelOpen && <CodyDisplay />}

      {/* Top Navigation Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/my-page')}
          className="bg-white/90 backdrop-blur-sm"
        >
          <User className="w-4 h-4 mr-1" />
          마이페이지
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/community')}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Users className="w-4 h-4 mr-1" />
          커뮤니티
        </Button>
        {/* 제휴사 대시보드 버튼 - PARTNER 또는 ADMIN 권한 */}
        {(userInfo?.role === 'PARTNER' || userInfo?.role === 'ADMIN') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/partner-dashboard')}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Store className="w-4 h-4" />
          </Button>
        )}
        {/* Admin Button - ADMIN 권한만 표시, 제휴 신청 버튼 왼쪽에 배치 */}
        {userInfo?.role === 'ADMIN' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin')}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
        {/* 알림 버튼 */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNotificationOpen(true)}
            className="bg-white/90 backdrop-blur-sm relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </Badge>
            )}
            {/* 연결 상태 표시 */}
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </Button>
          {/* 연결 오류 시 재연결 버튼 */}
          {notificationError && (
            <button
              onClick={reconnect}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors whitespace-nowrap"
            >
              재연결
            </button>
          )}
        </div>
        {/* 제휴 신청 버튼 - 모든 권한에 표시 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/partner-application')}
          className="bg-white/90 backdrop-blur-sm"
        >
          제휴신청
        </Button>
      </div>

      {/* Category Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsProductPanelOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Grid3X3 className="w-4 h-4 mr-1" />
          카테고리
        </Button>
      </div>

      {/* Login Button (temporary for testing) */}
      <div className="absolute bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/login')}
          className="bg-white/90 backdrop-blur-sm"
        >
          로그인
        </Button>
      </div>

      {/* Product Panel */}
      <Sheet open={isProductPanelOpen} onOpenChange={setIsProductPanelOpen}>
        <SheetContent side="bottom" className="h-screen rounded-t-3xl p-0">
          <div className="flex flex-col h-full">
            {/* X 버튼 추가 */}
            <div className="absolute top-2 right-2 z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProductPanelOpen(false)}
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Compact Cody Display at Top */}
            <div className="h-[30%] border-b">
              <CodyDisplay isCompact={true} />
            </div>

            {/* Product Selection Area */}
            <div className="h-[70%] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b bg-white">
                {!isSearchMode ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsSearchMode(true)}>
                        <Search className="w-4 h-4" />
                      </Button>
                      <div className="flex gap-2 overflow-x-auto">
                        {categories.map((category) => (
                          <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => {
                              setSelectedCategory(category)
                              setSelectedMajorCategory("")
                              setSelectedSubCategory("")
                            }}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      전체보기
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="상품 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => setIsSearchMode(false)}
                      autoFocus
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => {
                      setIsSearchMode(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}>
                      취소
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Major Categories */}
                <div className="w-20 bg-gray-50 border-r overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {majorCategories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedMajorCategory === category ? "default" : "ghost"}
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => {
                          setSelectedMajorCategory(category)
                          setSelectedSubCategory("")
                          if (category !== "좋아요") {
                            fetchCategoryProducts(category)
                          }
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                  {isSearchMode && searchQuery.trim() ? (
                    <div className="p-4">
                      {isSearching ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">검색 중...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">검색 결과</h2>
                            <span className="text-sm text-gray-600">{searchResults.length}개 상품</span>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {searchResults.map((product) => (
                              <ProductCard
                                key={product.productIdx}
                                product={product}
                                onViewDetail={handleViewProductDetail}
                                onAddToCody={addToCody}
                                onToggleLike={toggleCategoryProductLike}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">검색 결과가 없습니다.</p>
                        </div>
                      )}
                    </div>
                  ) : selectedMajorCategory === "좋아요" ? (
                    <div className="p-4">
                      {isLoadingLikedProducts ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">좋아요한 상품을 불러오는 중...</p>
                        </div>
                      ) : likedProducts.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">좋아요한 상품</h2>
                            <span className="text-sm text-gray-600">{likedProducts.length}개 상품</span>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {likedProducts.map((product) => (
                              <ProductCard
                                key={product.productIdx}
                                product={product}
                                onViewDetail={handleViewProductDetail}
                                onAddToCody={addToCody}
                                onToggleLike={toggleCategoryProductLike}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">좋아요한 상품이 없습니다.</p>
                        </div>
                      )}
                    </div>
                  ) : selectedMajorCategory &&
                    subCategoryDetails[selectedMajorCategory as keyof typeof subCategoryDetails] &&
                    !selectedSubCategory ? (
                    <div className="p-4">
                      {/* 선택된 카테고리 제목 */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">{selectedMajorCategory}</h2>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          전체보기
                        </Button>
                      </div>

                      {/* 세부 카테고리 그리드 */}
                      <div className="grid grid-cols-3 gap-4">
                        {subCategoryDetails[selectedMajorCategory as keyof typeof subCategoryDetails].map(
                          (subCategory, index) => (
                            <Card 
                              key={index} 
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => {
                                setSelectedSubCategory(subCategory.name)
                                // 현재 선택된 대분류를 직접 사용
                                const currentMajorCategory = selectedMajorCategory || '상의'
                                fetchCategoryProducts(currentMajorCategory, subCategory.name)
                              }}
                            >
                              <CardContent className="p-3 text-center">
                                <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={subCategory.image || "/placeholder.svg"}
                                    alt={subCategory.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="text-xs font-medium">{subCategory.name}</h3>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      {isLoadingCategory ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">상품을 불러오는 중...</p>
                        </div>
                      ) : categoryProducts.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">
                              {selectedMajorCategory}
                              {selectedSubCategory && ` > ${selectedSubCategory}`}
                            </h2>
                            <span className="text-sm text-gray-600">{categoryProducts.length}개 상품</span>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {categoryProducts.map((product) => (
                              <ProductCard
                                key={product.productIdx}
                                product={product}
                                onViewDetail={handleViewProductDetail}
                                onAddToCody={addToCody}
                                onToggleLike={toggleCategoryProductLike}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {filteredProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={{
                                productIdx: product.id,
                                productName: product.name,
                                productContent: product.description || '',
                                productPrice: parseInt(product.price.replace(/[^\d]/g, '')) || 0,
                                productImage: product.image,
                                majorCategory: product.category || '상의',
                                subCategory: '',
                                liked: product.liked
                              }}
                              onViewDetail={handleViewProductDetail}
                              onAddToCody={addToCody}
                              onToggleLike={toggleLike}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* My Page */}
      {/* <MyPage open={isMyPageOpen} onOpenChange={setIsMyPageOpen} /> */}

      {/* Social Login Page */}
      {/* <SocialLoginPage
        open={isSocialLoginOpen} 
        onOpenChange={setIsSocialLoginOpen} 
        onSwitchToSignup={() => {}}
      /> */}

      {/* Admin Page */}
      {/* <AdminPage isOpen={isAdminPageOpen} onClose={() => setIsAdminPageOpen(false)} userRole={userInfo?.role} /> */}

      {/* Partner Page */}
      {/* <PartnerMainPage isOpen={isPartnerPageOpen} onClose={() => setIsPartnerPageOpen(false)} userRole={userInfo?.role} /> */}

      {/* Partner Application Page */}
      {/* <PartnerApplicationStandalone isOpen={isPartnerApplicationOpen} onClose={() => setIsPartnerApplicationOpen(false)} /> */}

      {/* Product Detail Page */}
      {isProductDetailOpen && selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={handleCloseProductDetail}
          onAddToCody={addToCody}
          onToggleLike={toggleCategoryProductLike}
        />
      )}

      {/* Notification Page */}
      <NotificationPage
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

    </div>
  )
}
