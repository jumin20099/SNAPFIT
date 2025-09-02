import { render, screen } from '@testing-library/react'
import { HomePage } from '../home-page'
import { useProductStore } from '@/stores/product-store'

// Mock the product store
jest.mock('@/stores/product-store')

const mockUseProductStore = useProductStore as jest.MockedFunction<typeof useProductStore>

describe('HomePage', () => {
  beforeEach(() => {
    mockUseProductStore.mockReturnValue({
      products: [
        {
          id: '1',
          name: 'Test Product 1',
          category: '상의',
          price: 50000,
          image: '/test1.jpg',
          description: 'Test description 1'
        },
        {
          id: '2',
          name: 'Test Product 2',
          category: '하의',
          price: 30000,
          image: '/test2.jpg',
          description: 'Test description 2'
        }
      ],
      isLoading: false,
      fetchProducts: jest.fn()
    })
  })

  it('renders search bar', () => {
    render(<HomePage />)
    expect(screen.getByPlaceholderText('상품이나 스타일을 검색해보세요')).toBeInTheDocument()
  })

  it('renders category chips', () => {
    render(<HomePage />)
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('상의')).toBeInTheDocument()
    expect(screen.getByText('하의')).toBeInTheDocument()
  })

  it('renders product grid', () => {
    render(<HomePage />)
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseProductStore.mockReturnValue({
      products: [],
      isLoading: true,
      fetchProducts: jest.fn()
    })
    
    render(<HomePage />)
    expect(screen.getByText('추천 상품')).toBeInTheDocument()
  })

  it('shows no products message when empty', () => {
    mockUseProductStore.mockReturnValue({
      products: [],
      isLoading: false,
      fetchProducts: jest.fn()
    })
    
    render(<HomePage />)
    expect(screen.getByText('표시할 상품이 없습니다')).toBeInTheDocument()
  })
})
