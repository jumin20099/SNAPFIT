import { create } from 'zustand'

export interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
  brand: string
  tags: string[]
}

interface ProductStore {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  getProductsByCategory: (category: string) => Product[]
  searchProducts: (query: string) => Product[]
}

// 실제 API에서 데이터를 가져오는 함수
const fetchProductsFromAPI = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products')
    if (!response.ok) {
      throw new Error('상품을 불러오는데 실패했습니다')
    }
    const data = await response.json()
    return data.map((item: any) => ({
      id: item.productIdx?.toString() || item.id?.toString(),
      name: item.productName || item.name || '상품명 없음',
      price: item.productPrice || item.price || 0,
      imageUrl: item.productImage || item.imageUrl || '/placeholder.svg',
      category: item.majorCategory || item.category || '카테고리 없음',
      brand: item.storeName || item.brand || '브랜드 없음',
      tags: item.tags || []
    }))
  } catch (error) {
    console.error('상품 API 호출 실패:', error)
    // API 실패 시 기본 데이터 반환
    return [
      {
        id: '1',
        name: '베이직 오버사이즈 티셔츠',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        category: 'top',
        brand: 'SNAP FIT',
        tags: ['베이직', '오버사이즈', '데일리']
      },
      {
        id: '2',
        name: '하이웨이스트 데님 팬츠',
        price: 89000,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
        category: 'bottom',
        brand: 'SNAP FIT',
        tags: ['하이웨이스트', '데님', '캐주얼']
      }
    ]
  }
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const products = await fetchProductsFromAPI()
      set({ 
        products, 
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '상품을 불러오는데 실패했습니다', 
        isLoading: false 
      })
    }
  },

  getProductsByCategory: (category: string) => {
    const { products } = get()
    if (category === 'for-you') return products
    return products.filter(product => product.category === category)
  },

  searchProducts: (query: string) => {
    const { products } = get()
    const lowerQuery = query.toLowerCase()
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
}))
