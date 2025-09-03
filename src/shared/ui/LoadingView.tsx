import { cn } from '@/lib/utils';

interface LoadingViewProps {
  message?: string;
  className?: string;
  variant?: 'page' | 'component' | 'inline' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingView({
  message = '로딩 중...',
  className,
  variant = 'page',
  size = 'md',
}: LoadingViewProps) {
  const isPage = variant === 'page';
  const isComponent = variant === 'component';
  const isInline = variant === 'inline';
  const isSkeleton = variant === 'skeleton';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (isInline) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size])} />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    );
  }

  if (isComponent) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6', className)}>
        <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-3', sizeClasses[size])} />
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  if (isSkeleton) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-[400px] flex items-center justify-center p-8', className)}>
      <div className="text-center">
        <div className={cn('animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4', sizeClasses[size])} />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// 특정 상황별 로딩 뷰
export function PageLoadingView({ className }: { className?: string }) {
  return (
    <LoadingView
      message="페이지를 불러오는 중..."
      variant="page"
      size="lg"
      className={className}
    />
  );
}

export function DataLoadingView({ className }: { className?: string }) {
  return (
    <LoadingView
      message="데이터를 불러오는 중..."
      variant="component"
      size="md"
      className={className}
    />
  );
}

export function ActionLoadingView({ className }: { className?: string }) {
  return (
    <LoadingView
      message="처리 중..."
      variant="inline"
      size="sm"
      className={className}
    />
  );
}

// 스켈레톤 로딩 뷰
export function SkeletonLoadingView({ className }: { className?: string }) {
  return (
    <LoadingView
      variant="skeleton"
      className={className}
    />
  );
}
