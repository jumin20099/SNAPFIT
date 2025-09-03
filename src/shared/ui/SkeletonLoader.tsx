import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function SkeletonLoader({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              'h-4 rounded',
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ width, height }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('space-y-3', className)}>
        <div
          className={cn(baseClasses, 'rounded-lg')}
          style={{ width: width || '100%', height: height || 200 }}
        />
        <div className="space-y-2">
          <div className={cn(baseClasses, 'h-4 rounded w-3/4')} />
          <div className={cn(baseClasses, 'h-3 rounded w-1/2')} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, 'rounded', className)}
      style={{ width, height }}
    />
  );
}

// 상품 카드 스켈레톤
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <SkeletonLoader variant="rectangular" height={200} className="rounded-lg" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" lines={2} />
        <SkeletonLoader variant="text" lines={1} className="w-1/2" />
      </div>
    </div>
  );
}

// 그리드 스켈레톤
export function ProductGridSkeleton({ 
  count = 8, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
