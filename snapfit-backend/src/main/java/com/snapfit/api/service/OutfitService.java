package com.snapfit.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.OutfitRepository;

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
} 