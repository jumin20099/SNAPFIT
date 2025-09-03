// 카테고리 데이터 구조 정의
export interface CategoryItem {
  id: string
  name: string
  icon?: string
  isNew?: boolean // 신상 여부
}

export interface MainCategory {
  id: string
  name: string
  icon?: string
  subCategories: CategoryItem[]
}

export interface GenderCategory {
  id: 'all' | 'male' | 'female'
  name: string
  mainCategories: MainCategory[]
}

// 카테고리 데이터
export const CATEGORIES: GenderCategory[] = [
  {
    id: 'all',
    name: '전체',
    mainCategories: [
      {
        id: 'shoes',
        name: '신발',
        icon: '👟',
        subCategories: [
          { id: 'new-shoes', name: '신상', isNew: true },
          { id: 'sneakers', name: '스니커즈' },
          { id: 'padded-shoes', name: '패딩/퍼 신발' },
          { id: 'boots', name: '부츠/워커' },
          { id: 'dress-shoes', name: '구두' },
          { id: 'sandals', name: '샌들/슬리퍼' },
          { id: 'sports-shoes', name: '스포츠화' },
          { id: 'shoe-accessories', name: '신발용품' }
        ]
      },
      {
        id: 'tops',
        name: '상의',
        icon: '👕',
        subCategories: [
          { id: 'new-tops', name: '신상', isNew: true },
          { id: 'sweatshirts', name: '맨투맨/스웨트' },
          { id: 'hoodies', name: '후드 티셔츠' },
          { id: 'shirts', name: '셔츠/블라우스' },
          { id: 'long-sleeve', name: '긴소매 티셔츠' },
          { id: 'short-sleeve', name: '반소매 티셔츠' },
          { id: 'polo', name: '피케/카라 티셔츠' },
          { id: 'knit', name: '니트/스웨터' },
          { id: 'sleeveless', name: '민소매 티셔츠' },
          { id: 'other-tops', name: '기타 상의' }
        ]
      },
      {
        id: 'outerwear',
        name: '아우터',
        icon: '🧥',
        subCategories: [
          { id: 'new-outerwear', name: '신상', isNew: true },
          { id: 'hoodie-zip', name: '후드 집업' },
          { id: 'blouson', name: '블루종/MA-1' },
          { id: 'leather-jacket', name: '레더/라이더스 재킷' },
          { id: 'cardigan', name: '카디건' },
          { id: 'trucker-jacket', name: '트러커 재킷' },
          { id: 'blazer', name: '슈트/블레이저 재킷' },
          { id: 'stadium-jacket', name: '스타디움 재킷' },
          { id: 'nylon-jacket', name: '나일론/코치 재킷' },
          { id: 'anorak', name: '아노락 재킷' },
          { id: 'training-jacket', name: '트레이닝 재킷' },
          { id: 'transition-coat', name: '환절기 코트' },
          { id: 'safari-jacket', name: '사파리/헌팅 재킷' },
          { id: 'vest', name: '베스트' },
          { id: 'short-padding', name: '숏패딩/헤비 아우터' },
          { id: 'fur', name: '무스탕/퍼' },
          { id: 'fleece', name: '플리스/뽀글이' },
          { id: 'winter-single-coat', name: '겨울 싱글 코트' },
          { id: 'winter-double-coat', name: '겨울 더블 코트' },
          { id: 'winter-other-coat', name: '겨울 기타 코트' },
          { id: 'long-padding', name: '롱패딩/헤비 아우터' },
          { id: 'padding-vest', name: '패딩 베스트' },
          { id: 'other-outerwear', name: '기타 아우터' }
        ]
      },
      {
        id: 'pants',
        name: '바지',
        icon: '👖',
        subCategories: [
          { id: 'new-pants', name: '신상', isNew: true },
          { id: 'jeans', name: '데님 팬츠' },
          { id: 'training-pants', name: '트레이닝/조거 팬츠' },
          { id: 'cotton-pants', name: '코튼 팬츠' },
          { id: 'suit-pants', name: '슈트 팬츠/슬랙스' },
          { id: 'shorts', name: '숏 팬츠' },
          { id: 'leggings', name: '레깅스' },
          { id: 'jumpsuit', name: '점프 슈트/오버올' },
          { id: 'other-bottoms', name: '기타 하의' }
        ]
      },
      {
        id: 'dresses',
        name: '원피스/스커트',
        icon: '👗',
        subCategories: [
          { id: 'new-dresses', name: '신상', isNew: true },
          { id: 'mini-dress', name: '미니원피스' },
          { id: 'midi-dress', name: '미디원피스' },
          { id: 'maxi-dress', name: '맥시원피스' },
          { id: 'mini-skirt', name: '미니스커트' },
          { id: 'midi-skirt', name: '미디스커트' },
          { id: 'long-skirt', name: '롱스커트' }
        ]
      },
      {
        id: 'bags',
        name: '가방',
        icon: '👜',
        subCategories: [
          { id: 'new-bags', name: '신상', isNew: true },
          { id: 'messenger-bag', name: '메신저/크로스 백' },
          { id: 'shoulder-bag', name: '숄더백' },
          { id: 'backpack', name: '백팩' },
          { id: 'tote-bag', name: '토트백' },
          { id: 'eco-bag', name: '에코백' },
          { id: 'boston-bag', name: '보스턴/더플백' },
          { id: 'waist-bag', name: '웨이스트 백' },
          { id: 'pouch-bag', name: '파우치 백' },
          { id: 'briefcase', name: '브리프 케이스' },
          { id: 'carrier', name: '캐리어' },
          { id: 'bag-accessories', name: '가방 소품' },
          { id: 'wallet', name: '지갑/머니클립' },
          { id: 'clutch-bag', name: '클러치 백' }
        ]
      },
      {
        id: 'accessories',
        name: '패션소품',
        icon: '👒',
        subCategories: [
          { id: 'new-accessories', name: '신상', isNew: true },
          { id: 'hats', name: '모자' },
          { id: 'scarves', name: '머플러' },
          { id: 'jewelry', name: '주얼리' },
          { id: 'socks', name: '양말/레그웨어' },
          { id: 'sunglasses', name: '선글라스/안경테' },
          { id: 'accessories', name: '액세서리' },
          { id: 'watches', name: '시계' },
          { id: 'belts', name: '벨트' }
        ]
      }
    ]
  },
  {
    id: 'male',
    name: '남성',
    mainCategories: [
      {
        id: 'shoes',
        name: '신발',
        icon: '👟',
        subCategories: [
          { id: 'new-shoes', name: '신상', isNew: true },
          { id: 'sneakers', name: '스니커즈' },
          { id: 'padded-shoes', name: '패딩/퍼 신발' },
          { id: 'boots', name: '부츠/워커' },
          { id: 'dress-shoes', name: '구두' },
          { id: 'sandals', name: '샌들/슬리퍼' },
          { id: 'sports-shoes', name: '스포츠화' },
          { id: 'shoe-accessories', name: '신발용품' }
        ]
      },
      {
        id: 'tops',
        name: '상의',
        icon: '👕',
        subCategories: [
          { id: 'new-tops', name: '신상', isNew: true },
          { id: 'sweatshirts', name: '맨투맨/스웨트' },
          { id: 'hoodies', name: '후드 티셔츠' },
          { id: 'shirts', name: '셔츠/블라우스' },
          { id: 'long-sleeve', name: '긴소매 티셔츠' },
          { id: 'short-sleeve', name: '반소매 티셔츠' },
          { id: 'polo', name: '피케/카라 티셔츠' },
          { id: 'knit', name: '니트/스웨터' },
          { id: 'sleeveless', name: '민소매 티셔츠' },
          { id: 'other-tops', name: '기타 상의' }
        ]
      },
      {
        id: 'outerwear',
        name: '아우터',
        icon: '🧥',
        subCategories: [
          { id: 'new-outerwear', name: '신상', isNew: true },
          { id: 'hoodie-zip', name: '후드 집업' },
          { id: 'blouson', name: '블루종/MA-1' },
          { id: 'leather-jacket', name: '레더/라이더스 재킷' },
          { id: 'cardigan', name: '카디건' },
          { id: 'trucker-jacket', name: '트러커 재킷' },
          { id: 'blazer', name: '슈트/블레이저 재킷' },
          { id: 'stadium-jacket', name: '스타디움 재킷' },
          { id: 'nylon-jacket', name: '나일론/코치 재킷' },
          { id: 'anorak', name: '아노락 재킷' },
          { id: 'training-jacket', name: '트레이닝 재킷' },
          { id: 'transition-coat', name: '환절기 코트' },
          { id: 'safari-jacket', name: '사파리/헌팅 재킷' },
          { id: 'vest', name: '베스트' },
          { id: 'short-padding', name: '숏패딩/헤비 아우터' },
          { id: 'fur', name: '무스탕/퍼' },
          { id: 'fleece', name: '플리스/뽀글이' },
          { id: 'winter-single-coat', name: '겨울 싱글 코트' },
          { id: 'winter-double-coat', name: '겨울 더블 코트' },
          { id: 'winter-other-coat', name: '겨울 기타 코트' },
          { id: 'long-padding', name: '롱패딩/헤비 아우터' },
          { id: 'padding-vest', name: '패딩 베스트' },
          { id: 'other-outerwear', name: '기타 아우터' }
        ]
      },
      {
        id: 'pants',
        name: '바지',
        icon: '👖',
        subCategories: [
          { id: 'new-pants', name: '신상', isNew: true },
          { id: 'jeans', name: '데님 팬츠' },
          { id: 'training-pants', name: '트레이닝/조거 팬츠' },
          { id: 'cotton-pants', name: '코튼 팬츠' },
          { id: 'suit-pants', name: '슈트 팬츠/슬랙스' },
          { id: 'shorts', name: '숏 팬츠' },
          { id: 'leggings', name: '레깅스' },
          { id: 'jumpsuit', name: '점프 슈트/오버올' },
          { id: 'other-bottoms', name: '기타 하의' }
        ]
      },
      {
        id: 'bags',
        name: '가방',
        icon: '👜',
        subCategories: [
          { id: 'new-bags', name: '신상', isNew: true },
          { id: 'messenger-bag', name: '메신저/크로스 백' },
          { id: 'shoulder-bag', name: '숄더백' },
          { id: 'backpack', name: '백팩' },
          { id: 'tote-bag', name: '토트백' },
          { id: 'eco-bag', name: '에코백' },
          { id: 'boston-bag', name: '보스턴/더플백' },
          { id: 'waist-bag', name: '웨이스트 백' },
          { id: 'pouch-bag', name: '파우치 백' },
          { id: 'briefcase', name: '브리프 케이스' },
          { id: 'carrier', name: '캐리어' },
          { id: 'bag-accessories', name: '가방 소품' },
          { id: 'wallet', name: '지갑/머니클립' },
          { id: 'clutch-bag', name: '클러치 백' }
        ]
      },
      {
        id: 'accessories',
        name: '패션소품',
        icon: '👒',
        subCategories: [
          { id: 'new-accessories', name: '신상', isNew: true },
          { id: 'hats', name: '모자' },
          { id: 'scarves', name: '머플러' },
          { id: 'jewelry', name: '주얼리' },
          { id: 'socks', name: '양말/레그웨어' },
          { id: 'sunglasses', name: '선글라스/안경테' },
          { id: 'accessories', name: '액세서리' },
          { id: 'watches', name: '시계' },
          { id: 'belts', name: '벨트' }
        ]
      }
    ]
  },
  {
    id: 'female',
    name: '여성',
    mainCategories: [
      {
        id: 'shoes',
        name: '신발',
        icon: '👟',
        subCategories: [
          { id: 'new-shoes', name: '신상', isNew: true },
          { id: 'sneakers', name: '스니커즈' },
          { id: 'padded-shoes', name: '패딩/퍼 신발' },
          { id: 'boots', name: '부츠/워커' },
          { id: 'dress-shoes', name: '구두' },
          { id: 'sandals', name: '샌들/슬리퍼' },
          { id: 'sports-shoes', name: '스포츠화' },
          { id: 'shoe-accessories', name: '신발용품' }
        ]
      },
      {
        id: 'tops',
        name: '상의',
        icon: '👕',
        subCategories: [
          { id: 'new-tops', name: '신상', isNew: true },
          { id: 'sweatshirts', name: '맨투맨/스웨트' },
          { id: 'hoodies', name: '후드 티셔츠' },
          { id: 'shirts', name: '셔츠/블라우스' },
          { id: 'long-sleeve', name: '긴소매 티셔츠' },
          { id: 'short-sleeve', name: '반소매 티셔츠' },
          { id: 'polo', name: '피케/카라 티셔츠' },
          { id: 'knit', name: '니트/스웨터' },
          { id: 'sleeveless', name: '민소매 티셔츠' },
          { id: 'other-tops', name: '기타 상의' }
        ]
      },
      {
        id: 'outerwear',
        name: '아우터',
        icon: '🧥',
        subCategories: [
          { id: 'new-outerwear', name: '신상', isNew: true },
          { id: 'hoodie-zip', name: '후드 집업' },
          { id: 'blouson', name: '블루종/MA-1' },
          { id: 'leather-jacket', name: '레더/라이더스 재킷' },
          { id: 'cardigan', name: '카디건' },
          { id: 'trucker-jacket', name: '트러커 재킷' },
          { id: 'blazer', name: '슈트/블레이저 재킷' },
          { id: 'stadium-jacket', name: '스타디움 재킷' },
          { id: 'nylon-jacket', name: '나일론/코치 재킷' },
          { id: 'anorak', name: '아노락 재킷' },
          { id: 'training-jacket', name: '트레이닝 재킷' },
          { id: 'transition-coat', name: '환절기 코트' },
          { id: 'safari-jacket', name: '사파리/헌팅 재킷' },
          { id: 'vest', name: '베스트' },
          { id: 'short-padding', name: '숏패딩/헤비 아우터' },
          { id: 'fur', name: '무스탕/퍼' },
          { id: 'fleece', name: '플리스/뽀글이' },
          { id: 'winter-single-coat', name: '겨울 싱글 코트' },
          { id: 'winter-double-coat', name: '겨울 더블 코트' },
          { id: 'winter-other-coat', name: '겨울 기타 코트' },
          { id: 'long-padding', name: '롱패딩/헤비 아우터' },
          { id: 'padding-vest', name: '패딩 베스트' },
          { id: 'other-outerwear', name: '기타 아우터' }
        ]
      },
      {
        id: 'pants',
        name: '바지',
        icon: '👖',
        subCategories: [
          { id: 'new-pants', name: '신상', isNew: true },
          { id: 'jeans', name: '데님 팬츠' },
          { id: 'training-pants', name: '트레이닝/조거 팬츠' },
          { id: 'cotton-pants', name: '코튼 팬츠' },
          { id: 'suit-pants', name: '슈트 팬츠/슬랙스' },
          { id: 'shorts', name: '숏 팬츠' },
          { id: 'leggings', name: '레깅스' },
          { id: 'jumpsuit', name: '점프 슈트/오버올' },
          { id: 'other-bottoms', name: '기타 하의' }
        ]
      },
      {
        id: 'dresses',
        name: '원피스/스커트',
        icon: '👗',
        subCategories: [
          { id: 'new-dresses', name: '신상', isNew: true },
          { id: 'mini-dress', name: '미니원피스' },
          { id: 'midi-dress', name: '미디원피스' },
          { id: 'maxi-dress', name: '맥시원피스' },
          { id: 'mini-skirt', name: '미니스커트' },
          { id: 'midi-skirt', name: '미디스커트' },
          { id: 'long-skirt', name: '롱스커트' }
        ]
      },
      {
        id: 'bags',
        name: '가방',
        icon: '👜',
        subCategories: [
          { id: 'new-bags', name: '신상', isNew: true },
          { id: 'messenger-bag', name: '메신저/크로스 백' },
          { id: 'shoulder-bag', name: '숄더백' },
          { id: 'backpack', name: '백팩' },
          { id: 'tote-bag', name: '토트백' },
          { id: 'eco-bag', name: '에코백' },
          { id: 'boston-bag', name: '보스턴/더플백' },
          { id: 'waist-bag', name: '웨이스트 백' },
          { id: 'pouch-bag', name: '파우치 백' },
          { id: 'briefcase', name: '브리프 케이스' },
          { id: 'carrier', name: '캐리어' },
          { id: 'bag-accessories', name: '가방 소품' },
          { id: 'wallet', name: '지갑/머니클립' },
          { id: 'clutch-bag', name: '클러치 백' }
        ]
      },
      {
        id: 'accessories',
        name: '패션소품',
        icon: '👒',
        subCategories: [
          { id: 'new-accessories', name: '신상', isNew: true },
          { id: 'hats', name: '모자' },
          { id: 'scarves', name: '머플러' },
          { id: 'jewelry', name: '주얼리' },
          { id: 'socks', name: '양말/레그웨어' },
          { id: 'sunglasses', name: '선글라스/안경테' },
          { id: 'accessories', name: '액세서리' },
          { id: 'watches', name: '시계' },
          { id: 'belts', name: '벨트' }
        ]
      }
    ]
  }
]

// 카테고리 ID를 백엔드 한글 카테고리명으로 매핑
export const mapCategoryIdToBackend = (mainCategoryId: string, subCategoryId?: string) => {
  const categoryMap: Record<string, string> = {
    'shoes': '신발',
    'tops': '상의', 
    'outerwear': '아우터',
    'pants': '바지',
    'dresses': '원피스/스커트',
    'bags': '가방',
    'accessories': '패션소품'
  }

  const subCategoryMap: Record<string, string> = {
    // 신발
    'sneakers': '스니커즈',
    'padded-shoes': '패딩/퍼 신발',
    'boots': '부츠/워커',
    'dress-shoes': '구두',
    'sandals': '샌들/슬리퍼',
    'sports-shoes': '스포츠화',
    'shoe-accessories': '신발용품',
    
    // 상의
    'sweatshirts': '맨투맨/스웨트',
    'hoodies': '후드 티셔츠',
    'shirts': '셔츠/블라우스',
    'long-sleeve': '긴소매 티셔츠',
    'short-sleeve': '반소매 티셔츠',
    'polo': '피케/카라 티셔츠',
    'knit': '니트/스웨터',
    'sleeveless': '민소매 티셔츠',
    'other-tops': '기타 상의',
    
    // 아우터
    'hoodie-zip': '후드 집업',
    'blouson': '블루종/MA-1',
    'leather-jacket': '레더/라이더스 재킷',
    'cardigan': '카디건',
    'trucker-jacket': '트러커 재킷',
    'blazer': '슈트/블레이저 재킷',
    'stadium-jacket': '스타디움 재킷',
    'nylon-jacket': '나일론/코치 재킷',
    'anorak': '아노락 재킷',
    'training-jacket': '트레이닝 재킷',
    'transition-coat': '환절기 코트',
    'safari-jacket': '사파리/헌팅 재킷',
    'vest': '베스트',
    'short-padding': '숏패딩/헤비 아우터',
    'fur': '무스탕/퍼',
    'fleece': '플리스/뽀글이',
    'winter-single-coat': '겨울 싱글 코트',
    'winter-double-coat': '겨울 더블 코트',
    'winter-other-coat': '겨울 기타 코트',
    'long-padding': '롱패딩/헤비 아우터',
    'padding-vest': '패딩 베스트',
    'other-outerwear': '기타 아우터',
    
    // 바지
    'jeans': '데님 팬츠',
    'training-pants': '트레이닝/조거 팬츠',
    'cotton-pants': '코튼 팬츠',
    'suit-pants': '슈트 팬츠/슬랙스',
    'shorts': '숏 팬츠',
    'leggings': '레깅스',
    'jumpsuit': '점프 슈트/오버올',
    'other-bottoms': '기타 하의',
    
    // 원피스/스커트
    'mini-dress': '미니원피스',
    'midi-dress': '미디원피스',
    'maxi-dress': '맥시원피스',
    'mini-skirt': '미니스커트',
    'midi-skirt': '미디스커트',
    'long-skirt': '롱스커트',
    
    // 가방
    'messenger-bag': '메신저/크로스 백',
    'shoulder-bag': '숄더백',
    'backpack': '백팩',
    'tote-bag': '토트백',
    'eco-bag': '에코백',
    'boston-bag': '보스턴/더플백',
    'waist-bag': '웨이스트 백',
    'pouch-bag': '파우치 백',
    'briefcase': '브리프 케이스',
    'carrier': '캐리어',
    'bag-accessories': '가방 소품',
    'wallet': '지갑/머니클립',
    'clutch-bag': '클러치 백',
    
    // 패션소품
    'hats': '모자',
    'scarves': '머플러',
    'jewelry': '주얼리',
    'socks': '양말/레그웨어',
    'sunglasses': '선글라스/안경테',
    'accessories': '액세서리',
    'watches': '시계',
    'belts': '벨트'
  }

  const backendMajor = categoryMap[mainCategoryId] || mainCategoryId
  const backendSub = subCategoryId ? (subCategoryMap[subCategoryId] || subCategoryId) : undefined

  return { major: backendMajor, sub: backendSub }
}

// 카테고리 유틸리티 함수들
export const getCategoryById = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
  const genderCategory = CATEGORIES.find(cat => cat.id === genderId)
  if (!genderCategory) return null

  const mainCategory = genderCategory.mainCategories.find(cat => cat.id === mainCategoryId)
  if (!mainCategory) return null

  if (subCategoryId) {
    const subCategory = mainCategory.subCategories.find(cat => cat.id === subCategoryId)
    return subCategory || null
  }

  return mainCategory
}

export const getSelectedCategoryPath = (genderId: string, mainCategoryId: string, subCategoryId?: string) => {
  const genderCategory = CATEGORIES.find(cat => cat.id === genderId)
  if (!genderCategory) return ''

  const mainCategory = genderCategory.mainCategories.find(cat => cat.id === mainCategoryId)
  if (!mainCategory) return ''

  if (subCategoryId) {
    const subCategory = mainCategory.subCategories.find(cat => cat.id === subCategoryId)
    return subCategory ? `${mainCategory.name} > ${subCategory.name}` : mainCategory.name
  }

  return mainCategory.name
}
