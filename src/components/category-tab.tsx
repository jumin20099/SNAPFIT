import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_MAP } from '@/constants/category-map';

interface CategoryTabProps {
  onSelect: (major: string, sub?: string) => void;
  className?: string;
}

export default function CategoryTab({ onSelect, className }: CategoryTabProps) {
  const majors = Object.keys(CATEGORY_MAP);
  const [activeMajor, setActiveMajor] = useState<string>(majors[0]);
  const [activeSub, setActiveSub] = useState<string>('');

  const selectMajor = (m: string) => {
    setActiveMajor(m);
    setActiveSub('');
    onSelect(m);
  };

  const selectSub = (s: string) => {
    setActiveSub(s);
    onSelect(activeMajor, s);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Major */}
      <div className="flex gap-2">
        {majors.map((m) => (
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
      {/* Sub */}
      <div className="flex gap-2 overflow-x-auto">
        {CATEGORY_MAP[activeMajor].map((sub) => (
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
    </div>
  );
} 