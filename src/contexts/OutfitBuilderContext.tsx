import { createContext, useContext, useState } from 'react';

interface PlacedItem {
  id: number;
  image: string;
  category: string;
}

interface OutfitBuilderState {
  placed: Record<string, PlacedItem | null>; // key = category
  placeItem: (item: PlacedItem) => void;
}

const OutfitBuilderContext = createContext<OutfitBuilderState | undefined>(undefined);

export function OutfitBuilderProvider({ children }: { children: React.ReactNode }) {
  const [placed, setPlaced] = useState<Record<string, PlacedItem | null>>({});

  const placeItem = (item: PlacedItem) => {
    setPlaced((prev) => ({ ...prev, [item.category]: item }));
  };

  return (
    <OutfitBuilderContext.Provider value={{ placed, placeItem }}>
      {children}
    </OutfitBuilderContext.Provider>
  );
}

export function useOutfitBuilder() {
  const ctx = useContext(OutfitBuilderContext);
  if (!ctx) throw new Error('useOutfitBuilder must be used within OutfitBuilderProvider');
  return ctx;
} 