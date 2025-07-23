import { useDrop } from 'react-dnd';
import { ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { useOutfitBuilder } from '@/contexts/OutfitBuilderContext';

interface DropZoneProps {
  category: string;
  position: [number, number, number];
  onDrop: (productId: number, category: string) => void;
}

export default function DropZone({ category, position, onDrop }: DropZoneProps) {
  const [, drop] = useDrop(() => ({
    accept: 'PRODUCT',
    drop: (item: { id: number }) => {
      onDrop(item.id, category);
    },
  }), [category]);

  const { placed } = useOutfitBuilder();
  const placedItem = placed[category];

  return (
    <Html position={position} center>
      <div ref={drop} className="w-32 h-32 relative">
        {placedItem ? (
          <img src={placedItem.image} alt="item" className="absolute inset-0 object-contain" />
        ) : (
          <div className="w-full h-full border-2 border-dashed border-gray-400" />
        )}
      </div>
    </Html>
  );
} 