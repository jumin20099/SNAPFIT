package com.snapfit.api.service;

import com.snapfit.api.entity.AnonymousUserMapping;
import com.snapfit.api.repository.AnonymousUserMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnonymousUserService {
    
    private final AnonymousUserMappingRepository anonymousUserMappingRepository;
    
    /**
     * 익명 사용자의 인덱스를 가져오거나 새로 할당
     * @param postId 게시글 ID
     * @param userIdentifier 사용자 식별자 (IP 주소 등)
     * @return 익명 인덱스 (1부터 시작)
     */
    @Transactional
    public Integer getOrAssignAnonymousIndex(Long postId, String userIdentifier) {
        log.info("익명 사용자 인덱스 조회/할당: postId={}, userIdentifier={}", postId, userIdentifier);
        
        // 기존 매핑이 있는지 확인
        Optional<AnonymousUserMapping> existingMapping = 
            anonymousUserMappingRepository.findByPostIdAndUserIdentifier(postId, userIdentifier);
        
        if (existingMapping.isPresent()) {
            log.info("기존 익명 인덱스 반환: {}", existingMapping.get().getAnonymousIndex());
            return existingMapping.get().getAnonymousIndex();
        }
        
        // 새로운 익명 인덱스 할당
        Integer nextIndex = anonymousUserMappingRepository.getNextAnonymousIndex(postId);
        
        // 새로운 매핑 생성 및 저장
        AnonymousUserMapping newMapping = AnonymousUserMapping.builder()
            .postId(postId)
            .userIdentifier(userIdentifier)
            .anonymousIndex(nextIndex)
            .build();
        
        anonymousUserMappingRepository.save(newMapping);
        
        log.info("새 익명 인덱스 할당: {}", nextIndex);
        return nextIndex;
    }
    
    /**
     * 익명 사용자 이름 생성 (익명1, 익명2, ...)
     */
    public String generateAnonymousName(Integer anonymousIndex) {
        return "익명" + anonymousIndex;
    }
    
    /**
     * 특정 게시글의 익명 사용자 수 조회
     */
    public Long getAnonymousUserCount(Long postId) {
        return anonymousUserMappingRepository.countByPostId(postId);
    }
}
