import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CategoryTabProps {
  categories: string[];
  onSelect: (category: string) => void;
  className?: string;
}

export default function CategoryTab({ categories, onSelect, className }: CategoryTabProps) {
  const [active, setActive] = useState<string>(categories[0] ?? '');

  const handleClick = (cat: string) => {
    setActive(cat);
    onSelect(cat);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {categories.map((cat) => (
        <button
          key={cat}
          className={cn(
            'px-4 py-2 rounded-full text-sm',
            active === cat ? 'bg-black text-white' : 'bg-gray-200'
          )}
          onClick={() => handleClick(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
} 