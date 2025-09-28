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
  | 'accessory'
  | 'dresses'
  | 'glasses'
  | 'watch'
  | 'belt'
  | 'socks'
  | 'jewelry';

// 정규화 좌표 시스템을 위한 타입 정의
export type Anchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

// 가상 캔버스 크기 (고정 기준)
export const BASE_W = 1080;
export const BASE_H = 1920;

// 자산 메타데이터
export interface AssetMeta {
  intrinsicWidth: number;
  intrinsicHeight: number;
  hotspot: { x: number; y: number }; // 0~1 범위의 핫스팟 좌표
  trimOffset: { x: number; y: number }; // 외곽 여백 오프셋
  // 자산 식별 정보
  assetId: string;
  version: string;
  // 로딩 상태
  loaded: boolean;
  loadError?: string;
}

// 자산 메타데이터 관리 유틸리티
export class AssetMetaManager {
  private static cache = new Map<string, AssetMeta>();
  
  // 자산 메타데이터 생성
  static createAssetMeta(
    assetId: string,
    intrinsicWidth: number,
    intrinsicHeight: number,
    hotspot: { x: number; y: number } = { x: 0.5, y: 0.5 },
    trimOffset: { x: number; y: number } = { x: 0, y: 0 },
    version: string = '1.0'
  ): AssetMeta {
    return {
      assetId,
      intrinsicWidth,
      intrinsicHeight,
      hotspot,
      trimOffset,
      version,
      loaded: true
    };
  }
  
  // 자산 메타데이터 캐시 저장
  static setAssetMeta(assetId: string, meta: AssetMeta): void {
    this.cache.set(assetId, meta);
  }
  
  // 자산 메타데이터 캐시 조회
  static getAssetMeta(assetId: string): AssetMeta | undefined {
    return this.cache.get(assetId);
  }
  
  // 기본 자산 메타데이터 (이미지 로딩 전 사용)
  static getDefaultAssetMeta(assetId: string, fallbackWidth: number = 100, fallbackHeight: number = 100): AssetMeta {
    return this.createAssetMeta(
      assetId,
      fallbackWidth,
      fallbackHeight,
      { x: 0.5, y: 0.5 }, // 기본 중앙 핫스팟
      { x: 0, y: 0 } // 기본 트림 오프셋
    );
  }
  
  // 이미지 로딩 후 메타데이터 업데이트
  static async loadImageMeta(imageSrc: string): Promise<AssetMeta> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const meta = this.createAssetMeta(
          imageSrc,
          img.naturalWidth,
          img.naturalHeight,
          { x: 0.5, y: 0.5 }, // 기본 중앙 핫스팟
          { x: 0, y: 0 } // 기본 트림 오프셋
        );
        this.setAssetMeta(imageSrc, meta);
        resolve(meta);
      };
      img.onerror = () => {
        const meta = this.getDefaultAssetMeta(imageSrc);
        meta.loaded = false;
        meta.loadError = 'Failed to load image';
        this.setAssetMeta(imageSrc, meta);
        resolve(meta);
      };
      img.src = imageSrc;
    });
  }
  
  // 카테고리별 기본 핫스팟 정의
  static getCategoryHotspot(slot: CodySlot): { x: number; y: number } {
    switch (slot) {
      case 'hat':
        return { x: 0.5, y: 0.8 }; // 모자 하단 중앙
      case 'top':
        return { x: 0.5, y: 0.3 }; // 상의 상단 중앙
      case 'outer':
        return { x: 0.5, y: 0.25 }; // 아우터 상단 중앙
      case 'bottom':
        return { x: 0.5, y: 0.7 }; // 하의 상단 중앙
      case 'shoes':
        return { x: 0.5, y: 0.9 }; // 신발 상단 중앙
      case 'bag':
        return { x: 0.3, y: 0.4 }; // 가방 좌측 중앙
      case 'accessory':
        return { x: 0.5, y: 0.5 }; // 액세서리 중앙
      case 'ring':
        return { x: 0.5, y: 0.5 }; // 반지 중앙
      case 'bracelet':
        return { x: 0.5, y: 0.5 }; // 팔찌 중앙
      case 'necklace':
        return { x: 0.5, y: 0.2 }; // 목걸이 상단 중앙
      default:
        return { x: 0.5, y: 0.5 }; // 기본 중앙
    }
  }
}

// 정규화 좌표 기반 배치 아이템
export interface PlacedItem {
  id: string;
  itemId: string;
  productId?: number; // 백엔드에서 사용하는 productId 필드
  name: string;
  src: string;
  slot?: CodySlot; // 커뮤니티 표시에서는 백엔드 카테고리로 대체될 수 있어 선택적
  // 정규화 좌표 (0~1 범위, BASE 기준)
  nx: number;  // 0~1 (BASE_W 기준)
  ny: number;  // 0~1 (BASE_H 기준)
  rotation: number;
  z: number;
  visible: boolean;
  // 앵커 포인트 (기준점)
  anchor: Anchor;
  // 자산 메타데이터
  assetMeta?: AssetMeta;
  // 상태 버전 (마이그레이션용)
  stateVersion: number;
  // 상세한 위치 정보
  scale?: number;
  opacity?: number;
  lastModified?: number;
  // 사용자 정의 메타데이터
  metadata?: {
    isCustomPosition?: boolean;
    originalPosition?: { nx: number; ny: number };
    notes?: string;
    tags?: string[];
  };
  // 하위 호환성을 위한 레거시 좌표 (자동 변환용)
  x?: number;
  y?: number;
}

export interface CodyItem {
  id: number;
  name: string;
  image: string;
  category: string;
  slot: CodySlot;
  price?: number;
  brand?: string;
  // 자산 메타데이터 추가
  assetMeta?: AssetMeta;
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
