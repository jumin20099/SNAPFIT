import { Button } from '@/components/ui/button';
import { Plus, Search, Heart, ShoppingBag, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyViewProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'page' | 'component' | 'inline';
}

export function EmptyView({
  title = '데이터가 없습니다',
  message = '표시할 내용이 없습니다.',
  icon,
  action,
  className,
  variant = 'page',
}: EmptyViewProps) {
  const isPage = variant === 'page';
  const isComponent = variant === 'component';
  const isInline = variant === 'inline';

  if (isInline) {
    return (
      <div className={cn('flex items-center gap-2 p-2 text-gray-500', className)}>
        {icon}
        <span className="text-sm">{message}</span>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="ml-auto"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  if (isComponent) {
    return (
      <div className={cn('p-6 text-center', className)}>
        {icon && <div className="mb-3">{icon}</div>}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('min-h-[400px] flex items-center justify-center p-8', className)}>
      <div className="text-center max-w-md">
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// 특정 상황별 빈 뷰
export function EmptyProductView({ onAddProduct, className }: { onAddProduct?: () => void; className?: string }) {
  return (
    <EmptyView
      title="상품이 없습니다"
      message="아직 등록된 상품이 없습니다. 첫 번째 상품을 추가해보세요."
      icon={<ShoppingBag className="w-16 h-16 text-gray-400 mx-auto" />}
      action={onAddProduct ? {
        label: '상품 추가하기',
        onClick: onAddProduct,
      } : undefined}
      className={className}
    />
  );
}

export function EmptySearchView({ onClearSearch, className }: { onClearSearch?: () => void; className?: string }) {
  return (
    <EmptyView
      title="검색 결과가 없습니다"
      message="검색 조건에 맞는 결과를 찾을 수 없습니다. 다른 키워드로 시도해보세요."
      icon={<Search className="w-16 h-16 text-gray-400 mx-auto" />}
      action={onClearSearch ? {
        label: '검색 초기화',
        onClick: onClearSearch,
      } : undefined}
      className={className}
    />
  );
}

export function EmptyLikedView({ onExplore, className }: { onExplore?: () => void; className?: string }) {
  return (
    <EmptyView
      title="좋아요한 상품이 없습니다"
      message="마음에 드는 상품에 좋아요를 눌러보세요."
      icon={<Heart className="w-16 h-16 text-gray-400 mx-auto" />}
      action={onExplore ? {
        label: '상품 둘러보기',
        onClick: onExplore,
      } : undefined}
      className={className}
    />
  );
}

export function EmptyCommunityView({ onCreatePost, className }: { onCreatePost?: () => void; className?: string }) {
  return (
    <EmptyView
      title="게시글이 없습니다"
      message="아직 작성된 게시글이 없습니다. 첫 번째 게시글을 작성해보세요."
      icon={<FileText className="w-16 h-16 text-gray-400 mx-auto" />}
      action={onCreatePost ? {
        label: '게시글 작성하기',
        onClick: onCreatePost,
      } : undefined}
      className={className}
    />
  );
}

export function EmptyFollowersView({ onInvite, className }: { onInvite?: () => void; className?: string }) {
  return (
    <EmptyView
      title="팔로워가 없습니다"
      message="아직 팔로워가 없습니다. 더 많은 사람들과 소통해보세요."
      icon={<Users className="w-16 h-16 text-gray-400 mx-auto" />}
      action={onInvite ? {
        label: '친구 초대하기',
        onClick: onInvite,
      } : undefined}
      className={className}
    />
  );
}
