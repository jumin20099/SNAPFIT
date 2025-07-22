# CLAUDE.md ─ SnapFit 핵심 메모 (토큰 절약 버전)

> **규칙**
> 1. 항상 **한국어**로 짧고 핵심만 답한다.  
> 2. “듣고 싶은 말”이 아닌 “들어야 할 말”을 우선한다.
> 3. 사용자 친화적인 웹 서비스에 초점을 맞춘다.
> 4. 코드를 수정할땐 **절대** 기존의 UI, 로직에서 벗어나면 안된다.

---

## 1. 프로젝트 한줄 요약
Next.js 14 + Spring Boot 3 (PostgreSQL, S3) 기반 패션 코디 플랫폼.

## 2. 자주 쓰는 명령
```bash
npm run dev          # 프론트 (3000)
cd snapfit-backend && ./gradlew bootRun   # 백엔드 (8080)
npm run start        # 둘 다 동시

app/                # Next.js App Router + API proxy
src/components/     # React UI (shadcn/ui)
snapfit-backend/    # Spring Boot

## 구분	한줄 원칙
재활용	공통 컴포넌트·Hook·유틸 함수 중앙화
보안	역할기반 RBAC + 토큰 만료·갱신 관리
관리	TypeScript strict + 일관된 네이밍
한국특화	모든 UI · 메시지 한국어, 모바일 우선
확장	도메인 인터페이스로 제휴사·카테고리 유연화

API는 RESTfull 원칙을 따라야함