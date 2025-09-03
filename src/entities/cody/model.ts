// 코디 관련 타입 정의
export type CodySlot = 
  | 'hat' 
  | 'top' 
  | 'bottom' 
  | 'outer' 
  | 'shoes' 
  | 'bag' 
  | 'ring'
  | 'bracelet'
  | 'necklace'
  | 'accessory';

export interface CodyItem {
  id: number;
  name: string;
  image: string;
  category: string;
  slot: CodySlot;
  price?: number;
  brand?: string;
}

export interface CodyState {
  items: Partial<Record<CodySlot, CodyItem>>;
}

export interface CodyActions {
  setItem: (item: CodyItem) => void;
  removeItem: (slot: CodySlot) => void;
  clearAll: () => void;
  getItem: (slot: CodySlot) => CodyItem | undefined;
  hasItem: (slot: CodySlot) => boolean;
}

// 카테고리에서 슬롯으로 매핑하는 함수
export function getCodySlotFromCategory(category: string, name: string): CodySlot {
  switch (category) {
    case "상의":
      return "top";
    case "아우터":
      return "outer";
    case "하의":
      return "bottom";
    case "신발":
      return "shoes";
    case "액세서리":
      if (name.includes("모자") || name.includes("캡") || name.includes("햇")) {
        return "hat";
      } else if (name.includes("가방") || name.includes("백팩") || name.includes("크로스백")) {
        return "bag";
      } else if (name.includes("반지")) {
        return "ring";
      } else if (name.includes("팔찌")) {
        return "bracelet";
      } else if (name.includes("목걸이") || name.includes("네크리스")) {
        return "necklace";
      } else {
        return "accessory";
      }
    default:
      return "accessory";
  }
}
