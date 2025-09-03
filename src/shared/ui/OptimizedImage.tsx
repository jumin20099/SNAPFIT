import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          fill ? 'w-full h-full' : '',
          className
        )}
        style={fill ? {} : { width, height }}
      >
        <span className="text-gray-400 text-sm">이미지 로드 실패</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={fill ? {} : { width, height }}
        />
      )}
    </div>
  );
}

// 자주 사용되는 이미지 크기 프리셋
export const ImagePresets = {
  productCard: {
    width: 320,
    height: 320,
    sizes: '(max-width: 768px) 45vw, 320px',
  },
  productDetail: {
    width: 600,
    height: 600,
    sizes: '(max-width: 768px) 90vw, 600px',
  },
  avatar: {
    width: 40,
    height: 40,
    sizes: '40px',
  },
  codyItem: {
    width: 80,
    height: 80,
    sizes: '80px',
  },
} as const;
