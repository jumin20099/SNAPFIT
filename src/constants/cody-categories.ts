export interface SubCategory {
  id: string;
  name: string;
}

export interface MajorCategory {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface GenderCategory {
  id: string;
  name: string;
  majorCategories: MajorCategory[];
}

export interface MannequinPart {
  id: string;
  name: string;
  category: string;
  position: {
    x: number; // 퍼센트
    y: number; // 퍼센트
    width: number; // 퍼센트
    height: number; // 퍼센트
  };
  zIndex: number;
}

// 성별 카테고리 데이터
export const genderCategories: GenderCategory[] = [
  {
    id: 'all',
    name: '전체',
    majorCategories: []
  },
  {
    id: 'male',
    name: '남성',
    majorCategories: []
  },
  {
    id: 'female',
    name: '여성',
    majorCategories: []
  }
];

// 대분류 카테고리 데이터
export const majorCategories: MajorCategory[] = [
  {
    id: 'shoes',
    name: '신발',
    subCategories: [
      { id: 'sneakers', name: '스니커즈' },
      { id: 'boots', name: '부츠' },
      { id: 'loafers', name: '로퍼' },
      { id: 'sandals', name: '샌들' },
      { id: 'heels', name: '힐' },
      { id: 'other-shoes', name: '기타 신발' }
    ]
  },
  {
    id: 'tops',
    name: '상의',
    subCategories: [
      { id: 'new', name: '신상' },
      { id: 'sweatshirt', name: '맨투맨/스웨트' },
      { id: 'hoodie', name: '후드 티셔츠' },
      { id: 'shirt', name: '셔츠/블라우스' },
      { id: 'long-sleeve', name: '긴소매 티셔츠' },
      { id: 'short-sleeve', name: '반소매 티셔츠' },
      { id: 'polo', name: '피케/카라 티셔츠' },
      { id: 'knit', name: '니트/스웨터' },
      { id: 'sleeveless', name: '민소매 티셔츠' },
      { id: 'other-tops', name: '기타 상의' }
    ]
  },
  {
    id: 'outer',
    name: '아우터',
    subCategories: [
      { id: 'jacket', name: '자켓' },
      { id: 'coat', name: '코트' },
      { id: 'blazer', name: '블레이저' },
      { id: 'cardigan', name: '가디건' },
      { id: 'vest', name: '조끼' },
      { id: 'windbreaker', name: '바람막이' },
      { id: 'other-outer', name: '기타 아우터' }
    ]
  },
  {
    id: 'bottoms',
    name: '바지',
    subCategories: [
      { id: 'jeans', name: '청바지' },
      { id: 'slacks', name: '슬랙스' },
      { id: 'shorts', name: '반바지' },
      { id: 'joggers', name: '조거팬츠' },
      { id: 'leggings', name: '레깅스' },
      { id: 'other-bottoms', name: '기타 바지' }
    ]
  },
  {
    id: 'dress-skirt',
    name: '원피스/스커트',
    subCategories: [
      { id: 'dress', name: '원피스' },
      { id: 'skirt', name: '스커트' },
      { id: 'mini-skirt', name: '미니스커트' },
      { id: 'midi-skirt', name: '미디스커트' },
      { id: 'maxi-skirt', name: '맥시스커트' },
      { id: 'other-dress-skirt', name: '기타 원피스/스커트' }
    ]
  },
  {
    id: 'bag',
    name: '가방',
    subCategories: [
      { id: 'handbag', name: '핸드백' },
      { id: 'backpack', name: '백팩' },
      { id: 'tote', name: '토트백' },
      { id: 'clutch', name: '클러치' },
      { id: 'crossbody', name: '크로스백' },
      { id: 'other-bag', name: '기타 가방' }
    ]
  },
  {
    id: 'accessories',
    name: '패션소품',
    subCategories: [
      { id: 'hat', name: '모자' },
      { id: 'scarf', name: '스카프' },
      { id: 'belt', name: '벨트' },
      { id: 'jewelry', name: '주얼리' },
      { id: 'watch', name: '시계' },
      { id: 'other-accessories', name: '기타 소품' }
    ]
  }
];

// 마네킹 부위 정의
export const mannequinParts: MannequinPart[] = [
  {
    id: 'head',
    name: '머리',
    category: 'accessories',
    position: { x: 40, y: 5, width: 20, height: 15 },
    zIndex: 1
  },
  {
    id: 'tops',
    name: '상의',
    category: 'tops',
    position: { x: 35, y: 20, width: 30, height: 25 },
    zIndex: 2
  },
  {
    id: 'outer',
    name: '아우터',
    category: 'outer',
    position: { x: 30, y: 15, width: 40, height: 35 },
    zIndex: 3
  },
  {
    id: 'bottoms',
    name: '하의',
    category: 'bottoms',
    position: { x: 37, y: 45, width: 26, height: 25 },
    zIndex: 2
  },
  {
    id: 'dress-skirt',
    name: '원피스/스커트',
    category: 'dress-skirt',
    position: { x: 35, y: 20, width: 30, height: 50 },
    zIndex: 2
  },
  {
    id: 'shoes',
    name: '신발',
    category: 'shoes',
    position: { x: 35, y: 70, width: 30, height: 15 },
    zIndex: 4
  },
  {
    id: 'bag',
    name: '가방',
    category: 'bag',
    position: { x: 15, y: 30, width: 15, height: 20 },
    zIndex: 1
  }
];

// 카테고리 ID를 마네킹 부위 ID로 매핑
export const categoryToMannequinMap: Record<string, string> = {
  'tops': 'tops',
  'outer': 'outer',
  'bottoms': 'bottoms',
  'dress-skirt': 'dress-skirt',
  'shoes': 'shoes',
  'bag': 'bag',
  'accessories': 'head'
};

// 전체 카테고리 데이터 (성별별로 대분류 할당)
export const getFullCategoryData = (): GenderCategory[] => {
  return genderCategories.map(gender => ({
    ...gender,
    majorCategories: majorCategories
  }));
};
