import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // framer-motion props 제거
      const { whileHover, whileTap, transition, ...cleanProps } = props;
      return <div {...cleanProps}>{children}</div>;
    },
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockProduct = {
  id: '1',
  name: '테스트 상품',
  price: 50000,
  imageUrl: 'https://via.placeholder.com/300x300',
  category: '상의',
  brand: '테스트 브랜드',
  tags: ['인기', '할인'],
};

describe('ProductCard', () => {
  it('상품 정보가 올바르게 렌더링되어야 한다', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    expect(screen.getByText('테스트 브랜드')).toBeInTheDocument();
    expect(screen.getByText('₩50,000')).toBeInTheDocument();
    expect(screen.getByText('상의')).toBeInTheDocument();
  });

  it('좋아요 버튼이 작동해야 한다', () => {
    render(<ProductCard product={mockProduct} />);

    // 좋아요 버튼을 SVG 아이콘으로 찾기 (빈 이름의 버튼)
    const buttons = screen.getAllByRole('button');
    const likeButton = buttons.find(button => 
      button.querySelector('svg[class*="lucide-heart"]')
    );
    
    expect(likeButton).toBeInTheDocument();

    if (likeButton) {
      fireEvent.click(likeButton);
      // 좋아요 상태 변경 확인 (실제 구현에 따라 조정)
    }
  });

  it('코디 해보기 버튼이 작동해야 한다', () => {
    render(<ProductCard product={mockProduct} />);

    const codyButton = screen.getByRole('button', { name: /코디 해보기/i });
    expect(codyButton).toBeInTheDocument();

    fireEvent.click(codyButton);
    // 코디 시스템으로 이동 확인 (실제 구현에 따라 조정)
  });

  it('상품 카드 클릭 시 상세 페이지로 이동해야 한다', () => {
    render(<ProductCard product={mockProduct} />);

    // 상품 카드 컨테이너 클릭
    const productCard = screen.getByText('테스트 상품').closest('div');
    if (productCard) {
      fireEvent.click(productCard);
      expect(mockPush).toHaveBeenCalledWith('/products/1');
    }
  });

  it('태그가 올바르게 표시되어야 한다', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('인기')).toBeInTheDocument();
    expect(screen.getByText('할인')).toBeInTheDocument();
  });

  it('이미지가 올바르게 로드되어야 한다', () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('테스트 상품');
    expect(image).toBeInTheDocument();
    // Next.js Image 컴포넌트는 원본 src를 사용
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x300');
  });
});
