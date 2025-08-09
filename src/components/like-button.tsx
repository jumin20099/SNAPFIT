import { Heart, HeartOff } from 'lucide-react';
import { useToggleLike } from '@/hooks/useToggleLike';

interface LikeButtonProps {
  targetIdx: number;
  targetType: 'product' | 'brand' | 'outfit';
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ targetIdx, targetType, initialLiked, initialCount }: LikeButtonProps) {
  const { liked, count, loading, toggle } = useToggleLike({
    targetIdx,
    targetType,
    initialLiked,
    initialCount,
  });

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 text-sm ${liked ? 'filled' : ''}`}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      data-testid="like-button"
    >
      {liked ? <Heart className="fill-red-500 text-red-500 w-4 h-4" /> : <HeartOff className="w-4 h-4" />}
      <span>{count}</span>
    </button>
  );
} 