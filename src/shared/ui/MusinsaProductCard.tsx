import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { MusinsaCard } from './MusinsaCard';
import { MusinsaButton } from './MusinsaButton';
import { MusinsaBadge } from './MusinsaBadge';
import { OptimizedImage, ImagePresets } from './OptimizedImage';

interface MusinsaProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    category: string;
    brand: string;
    tags?: string[];
    isLiked?: boolean;
    likeCount?: number;
    discountRate?: number;
    isNew?: boolean;
    isBest?: boolean;
  };
  onLike?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onView?: (productId: string) => void;
  onClick?: (productId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const MusinsaProductCard = forwardRef<HTMLDivElement, MusinsaProductCardProps>(
  ({ 
    className,
    product,
    onLike,
    onAddToCart,
    onView,
    onClick,
    showActions = true,
    variant = 'default',
    ...props 
  }, ref) => {
    const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      onLike?.(product.id);
    };
    
    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart?.(product.id);
    };
    
    const handleView = (e: React.MouseEvent) => {
      e.stopPropagation();
      onView?.(product.id);
    };
    
    const handleCardClick = () => {
      onClick?.(product.id);
    };
    
    const formatPrice = (price: number) => {
      return `₩${price.toLocaleString()}`;
    };
    
    const getDiscountRate = () => {
      if (product.discountRate) return product.discountRate;
      if (product.originalPrice && product.originalPrice > product.price) {
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      }
      return 0;
    };
    
    const discountRate = getDiscountRate();
    
    const cardClasses = cn(
      'group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
      variant === 'compact' && 'h-64',
      variant === 'detailed' && 'h-80',
      className
    );
    
    return (
      <MusinsaCard
        className={cardClasses}
        onClick={handleCardClick}
        ref={ref}
        {...props}
      >
        {/* 이미지 영역 */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.name}
            {...ImagePresets.productCard}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* 배지 */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <MusinsaBadge variant="error" size="sm">
                NEW
              </MusinsaBadge>
            )}
            {product.isBest && (
              <MusinsaBadge variant="warning" size="sm">
                BEST
              </MusinsaBadge>
            )}
            {discountRate > 0 && (
              <MusinsaBadge variant="error" size="sm">
                {discountRate}%
              </MusinsaBadge>
            )}
          </div>
          
          {/* 액션 버튼들 */}
          {showActions && (
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <MusinsaButton
                size="sm"
                variant="ghost"
                onClick={handleLike}
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
              >
                <Heart 
                  className={cn(
                    'w-4 h-4',
                    product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  )} 
                />
              </MusinsaButton>
              
              <MusinsaButton
                size="sm"
                variant="ghost"
                onClick={handleView}
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </MusinsaButton>
            </div>
          )}
        </div>
        
        {/* 상품 정보 */}
        <div className="p-3">
          {/* 브랜드 */}
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          
          {/* 상품명 */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {/* 가격 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* 태그 */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.tags.slice(0, 2).map((tag, index) => (
                <MusinsaBadge key={index} variant="secondary" size="sm">
                  {tag}
                </MusinsaBadge>
              ))}
            </div>
          )}
          
          {/* 좋아요 수 */}
          {product.likeCount && product.likeCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Heart className="w-3 h-3" />
              <span>{product.likeCount}</span>
            </div>
          )}
        </div>
        
        {/* 하단 액션 버튼 */}
        {showActions && variant === 'detailed' && (
          <div className="p-3 pt-0">
            <MusinsaButton
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              className="w-full"
              icon={<ShoppingBag className="w-4 h-4" />}
            >
              장바구니
            </MusinsaButton>
          </div>
        )}
      </MusinsaCard>
    );
  }
);

MusinsaProductCard.displayName = 'MusinsaProductCard';
