import { useSaveOutfit } from '@/hooks/useSaveOutfit';

export default function SaveOutfitButton() {
  const { saveOutfit, loading } = useSaveOutfit();

  return (
    <button
      onClick={saveOutfit}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? '저장 중...' : '코디 저장'}
    </button>
  );
} 