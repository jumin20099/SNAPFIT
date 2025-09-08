'use client';

import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/shared/ui/OptimizedImage';
import { CodyItem } from '@/entities/cody/model';
import { cn } from '@/lib/utils';

interface CodyBuilderPanelProps {
  codyItems: Partial<Record<string, CodyItem>>;
  availableProducts: any[];
  loading: boolean;
  selectedCategory: string;
  selectedSubCategory: string;
  onCategoryChange: (major: string, sub?: string) => void;
  onItemSelect: (product: any) => void;
  onItemRemove: (slot: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function CodyBuilderPanel({
  codyItems,
  availableProducts,
  loading,
  selectedCategory,
  selectedSubCategory,
  onCategoryChange,
  onItemSelect,
  onItemRemove,
  onSave,
  onClose,
}: CodyBuilderPanelProps) {
  const categories = ['전체', '상의', '아우터', '바지', '신발', '가방', '패션소품'];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">코디 시스템</h1>
        </div>
        <Button onClick={onSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
          저장
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Cody Display Area */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          </div>

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <h2 className="text-white text-lg font-bold bg-black/50 px-4 py-2 rounded-lg">
              {"<나의 코디>"}
            </h2>
          </div>

          {/* Cody Items */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Hat Position */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
              {codyItems.hat ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.hat.image}
                    alt={codyItems.hat.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('hat')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Outer Position */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
              {codyItems.outer ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.outer.image}
                    alt={codyItems.outer.name}
                    width={140}
                    height={180}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('outer')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-35 h-45 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* Top Position */}
            <div className="absolute top-48 left-1/2 transform -translate-x-1/2">
              {codyItems.top ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.top.image}
                    alt={codyItems.top.name}
                    width={128}
                    height={160}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('top')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-40 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* Bottom Position */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              {codyItems.bottom ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.bottom.image}
                    alt={codyItems.bottom.name}
                    width={96}
                    height={112}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('bottom')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-28 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Shoes Position */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              {codyItems.shoes ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.shoes.image}
                    alt={codyItems.shoes.name}
                    width={112}
                    height={80}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('shoes')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-28 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Bag Position (좌측) */}
            <div className="absolute top-40 left-8">
              {codyItems.bag ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.bag.image}
                    alt={codyItems.bag.name}
                    width={60}
                    height={80}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('bag')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-15 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>

            {/* Necklace Position (목 부분) */}
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2">
              {codyItems.necklace ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.necklace.image}
                    alt={codyItems.necklace.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('necklace')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-10 h-10 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>

            {/* Ring Position (우측 하단) */}
            <div className="absolute bottom-20 right-8">
              {codyItems.ring ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.ring.image}
                    alt={codyItems.ring.name}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('ring')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-8 h-8 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>

            {/* Bracelet Position (좌측 하단) */}
            <div className="absolute bottom-20 left-8">
              {codyItems.bracelet ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.bracelet.image}
                    alt={codyItems.bracelet.name}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('bracelet')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-8 h-8 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>

            {/* Accessory Position (우측 상단) */}
            <div className="absolute top-20 right-8">
              {codyItems.accessory ? (
                <div className="relative group">
                  <OptimizedImage
                    src={codyItems.accessory.image}
                    alt={codyItems.accessory.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onItemRemove('accessory')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-10 h-10 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Selection Panel */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Category Filter */}
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                로딩 중...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableProducts.map((product) => (
                  <Card 
                    key={product.productIdx} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onItemSelect(product)}
                  >
                    <CardContent className="p-3">
                      <OptimizedImage
                        src={product.productImage}
                        alt={product.productName}
                        width={120}
                        height={80}
                        className="w-full h-20 object-contain mb-2 bg-gray-50 rounded"
                      />
                      <h4 className="text-xs font-medium truncate">{product.productName}</h4>
                      <p className="text-xs text-gray-600">{product.majorCategory}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
