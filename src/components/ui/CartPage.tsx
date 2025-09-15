'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useRecentProducts } from '@/hooks/useRecentProducts'
import { usePortOnePayment } from '@/hooks/usePortOnePayment'
import dynamic from 'next/dynamic'

interface CartItem {
  id: string
  productId: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  quantity: number
  size?: string
  color?: string
  shippingInfo?: string
  isLiked?: boolean
}

interface RecentProduct {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  shippingInfo?: string
  rating?: number
  reviewCount?: number
  badge?: string
  isLiked?: boolean
}

export function CartPage() {
  const router = useRouter()
  const { items: cartItems, addItem, removeItem, updateQuantity, clear } = useCart()
  const { recentProducts, addRecentProduct } = useRecentProducts()
  const { requestPayment, isLoading: isPaymentLoading, error: paymentError } = usePortOnePayment()
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    setIsLoading(false) // 최근 본 상품은 훅에서 관리하므로 로딩 완료
    
    // 로그인 상태 확인 및 사용자 정보 가져오기
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
      
      if (token) {
        try {
          const response = await fetch('http://localhost:8080/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          }
        } catch (error) {
          console.error('사용자 정보 가져오기 실패:', error)
        }
      }
    }
    
    checkLoginStatus()
    
    // 로그인 상태 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkLoginStatus()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 장바구니 데이터는 CartContext에서 가져옴
  // CartContext의 데이터를 CartPage 형식에 맞게 변환
  const transformedCartItems: CartItem[] = cartItems.map(item => ({
    id: item.id.toString(),
    productId: item.id.toString(),
    name: item.name,
    brand: 'SNAPFIT', // 기본 브랜드
    price: item.price,
    imageUrl: item.image,
    quantity: item.quantity,
    isLiked: likedProducts.has(item.id.toString()) // 실제 좋아요 상태 반영
  }))


  // 상품 보러 가기
  const goToProducts = () => {
    router.push('/')
  }

  // 상품 상세 페이지로 이동
  const goToProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  // 총 금액 계산
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // 구매하기 버튼 클릭
  const handlePurchase = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!user) {
      alert('사용자 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // 바로 결제 진행 (사용자 정보 자동 입력)
    await processPayment()
  }

  // 결제 진행 (사용자 정보 자동 입력)
  const processPayment = async () => {
    try {
      // 1. 주문 생성
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: calculateTotal(),
          customerInfo: {
            name: user.nickname || '사용자',
            email: user.email || '',
            phone: user.phone || ''
          }
        })
      })

      if (!orderResponse.ok) {
        throw new Error('주문 생성에 실패했습니다.')
      }

      const { orderId } = await orderResponse.json()

      // 2. 포트원 카카오페이 결제 요청
      const paymentResult = await requestPayment({
        orderId,
        orderName: cartItems.length === 1 
          ? cartItems[0].name 
          : `${cartItems[0].name} 외 ${cartItems.length - 1}개`,
        totalAmount: calculateTotal(),
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })

      if (paymentResult.success) {
        // 3. 결제 성공 시 장바구니 비우기
        clear()
        alert('결제가 완료되었습니다!')
        router.push(`/orders/${orderId}/success`)
      } else {
        alert(paymentResult.error || '결제에 실패했습니다.')
      }
    } catch (error) {
      console.error('결제 오류:', error)
      alert('결제 중 오류가 발생했습니다.')
    }
  }

  // 수량 증가
  const increaseQuantity = (item: any) => {
    const productId = parseInt(item.id)
    const currentItem = cartItems.find(cartItem => cartItem.id === productId)
    if (currentItem) {
      updateQuantity(productId, currentItem.quantity + 1)
    }
  }

  // 수량 감소
  const decreaseQuantity = (item: any) => {
    const productId = parseInt(item.id)
    const currentItem = cartItems.find(cartItem => cartItem.id === productId)
    if (currentItem) {
      if (currentItem.quantity > 1) {
        updateQuantity(productId, currentItem.quantity - 1)
      } else {
        removeItem(productId) // 수량이 1이면 완전히 제거
      }
    }
  }

  // 아이템 삭제
  const deleteItem = (item: any) => {
    const productId = parseInt(item.id)
    removeItem(productId)
  }

  // 좋아요 토글
  const toggleLike = async (productId: string) => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    if (!token) {
      alert('좋아요 기능을 사용하려면 로그인이 필요합니다.')
      return
    }
    
    try {
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          targetIdx: parseInt(productId),
          targetType: 'PRODUCT'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // 좋아요 상태 업데이트
        setLikedProducts(prev => {
          const newSet = new Set(prev)
          if (data.liked) {
            newSet.add(productId)
          } else {
            newSet.delete(productId)
          }
          return newSet
        })
        
        // 최근 본 상품은 훅에서 관리하므로 별도 업데이트 불필요
        // 좋아요 상태만 로컬에서 관리
      } else {
        console.error('좋아요 토글 실패:', response.status)
        if (response.status === 401) {
          alert('로그인이 필요합니다.')
        }
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
    }
  }

  // Hydration 오류 방지를 위한 로딩 상태
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2">
                <ArrowLeft size={20} className="text-gray-700" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">장바구니</h1>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">로딩 중...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">장바구니</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 장바구니가 비어있을 때 */}
        {transformedCartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              장바구니에 담긴 상품이 없어요
            </h2>
            <p className="text-gray-500 mb-8">
              원하는 상품을 담아보세요
            </p>
            <button
              onClick={goToProducts}
              className="bg-gray-900 text-white px-8 py-4 angular-button font-medium hover:bg-gray-800 transition-colors"
            >
              상품 보러 가기
            </button>
          </div>
        ) : (
          /* 장바구니에 상품이 있을 때 */
          <div className="space-y-4">
            {transformedCartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white angular-card p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => goToProduct(item.productId)}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 angular-rounded flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover angular-rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-xs text-gray-500 mb-1">사이즈: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-xs text-gray-500 mb-2">색상: {item.color}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(item.productId)
                        }}
                        disabled={!isLoggedIn}
                        className={`p-1 angular-rounded transition-colors ${
                          !isLoggedIn 
                            ? 'cursor-not-allowed opacity-50' 
                            : 'hover:bg-gray-100'
                        }`}
                        title={!isLoggedIn ? '로그인이 필요합니다' : ''}
                      >
                        <Heart
                          size={16}
                          className={item.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {item.discountRate && (
                          <span className="text-sm font-bold text-red-500">
                            {item.discountRate}%
                          </span>
                        )}
                        <span className="text-base font-bold text-gray-900">
                          {item.price.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            decreaseQuantity(item)
                          }}
                          className="w-6 h-6 bg-gray-100 angular-rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            increaseQuantity(item)
                          }}
                          className="w-6 h-6 bg-gray-100 angular-rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 총 금액 및 구매하기 버튼 */}
            <div className="bg-white angular-card p-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">총 금액</span>
                <span className="text-xl font-bold text-gray-900">
                  {calculateTotal().toLocaleString()}원
                </span>
              </div>
              <button
                onClick={handlePurchase}
                disabled={isPaymentLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaymentLoading ? '결제 진행 중...' : '카카오페이로 구매하기'}
              </button>
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="my-8 border-t border-gray-200"></div>

        {/* 최근 본 상품 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최근 본 상품</h2>
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors angular-button px-2 py-1">
              더보기
              <ChevronRight size={16} />
            </button>
          </div>

          {recentProducts.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-32 cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => goToProduct(product.id)}
                >
                  <div className="relative">
                    <div className="w-32 h-40 bg-gray-100 angular-rounded overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 뱃지 */}
                    {product.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 angular-rounded">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* 좋아요 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(product.id)
                      }}
                      disabled={!isLoggedIn}
                      className={`absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center ${
                        !isLoggedIn ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      title={!isLoggedIn ? '로그인이 필요합니다' : ''}
                    >
                      <Heart
                        size={12}
                        className={likedProducts.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{product.brand}</span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-1 angular-rounded">M</span>
                    </div>
                    <p className="text-xs text-gray-900 line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">
                        {product.price.toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{product.shippingInfo}</p>
                    {product.rating && (
                      <p className="text-xs text-gray-500">
                        ★{product.rating}({product.reviewCount})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👀</div>
              <p className="text-gray-500 text-sm">최근 본 상품이 없습니다</p>
              <p className="text-gray-400 text-xs mt-1">상품을 둘러보시면 여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
