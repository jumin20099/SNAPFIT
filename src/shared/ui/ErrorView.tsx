import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorViewProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  variant?: 'page' | 'component' | 'inline';
}

export function ErrorView({
  title = '문제가 발생했습니다',
  message = '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  error,
  onRetry,
  onGoHome,
  onGoBack,
  className,
  variant = 'page',
}: ErrorViewProps) {
  const isPage = variant === 'page';
  const isComponent = variant === 'component';
  const isInline = variant === 'inline';

  if (isInline) {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded', className)}>
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-700">{message}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="ml-auto text-red-700 hover:text-red-800"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  if (isComponent) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('min-h-[400px] flex items-center justify-center p-8', className)}>
      <div className="text-center max-w-md">
        <div className="mb-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          )}
          
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지로
            </Button>
          )}
          
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              홈으로 이동
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            페이지 새로고침
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              개발자 정보
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// 특정 상황별 에러 뷰
export function NetworkErrorView({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorView
      title="네트워크 연결 오류"
      message="인터넷 연결을 확인하고 다시 시도해주세요."
      onRetry={onRetry}
      className={className}
    />
  );
}

export function NotFoundErrorView({ onGoHome, className }: { onGoHome?: () => void; className?: string }) {
  return (
    <ErrorView
      title="페이지를 찾을 수 없습니다"
      message="요청하신 페이지가 존재하지 않거나 이동되었습니다."
      onGoHome={onGoHome}
      className={className}
    />
  );
}

export function ServerErrorView({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorView
      title="서버 오류"
      message="서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      onRetry={onRetry}
      className={className}
    />
  );
}
