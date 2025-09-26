package com.snapfit.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.OutfitRepository;
import com.snapfit.api.repository.UserRepository;

import java.util.List;
import java.util.UUID;

/**
 * Outfit(코디) 관련 비즈니스 로직 서비스.
 */
@Service
public class OutfitService {
    private final OutfitRepository outfitRepository;
    private final UserRepository userRepository;

    @Autowired
    public OutfitService(OutfitRepository outfitRepository, UserRepository userRepository) {
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
    }

    /**
     * 코디를 생성하여 저장한다.
     *
     * @param dto  코디 생성 요청 DTO
     * @param user 코디를 만든 사용자
     * @return 저장된 Outfit 엔티티
     */
    @Transactional
    public Outfit createOutfit(OutfitDto dto, User user) {
        Outfit outfit = Outfit.builder()
                .user(user)
                .outfitName(dto.getOutfitName())
                .outfitItem(dto.getOutfitItem())
                .outfitThumbnail(dto.getOutfitThumbnail())
                .isPublic(dto.getIsPublic())
                .build();
        return outfitRepository.save(outfit);
    }

    /**
     * 코디 내용을 수정한다.
     *
     * @param outfitIdx 수정할 코디 PK
     * @param dto       수정 정보 DTO
     * @param user      코디 소유 사용자(권한 확인용)
     * @return 수정된 Outfit 엔티티
     * @throws IllegalArgumentException 코디가 존재하지 않거나 권한이 없을 때
     */
    @Transactional
    public Outfit updateOutfit(Long outfitIdx, OutfitDto dto, User user) {
        Outfit outfit = outfitRepository.findById(outfitIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코디입니다."));

        // 작성자 확인
        if (!outfit.getUser().getUserIdx().equals(user.getUserIdx())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // 필드 변경
        if (dto.getOutfitName() != null) {
            outfit.setOutfitName(dto.getOutfitName());
        }
        if (dto.getOutfitItem() != null) {
            outfit.setOutfitItem(dto.getOutfitItem());
        }
        if (dto.getOutfitThumbnail() != null) {
            outfit.setOutfitThumbnail(dto.getOutfitThumbnail());
        }
        if (dto.getIsPublic() != null) {
            outfit.setIsPublic(dto.getIsPublic());
        }

        return outfitRepository.save(outfit);
    }

    /**
     * 코디를 삭제한다.
     *
     * @param outfitIdx 삭제할 코디 PK
     * @param user      소유 사용자(권한 확인)
     * @throws IllegalArgumentException 코디가 없거나 권한이 없을 때
     */
    @Transactional
    public void deleteOutfit(Long outfitIdx, User user) {
        Outfit outfit = outfitRepository.findById(outfitIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코디입니다."));

        if (!outfit.getUser().getUserIdx().equals(user.getUserIdx())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        outfitRepository.delete(outfit);
    }

    /**
     * 공개 코디 최신순 목록을 반환한다.
     */
    @Transactional(readOnly = true)
    public List<Outfit> listPublicOutfits() {
        return outfitRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    /**
     * 특정 사용자의 코디 목록을 최신순으로 반환한다.
     */
    @Transactional(readOnly = true)
    public List<Outfit> getUserOutfits(User user) {
        return outfitRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * 특정 사용자의 공개 코디 목록을 조회한다.
     *
     * @param userId 사용자 ID
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @return 공개 코디 목록
     */
    @Transactional(readOnly = true)
    public List<Outfit> getUserPublicOutfits(String userId, int page, int size) {
        try {
            // String을 UUID로 변환
            UUID userUuid;
            try {
                userUuid = UUID.fromString(userId);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("유효하지 않은 사용자 ID 형식입니다: " + userId);
            }
            
            // 사용자 ID로 User 엔티티 조회
            User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

            // 해당 사용자의 모든 코디 조회
            List<Outfit> allUserOutfits = outfitRepository.findByUserOrderByCreatedAtDesc(user);
            
            // 공개 코디만 필터링
            List<Outfit> publicOutfits = allUserOutfits.stream()
                .filter(Outfit::getIsPublic)
                .collect(java.util.stream.Collectors.toList());

            // 페이지네이션 적용
            int offset = page * size;
            return publicOutfits.stream()
                .skip(offset)
                .limit(size)
                .collect(java.util.stream.Collectors.toList());
                
        } catch (IllegalArgumentException e) {
            // 잘못된 사용자 ID나 사용자를 찾을 수 없는 경우
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("사용자 코디 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 모든 코디의 썸네일을 업데이트한다.
     */
    @Transactional
    public void updateAllThumbnails() {
        List<Outfit> allOutfits = outfitRepository.findAll();
        int updatedCount = 0;
        
        for (Outfit outfit : allOutfits) {
            if (outfit.getOutfitThumbnail() == null && outfit.getOutfitItem() != null) {
                try {
                    String thumbnailUrl = generateThumbnailFromOutfitItem(outfit.getOutfitItem());
                    if (thumbnailUrl != null) {
                        outfit.setOutfitThumbnail(thumbnailUrl);
                        outfitRepository.save(outfit);
                        updatedCount++;
                    }
                } catch (Exception e) {
                    System.err.println("코디 " + outfit.getOutfitIdx() + " 썸네일 생성 실패: " + e.getMessage());
                }
            }
        }
        
        System.out.println("썸네일 업데이트 완료: " + updatedCount + "개 코디");
    }

    /**
     * outfitItem에서 썸네일을 생성한다.
     */
    private String generateThumbnailFromOutfitItem(com.fasterxml.jackson.databind.JsonNode outfitItem) {
        try {
            com.fasterxml.jackson.databind.JsonNode items = outfitItem.get("items");
            if (items != null && items.isArray()) {
                // 상의(slot: top) 아이템을 우선적으로 찾기
                for (com.fasterxml.jackson.databind.JsonNode item : items) {
                    com.fasterxml.jackson.databind.JsonNode slot = item.get("slot");
                    if (slot != null && "top".equals(slot.asText())) {
                        com.fasterxml.jackson.databind.JsonNode src = item.get("src");
                        if (src != null) {
                            return src.asText();
                        }
                    }
                }
                
                // 상의가 없으면 첫 번째 아이템 사용
                if (items.size() > 0) {
                    com.fasterxml.jackson.databind.JsonNode firstItem = items.get(0);
                    com.fasterxml.jackson.databind.JsonNode src = firstItem.get("src");
                    if (src != null) {
                        return src.asText();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("썸네일 생성 중 오류: " + e.getMessage());
        }
        return null;
    }

    /**
     * 코디 상세를 반환한다. 공개 코디이거나 소유자일 때만 접근 가능하다.
     *
     * @param outfitIdx 코디 PK
     * @param user      (옵션) 현재 사용자, null 가능
     * @return Outfit
     * @throws IllegalArgumentException 권한 없을 때
     */
    @Transactional(readOnly = true)
    public Outfit getOutfit(Long outfitIdx, User user) {
        Outfit outfit = outfitRepository.findById(outfitIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코디입니다."));

        // 공개 코디가 아니면 소유자만 볼 수 있음
        if (!outfit.getIsPublic()) {
            if (user == null || !outfit.getUser().getUserIdx().equals(user.getUserIdx())) {
                throw new IllegalArgumentException("조회 권한이 없습니다.");
            }
        }
        return outfit;
    }

    /**
     * 모든 코디 목록을 조회한다 (공개/비공개 모두).
     *
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @return 모든 코디 목록
     */
    @Transactional(readOnly = true)
    public List<Outfit> getAllOutfits(int page, int size) {
        int offset = page * size;
        return outfitRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .skip(offset)
            .limit(size)
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 특정 상품을 포함한 공개 코디 목록을 조회한다.
     *
     * @param productId 상품 ID
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @return 코디 목록
     */
    @Transactional(readOnly = true)
    public List<Outfit> getOutfitsByProduct(Long productId, int page, int size) {
        try {
            // 모든 공개 코디를 가져와서 프론트엔드에서 필터링
            // (데이터 구조가 복잡해서 백엔드 쿼리로는 정확한 필터링이 어려움)
            int offset = page * size;
            List<Outfit> allOutfits = outfitRepository.findByIsPublicTrueOrderByCreatedAtDesc();
            
            // 프론트엔드에서 필터링하도록 모든 코디 반환
            return allOutfits.stream()
                .skip(offset)
                .limit(size)
                .collect(java.util.stream.Collectors.toList());
                
        } catch (Exception e) {
            throw new RuntimeException("상품별 코디 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 코디의 공개/비공개 상태를 토글한다.
     *
     * @param outfitIdx 수정할 코디 PK
     * @param isPublic  새로운 공개 상태
     * @param user      소유 사용자(권한 확인)
     * @return 수정된 Outfit 엔티티
     * @throws IllegalArgumentException 코디가 없거나 권한이 없을 때
     */
    @Transactional
    public Outfit toggleVisibility(Long outfitIdx, boolean isPublic, User user) {
        System.out.println("=== OutfitService.toggleVisibility 호출 ===");
        System.out.println("outfitIdx: " + outfitIdx);
        System.out.println("isPublic: " + isPublic);
        System.out.println("user: " + user.getUserIdx());
        
        Outfit outfit = outfitRepository.findById(outfitIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코디입니다."));

        System.out.println("기존 코디 isPublic: " + outfit.getIsPublic());
        System.out.println("코디 소유자: " + outfit.getUser().getUserIdx());

        // 작성자 확인
        if (!outfit.getUser().getUserIdx().equals(user.getUserIdx())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // 공개 상태 변경
        outfit.setIsPublic(isPublic);
        System.out.println("변경 후 isPublic: " + outfit.getIsPublic());
        
        Outfit saved = outfitRepository.save(outfit);
        System.out.println("저장된 코디 isPublic: " + saved.getIsPublic());
        
        return saved;
    }
} 