import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_MAP } from '@/constants/category-map';

interface Product {
  productIdx: number;
  productName: string;
  productContent: string;
  productPrice: number;
  productImage: string;
  majorCategory: string;
  subCategory: string;
  storeIdx: number;
  storeName?: string;
}

interface CategoryTabProps {
  onSelect: (major: string, sub?: string) => void;
  onProductSelect?: (product: Product) => void;
  className?: string;
}

type SearchType = 'category' | 'product' | 'all';

const SEARCH_TYPES = [
  { value: 'category', label: '카테고리' },
  { value: 'product', label: '상품' },
  { value: 'all', label: '전체' },
] as const;

export default function CategoryTab({ onSelect, onProductSelect, className }: CategoryTabProps) {
  // 전체 카테고리에서 메이저 카테고리들을 가져옴
  const majors = Object.keys(CATEGORY_MAP.전체);
  const [activeMajor, setActiveMajor] = useState<string>(majors[0]);
  const [activeSub, setActiveSub] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearchType, setShowSearchType] = useState(false);

  // 검색어에 따른 카테고리 필터링
  const getFilteredCategories = () => {
    if (!searchQuery.trim() || searchType === 'product') {
      return {
        majors: majors,
        subs: (CATEGORY_MAP.전체 as any)[activeMajor] || []
      };
    }

    const query = searchQuery.toLowerCase();
    const filteredMajors: string[] = [];
    const filteredSubs: string[] = [];

    // 메이저 카테고리 검색
    majors.forEach(major => {
      if (major.toLowerCase().includes(query)) {
        filteredMajors.push(major);
      }
    });

    // 서브 카테고리 검색
    majors.forEach(major => {
      const subs = (CATEGORY_MAP.전체 as any)[major] || [];
      subs.forEach((sub: string) => {
        if (sub.toLowerCase().includes(query)) {
          if (!filteredMajors.includes(major)) {
            filteredMajors.push(major);
          }
          filteredSubs.push(sub);
        }
      });
    });

    return {
      majors: filteredMajors,
      subs: filteredSubs
    };
  };

  // 상품 검색 실행
  const performProductSearch = async () => {
    if (!searchQuery.trim() || searchType === 'category') {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        keyword: searchQuery.trim(),
        type: 'all',
      });

      const response = await fetch(`/api/products/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('검색에 실패했습니다.');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('검색 오류:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경 시 디바운스 적용
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      if (searchType === 'product' || searchType === 'all') {
        const timer = setTimeout(() => {
          performProductSearch();
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setProducts([]);
    }
  };

  const { majors: filteredMajors, subs: filteredSubs } = getFilteredCategories();

  const selectMajor = (m: string) => {
    setActiveMajor(m);
    setActiveSub('');
    onSelect(m);
  };

  const selectSub = (s: string) => {
    setActiveSub(s);
    onSelect(activeMajor, s);
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (!isSearchMode) {
      setSearchQuery('');
      setProducts([]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 검색 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">카테고리 & 검색</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSearchMode}
          className="p-1 h-8 w-8"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* 검색 입력 필드 */}
      {isSearchMode && (
        <div className="space-y-3">
          <div className="relative">
            <Input
              placeholder="카테고리 또는 상품 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchType(!showSearchType)}
                className="p-1 h-6 w-6"
              >
                <Filter className="w-3 h-3" />
              </Button>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* 검색 타입 선택 */}
          {showSearchType && (
            <div className="flex flex-wrap gap-2">
              {SEARCH_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={searchType === type.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchType(type.value as SearchType);
                    setShowSearchType(false);
                  }}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          )}

          {/* 현재 검색 타입 표시 */}
          {!showSearchType && searchType !== 'all' && (
            <div className="text-xs text-gray-500">
              검색 범위: {SEARCH_TYPES.find(t => t.value === searchType)?.label}
            </div>
          )}
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {isSearchMode && searchQuery.trim() && filteredMajors.length === 0 && searchType !== 'product' && (
        <div className="text-center py-4 text-gray-500 text-sm">
          검색 결과가 없습니다
        </div>
      )}

      {/* 메이저 카테고리 */}
      {filteredMajors.length > 0 && searchType !== 'product' && (
        <div className="flex gap-2">
          {filteredMajors.map((m) => (
            <button
              key={m}
              className={cn(
                'px-4 py-2 rounded-full text-sm',
                activeMajor === m ? 'bg-black text-white' : 'bg-gray-200'
              )}
              onClick={() => selectMajor(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* 서브 카테고리 */}
      {!isSearchMode && (CATEGORY_MAP.전체 as any)[activeMajor] && searchType !== 'product' && (
        <div className="flex gap-2 overflow-x-auto">
          {(CATEGORY_MAP.전체 as any)[activeMajor]?.map((sub: string) => (
            <button
              key={sub}
              className={cn(
                'px-3 py-1 rounded-full text-xs whitespace-nowrap',
                activeSub === sub ? 'bg-blue-600 text-white' : 'bg-gray-100'
              )}
              onClick={() => selectSub(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 검색 모드일 때 서브 카테고리 표시 */}
      {isSearchMode && searchQuery.trim() && filteredSubs.length > 0 && searchType !== 'product' && (
        <div className="flex gap-2 overflow-x-auto">
          {filteredSubs.map((sub: string) => (
            <button
              key={sub}
              className={cn(
                'px-3 py-1 rounded-full text-xs whitespace-nowrap',
                activeSub === sub ? 'bg-blue-600 text-white' : 'bg-gray-100'
              )}
              onClick={() => selectSub(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 상품 검색 결과 */}
      {isSearchMode && searchQuery.trim() && (searchType === 'product' || searchType === 'all') && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              검색 중...
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <Card
                  key={product.productIdx}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <img
                        src={product.productImage || "/placeholder.svg"}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {product.productName}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {product.productContent}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {product.majorCategory}
                          </Badge>
                          {product.subCategory && (
                            <Badge variant="outline" className="text-xs">
                              {product.subCategory}
                            </Badge>
                          )}
                          {product.storeName && (
                            <Badge variant="outline" className="text-xs">
                              {product.storeName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ₩{product.productPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
} 