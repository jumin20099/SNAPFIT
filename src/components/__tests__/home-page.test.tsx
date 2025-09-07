import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { HomePage } from '../home-page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Bell: () => <div data-testid="bell-icon">Bell</div>,
  ShoppingBag: () => <div data-testid="shopping-bag-icon">ShoppingBag</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  Grid3X3: () => <div data-testid="grid-icon">Grid3X3</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  User: () => <div data-testid="user-icon">User</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}))

// Mock all ui components to avoid complex dependencies
jest.mock('../ui/StickyHeader', () => ({
  StickyHeader: () => <div data-testid="sticky-header">SNAPFIT</div>
}))

jest.mock('../ui/HeroBanner', () => ({
  HeroBanner: () => <div data-testid="hero-banner">Hero Banner</div>
}))

jest.mock('../ui/MainCategoryChips', () => ({
  MainCategoryChips: () => (
    <div data-testid="category-chips">
      <button>전체</button>
      <button>상의</button>
      <button>아우터</button>
    </div>
  )
}))

jest.mock('../ui/ProductGrid', () => ({
  ProductGrid: () => <div data-testid="product-grid">Product Grid</div>
}))

jest.mock('../ui/BottomTabBar', () => ({
  BottomTabBar: () => (
    <div data-testid="bottom-tab-bar">
      <button>좋아요</button>
      <button>커뮤니티</button>
      <button>홈</button>
      <button>장바구니</button>
      <button>마이</button>
    </div>
  )
}))

describe('HomePage', () => {
  it('renders SNAPFIT header', () => {
    render(<HomePage />)
    expect(screen.getByTestId('sticky-header')).toBeInTheDocument()
    expect(screen.getByText('SNAPFIT')).toBeInTheDocument()
  })

  it('renders hero banner', () => {
    render(<HomePage />)
    expect(screen.getByTestId('hero-banner')).toBeInTheDocument()
  })

  it('renders category chips', () => {
    render(<HomePage />)
    expect(screen.getByTestId('category-chips')).toBeInTheDocument()
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('상의')).toBeInTheDocument()
    expect(screen.getByText('아우터')).toBeInTheDocument()
  })

  it('renders product grid', () => {
    render(<HomePage />)
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('renders bottom tab bar', () => {
    render(<HomePage />)
    expect(screen.getByTestId('bottom-tab-bar')).toBeInTheDocument()
    expect(screen.getByText('좋아요')).toBeInTheDocument()
    expect(screen.getByText('커뮤니티')).toBeInTheDocument()
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('장바구니')).toBeInTheDocument()
    expect(screen.getByText('마이')).toBeInTheDocument()
  })
})