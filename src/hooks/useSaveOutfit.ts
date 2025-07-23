import { useState } from 'react';
import { useOutfitBuilder } from '@/contexts/OutfitBuilderContext';

export function useSaveOutfit() {
  const { placed } = useOutfitBuilder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveOutfit = async () => {
    setLoading(true);
    setError(null);
    try {
      const outfitItem = JSON.stringify(placed);
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outfitItem, isPublic: true }),
      });
      if (!res.ok) throw new Error('저장 실패');
      const data = await res.json();
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { saveOutfit, loading, error };
} 