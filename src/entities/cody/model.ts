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
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  switch (lowerCategory) {
    case "상의":
      return "top";
    case "아우터":
      return "outer";
    case "바지":
    case "하의":
      return "bottom";
    case "원피스/스커트":
      return "top"; // 원피스는 상의로 분류
    case "신발":
      return "shoes";
    case "가방":
      return "bag";
    case "패션소품":
      // 상품명을 기반으로 세부 분류
      if (lowerName.includes("모자") || lowerName.includes("캡") || lowerName.includes("햇") || lowerName.includes("hat")) {
        return "hat";
      } else if (lowerName.includes("가방") || lowerName.includes("백팩") || lowerName.includes("크로스백") || lowerName.includes("토트백") || lowerName.includes("메신저")) {
        return "bag";
      } else if (lowerName.includes("반지") || lowerName.includes("ring")) {
        return "ring";
      } else if (lowerName.includes("팔찌") || lowerName.includes("브레이슬릿") || lowerName.includes("bracelet")) {
        return "bracelet";
      } else if (lowerName.includes("목걸이") || lowerName.includes("네크리스") || lowerName.includes("necklace")) {
        return "necklace";
      } else if (lowerName.includes("시계") || lowerName.includes("watch")) {
        return "accessory";
      } else if (lowerName.includes("벨트") || lowerName.includes("belt")) {
        return "accessory";
      } else {
        return "accessory";
      }
    default:
      return "accessory";
  }
}
