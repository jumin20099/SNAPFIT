package com.snapfit.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.OutfitRepository;

import java.util.List;

/**
 * Outfit(코디) 관련 비즈니스 로직 서비스.
 */
@Service
public class OutfitService {
    private final OutfitRepository outfitRepository;

    @Autowired
    public OutfitService(OutfitRepository outfitRepository) {
        this.outfitRepository = outfitRepository;
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
} 