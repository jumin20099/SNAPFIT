# 계약 우선 개발 프롬프트 템플릿

## Mode: "Return unified diff only. No prose."

## Scope: "Only edit <files> and keep all unrelated logic intact."

## Invariants: "Do not change API contract/types outside of this diff."

## Goal: "Make tests in <tests> pass. If unsure, add minimal logs/guards."

## Exit: "If contract missing, propose OpenAPI change in a separate patch."

---

## 사용법

1. **API 변경 시**: 먼저 OpenAPI 스키마 변경 제안
2. **구현 시**: 테스트를 통과하는 최소한의 패치만 생성
3. **에러 처리**: 로그 추가 후 빠른 실패로 디버깅 시간 단축

## 금지 사항

- ❌ 전체 리포 스캔
- ❌ 관련 없는 로직 변경
- ❌ API 계약 임의 변경
- ❌ 대화형 설명 (diff만)

## 예시

```
# 좋아요 토글 API 수정
Files: app/api/likes/toggle/route.ts
Tests: tests/e2e/likes-and-scraps.spec.ts
Goal: 401 에러 해결, 테스트 통과

# 스크랩 토글 API 수정  
Files: app/api/scraps/toggle/route.ts
Tests: tests/e2e/likes-and-scraps.spec.ts
Goal: 401 에러 해결, 테스트 통과
```
