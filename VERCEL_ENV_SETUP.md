# Vercel 환경변수 설정 가이드

## 🔧 **필수 환경변수 설정**

Vercel 대시보드에서 다음 환경변수들을 설정해야 합니다:

### **프론트엔드 URL**
```
NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
```

### **백엔드 API URL**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
```

### **카카오 OAuth2 설정**
```
KAKAO_CLIENT_ID=9e878c5d330f8a6830d3673eb9691989
KAKAO_CLIENT_SECRET=yYJO4N9s4loyI6JeEDg7CxedKw7yJy0
KAKAO_REDIRECT_URI=https://your-app.vercel.app/auth/kakao/callback
```

### **PortOne 결제 설정**
```
NEXT_PUBLIC_PORTONE_STORE_ID=your_store_id
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your_channel_key
```

## 🚨 **중요: 카카오 개발자 콘솔 설정**

1. **카카오 개발자 콘솔** (https://developers.kakao.com) 접속
2. **내 애플리케이션** → **플랫폼** → **Web 플랫폼 등록**
3. **사이트 도메인** 추가:
   - `https://your-app.vercel.app`
4. **Redirect URI** 추가:
   - `https://your-app.vercel.app/auth/kakao/callback`

## 🔄 **백엔드 OAuth2 설정 수정**

백엔드의 `application-prod.properties`에서:

```properties
# OAuth2 카카오 설정 (프로덕션)
spring.security.oauth2.client.registration.kakao.client-id=${KAKAO_CLIENT_ID}
spring.security.oauth2.client.registration.kakao.client-secret=${KAKAO_CLIENT_SECRET}
spring.security.oauth2.client.registration.kakao.redirect-uri=${FRONTEND_URL}/auth/kakao/callback
```

## 📝 **설정 순서**

1. Vercel에 환경변수 설정
2. 카카오 개발자 콘솔에서 Redirect URI 추가
3. 백엔드 배포 시 환경변수 설정
4. 테스트 진행
