import { useDrag, DragSourceMonitor } from 'react-dnd';
import Image from 'next/image';

export interface DraggableProductProps {
  id: number;
  image: string;
  name: string;
  category: string;
}

export default function DraggableProduct({ id, image, name }: DraggableProductProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PRODUCT',
    item: { id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [id]);

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="w-24 h-24 cursor-grab">
      <Image src={image} alt={name} width={96} height={96} className="object-cover rounded" />
    </div>
  );
} 