import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// 그리드 가상화 컴포넌트
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = Math.floor(containerWidth / itemWidth);
  const rows = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              display: 'flex',
              gap: '8px',
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => {
              const itemIndex = virtualRow.index * columns + columnIndex;
              const item = items[itemIndex];
              
              if (!item) return null;
              
              return (
                <div
                  key={itemIndex}
                  style={{
                    width: `${itemWidth}px`,
                    height: `${itemHeight}px`,
                  }}
                >
                  {renderItem(item, itemIndex)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
