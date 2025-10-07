#!/usr/bin/env node

/**
 * SnapFit 테스트 데이터 시드 스크립트
 * 테스트에 필요한 샘플 데이터를 자동으로 생성합니다.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// 테스트 데이터
const testData = {
  users: [
    {
      email: 'test1@example.com',
      nickname: '테스트유저1',
      password: 'password123',
      role: 'USER'
    },
    {
      email: 'test2@example.com', 
      nickname: '테스트유저2',
      password: 'password123',
      role: 'USER'
    },
    {
      email: 'admin@example.com',
      nickname: '관리자',
      password: 'admin123',
      role: 'ADMIN'
    }
  ],
  products: [
    {
      name: '테스트 셔츠',
      description: '테스트용 셔츠입니다',
      price: 29900,
      brand: '테스트브랜드',
      category: '상의',
      imageUrl: 'https://picsum.photos/400/600?random=1'
    },
    {
      name: '테스트 바지',
      description: '테스트용 바지입니다',
      price: 39900,
      brand: '테스트브랜드',
      category: '하의',
      imageUrl: 'https://picsum.photos/400/600?random=2'
    },
    {
      name: '테스트 신발',
      description: '테스트용 신발입니다',
      price: 59900,
      brand: '테스트브랜드',
      category: '신발',
      imageUrl: 'https://picsum.photos/400/600?random=3'
    }
  ],
  posts: [
    // 코디 공유 게시글들
    {
      title: '오늘의 데일리 코디',
      content: '심플한 화이트 셔츠와 데님으로 완성한 데일리 룩입니다!',
      boardType: 'OUTFIT',
      images: ['https://picsum.photos/400/600?random=4'],
      tags: ['데일리', '심플', '화이트', '데님']
    },
    {
      title: '비즈니스 캐주얼 코디',
      content: '회사에서도 입을 수 있는 세련된 비즈니스 캐주얼 룩',
      boardType: 'OUTFIT',
      images: ['https://picsum.photos/400/600?random=5'],
      tags: ['비즈니스', '캐주얼', '세련된']
    },
    {
      title: '데이트 코디 추천',
      content: '첫 데이트에 어울리는 로맨틱한 코디입니다 💕',
      boardType: 'OUTFIT',
      images: ['https://picsum.photos/400/600?random=6'],
      tags: ['데이트', '로맨틱', '추천']
    },
    // 질문 게시글들
    {
      title: '이 셔츠 어떤 바지와 매치하면 좋을까요?',
      content: '새로 산 셔츠인데 어떤 바지와 매치하면 좋을지 조언 부탁드려요!',
      boardType: 'QUESTION',
      images: ['https://picsum.photos/400/600?random=7'],
      tags: ['질문', '매치', '조언']
    },
    {
      title: '겨울 코트 추천해주세요',
      content: '추운 겨울에 입을 만한 따뜻하고 스타일리시한 코트 추천 부탁드려요',
      boardType: 'QUESTION',
      images: ['https://picsum.photos/400/600?random=8'],
      tags: ['겨울', '코트', '추천']
    },
    {
      title: '이 신발이 제 스타일과 어울릴까요?',
      content: '새로 구매한 신발인데 제 스타일과 잘 어울리는지 궁금합니다',
      boardType: 'QUESTION',
      images: ['https://picsum.photos/400/600?random=9'],
      tags: ['신발', '스타일', '어울림']
    },
    // 정보 게시글들
    {
      title: '2024년 패션 트렌드 정리',
      content: '올해 주목받는 패션 트렌드들을 정리해봤습니다',
      boardType: 'INFO',
      images: ['https://picsum.photos/400/600?random=10'],
      tags: ['트렌드', '2024', '정보']
    },
    {
      title: '옷 관리하는 방법',
      content: '옷을 오래 입을 수 있도록 관리하는 팁들을 공유합니다',
      boardType: 'INFO',
      images: ['https://picsum.photos/400/600?random=11'],
      tags: ['관리', '팁', '보관']
    },
    {
      title: '온라인 쇼핑 할인 정보',
      content: '이번 주 주요 온라인 쇼핑몰 할인 정보를 모아봤습니다',
      boardType: 'INFO',
      images: ['https://picsum.photos/400/600?random=12'],
      tags: ['할인', '쇼핑', '정보']
    }
  ],
  cody: [
    {
      name: '데일리 룩',
      description: '일상에서 입기 좋은 심플한 코디',
      items: ['화이트 셔츠', '데님 바지', '화이트 스니커즈'],
      imageUrl: 'https://picsum.photos/400/600?random=13'
    },
    {
      name: '비즈니스 캐주얼',
      description: '회사에서도 입을 수 있는 세련된 코디',
      items: ['블레이저', '슬랙스', '로퍼'],
      imageUrl: 'https://picsum.photos/400/600?random=14'
    },
    {
      name: '데이트 룩',
      description: '특별한 날을 위한 로맨틱한 코디',
      items: ['원피스', '힐', '가방'],
      imageUrl: 'https://picsum.photos/400/600?random=15'
    }
  ],
  partnerApplications: [
    {
      businessName: '테스트 패션 브랜드',
      businessType: '의류',
      contactEmail: 'partner1@example.com',
      phoneNumber: '010-1234-5678',
      businessDescription: '트렌디한 의류를 판매하는 브랜드입니다',
      website: 'https://test-brand.com',
      instagram: '@test_brand',
      status: 'PENDING'
    },
    {
      businessName: '스타일리시 액세서리',
      businessType: '액세서리',
      contactEmail: 'partner2@example.com',
      phoneNumber: '010-2345-6789',
      businessDescription: '세련된 액세서리를 판매합니다',
      website: 'https://accessory-shop.com',
      instagram: '@accessory_shop',
      status: 'APPROVED'
    }
  ]
};

class TestDataSeeder {
  constructor() {
    this.authTokens = {};
    this.createdIds = {
      users: [],
      products: [],
      posts: []
    };
  }

  async makeRequest(method, url, data = null, headers = {}) {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    return await axios(config);
  }

  async createTestUsers() {
    console.log('👥 테스트 사용자 생성 중...');
    
    for (const userData of testData.users) {
      try {
        // 사용자 등록 (실제 API 엔드포인트에 맞게 수정 필요)
        const response = await this.makeRequest('POST', '/api/auth/register', userData);
        console.log(`✅ 사용자 생성: ${userData.nickname}`);
        
        // 로그인하여 토큰 획득
        const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
          email: userData.email,
          password: userData.password
        });
        
        this.authTokens[userData.email] = loginResponse.data.token;
        this.createdIds.users.push(response.data.userId);
        
      } catch (error) {
        console.log(`⚠️ 사용자 생성 실패 (이미 존재할 수 있음): ${userData.nickname}`);
      }
    }
  }

  async createTestProducts() {
    console.log('🛍️ 테스트 상품 생성 중...');
    
    for (const productData of testData.products) {
      try {
        const response = await this.makeRequest('POST', '/api/products', productData);
        console.log(`✅ 상품 생성: ${productData.name}`);
        this.createdIds.products.push(response.data.productId);
      } catch (error) {
        console.log(`⚠️ 상품 생성 실패: ${productData.name}`);
      }
    }
  }

  async createTestPosts() {
    console.log('📝 테스트 게시글 생성 중...');
    
    const userToken = this.authTokens['test1@example.com'];
    if (!userToken) {
      console.log('⚠️ 사용자 토큰이 없어 게시글을 생성할 수 없습니다.');
      return;
    }

    for (const postData of testData.posts) {
      try {
        const response = await this.makeRequest('POST', '/api/posts', postData, {
          'Authorization': `Bearer ${userToken}`
        });
        console.log(`✅ 게시글 생성: ${postData.title}`);
        this.createdIds.posts.push(response.data.postId);
      } catch (error) {
        console.log(`⚠️ 게시글 생성 실패: ${postData.title}`);
      }
    }
  }

  async createTestComments() {
    console.log('💬 테스트 댓글 생성 중...');
    
    const userToken = this.authTokens['test2@example.com'];
    if (!userToken || this.createdIds.posts.length === 0) {
      console.log('⚠️ 사용자 토큰이나 게시글이 없어 댓글을 생성할 수 없습니다.');
      return;
    }

    const comments = [
      '정말 멋진 코디네요!',
      '어디서 구매하셨나요?',
      '색상 조합이 좋네요',
      '저도 비슷하게 입어보고 싶어요'
    ];

    for (const postId of this.createdIds.posts) {
      for (const comment of comments) {
        try {
          await this.makeRequest('POST', `/api/comments`, {
            postId: postId,
            content: comment
          }, {
            'Authorization': `Bearer ${userToken}`
          });
          console.log(`✅ 댓글 생성: ${comment.substring(0, 10)}...`);
        } catch (error) {
          console.log(`⚠️ 댓글 생성 실패: ${comment}`);
        }
      }
    }
  }

  async createTestLikes() {
    console.log('❤️ 테스트 좋아요 생성 중...');
    
    const userToken = this.authTokens['test2@example.com'];
    if (!userToken) {
      console.log('⚠️ 사용자 토큰이 없어 좋아요를 생성할 수 없습니다.');
      return;
    }

    // 게시글 좋아요
    for (const postId of this.createdIds.posts) {
      try {
        await this.makeRequest('POST', `/api/posts/${postId}/like`, {}, {
          'Authorization': `Bearer ${userToken}`
        });
        console.log(`✅ 게시글 좋아요: ${postId}`);
      } catch (error) {
        console.log(`⚠️ 게시글 좋아요 실패: ${postId}`);
      }
    }

    // 상품 좋아요
    for (const productId of this.createdIds.products) {
      try {
        await this.makeRequest('POST', `/api/products/${productId}/like`, {}, {
          'Authorization': `Bearer ${userToken}`
        });
        console.log(`✅ 상품 좋아요: ${productId}`);
      } catch (error) {
        console.log(`⚠️ 상품 좋아요 실패: ${productId}`);
      }
    }
  }

  async createTestFollows() {
    console.log('👥 테스트 팔로우 관계 생성 중...');
    
    const user1Token = this.authTokens['test1@example.com'];
    const user2Token = this.authTokens['test2@example.com'];
    
    if (!user1Token || !user2Token) {
      console.log('⚠️ 사용자 토큰이 없어 팔로우를 생성할 수 없습니다.');
      return;
    }

    try {
      // test2가 test1을 팔로우
      await this.makeRequest('POST', `/api/follows/${this.createdIds.users[0]}`, {}, {
        'Authorization': `Bearer ${user2Token}`
      });
      console.log('✅ 팔로우 관계 생성: test2 -> test1');
    } catch (error) {
      console.log('⚠️ 팔로우 생성 실패');
    }
  }

  async createTestScraps() {
    console.log('📌 테스트 스크랩 생성 중...');
    
    const userToken = this.authTokens['test1@example.com'];
    if (!userToken) {
      console.log('⚠️ 사용자 토큰이 없어 스크랩을 생성할 수 없습니다.');
      return;
    }

    // 상품 스크랩
    for (const productId of this.createdIds.products) {
      try {
        await this.makeRequest('POST', `/api/scraps/products/${productId}`, {}, {
          'Authorization': `Bearer ${userToken}`
        });
        console.log(`✅ 상품 스크랩: ${productId}`);
      } catch (error) {
        console.log(`⚠️ 상품 스크랩 실패: ${productId}`);
      }
    }

    // 게시글 스크랩
    for (const postId of this.createdIds.posts) {
      try {
        await this.makeRequest('POST', `/api/scraps/posts/${postId}`, {}, {
          'Authorization': `Bearer ${userToken}`
        });
        console.log(`✅ 게시글 스크랩: ${postId}`);
      } catch (error) {
        console.log(`⚠️ 게시글 스크랩 실패: ${postId}`);
      }
    }
  }

  async createTestCody() {
    console.log('👔 테스트 코디 생성 중...');
    
    const userToken = this.authTokens['test1@example.com'];
    if (!userToken) {
      console.log('⚠️ 사용자 토큰이 없어 코디를 생성할 수 없습니다.');
      return;
    }

    for (const codyData of testData.cody) {
      try {
        const response = await this.makeRequest('POST', '/api/cody', codyData, {
          'Authorization': `Bearer ${userToken}`
        });
        console.log(`✅ 코디 생성: ${codyData.name}`);
        this.createdIds.cody = this.createdIds.cody || [];
        this.createdIds.cody.push(response.data.codyId);
      } catch (error) {
        console.log(`⚠️ 코디 생성 실패: ${codyData.name}`);
      }
    }
  }

  async createTestPartnerApplications() {
    console.log('🤝 테스트 파트너 신청 생성 중...');
    
    for (const appData of testData.partnerApplications) {
      try {
        const response = await this.makeRequest('POST', '/api/partner/applications', appData);
        console.log(`✅ 파트너 신청 생성: ${appData.businessName}`);
        this.createdIds.partnerApplications = this.createdIds.partnerApplications || [];
        this.createdIds.partnerApplications.push(response.data.applicationId);
      } catch (error) {
        console.log(`⚠️ 파트너 신청 생성 실패: ${appData.businessName}`);
      }
    }
  }

  async seedAllData() {
    console.log('🌱 SnapFit 포괄적 테스트 데이터 시드 시작...\n');
    
    try {
      await this.createTestUsers();
      await this.createTestProducts();
      await this.createTestPosts();
      await this.createTestComments();
      await this.createTestLikes();
      await this.createTestFollows();
      await this.createTestScraps();
      await this.createTestCody();
      await this.createTestPartnerApplications();
      
      console.log('\n✅ 테스트 데이터 시드 완료!');
      console.log(`👥 생성된 사용자: ${this.createdIds.users.length}명`);
      console.log(`🛍️ 생성된 상품: ${this.createdIds.products.length}개`);
      console.log(`📝 생성된 게시글: ${this.createdIds.posts.length}개`);
      
      // 생성된 데이터 ID 저장
      const fs = require('fs');
      fs.writeFileSync('test-data-ids.json', JSON.stringify(this.createdIds, null, 2));
      console.log('\n📄 생성된 데이터 ID가 test-data-ids.json에 저장되었습니다.');
      
    } catch (error) {
      console.error('❌ 테스트 데이터 시드 실패:', error.message);
      process.exit(1);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const seeder = new TestDataSeeder();
  seeder.seedAllData();
}

module.exports = TestDataSeeder;
