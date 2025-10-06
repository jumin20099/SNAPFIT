package com.snapfit.api.service;

import com.snapfit.api.dto.AnswerInquiryRequest;
import com.snapfit.api.dto.CreateInquiryRequest;
import com.snapfit.api.dto.ProductInquiryDto;
import com.snapfit.api.entity.ProductInquiry;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.ProductInquiryRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductInquiryService {
    
    private final ProductInquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 문의 작성
     */
    @Transactional
    public ProductInquiryDto createInquiry(UUID userId, Long productId, CreateInquiryRequest request, String anonymousPasswordHash, Integer anonymousIndex) {
        log.info("문의 작성 요청: userId={}, productId={}", userId, productId);
        
        User user = null;
        
        // 로그인된 사용자인 경우 사용자 조회
        if (userId != null) {
            user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        }
        
        // 문의 생성
        ProductInquiry inquiry = ProductInquiry.builder()
            .productId(productId)
            .user(user)
            .title(request.getTitle())
            .content(request.getContent())
            .isPrivate(request.getIsPrivate())
            .status(ProductInquiry.InquiryStatus.OPEN)
            .anonymousIndex(anonymousIndex)
            .anonymousPasswordHash(anonymousPasswordHash)
            .build();
        
        inquiry = inquiryRepository.save(inquiry);
        log.info("문의 작성 완료: inquiryId={}", inquiry.getInquiryId());
        
        return convertToDto(inquiry, false);
    }
    
    /**
     * 문의 삭제
     */
    @Transactional
    public void deleteInquiry(Long inquiryId, UUID userId, String password) {
        log.info("문의 삭제 요청: inquiryId={}, userId={}", inquiryId, userId);
        
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        if (inquiry.getUser() != null) {
            // 로그인된 사용자의 문의인 경우
            if (userId == null || !inquiry.getUser().getUserIdx().equals(userId)) {
                throw new RuntimeException("본인의 문의만 삭제할 수 있습니다");
            }
        } else {
            // 익명 문의인 경우 비밀번호 검증
            if (password == null || inquiry.getAnonymousPasswordHash() == null ||
                !passwordEncoder.matches(password, inquiry.getAnonymousPasswordHash())) {
                throw new RuntimeException("비밀번호가 올바르지 않습니다");
            }
        }
        
        inquiryRepository.delete(inquiry);
        log.info("문의 삭제 완료: inquiryId={}", inquiryId);
    }
    
    /**
     * 상품별 문의 목록 조회 (접근 제어 적용)
     */
    @Transactional(readOnly = true)
    public Page<ProductInquiryDto> getProductInquiries(Long productId, Pageable pageable, UUID currentUserId) {
        Page<ProductInquiry> inquiries;
        
        log.info("문의 조회 요청: productId={}, currentUserId={}", productId, currentUserId);
        
        if (currentUserId != null) {
            // 로그인 사용자: 본인 문의 + 공개 문의
            inquiries = inquiryRepository.findByProductIdAndUserAccessOrderByCreatedAtDesc(
                productId, currentUserId, pageable);
            log.info("사용자 접근 쿼리 결과: {}개 문의", inquiries.getTotalElements());
        } else {
            // 비로그인 사용자: 공개 문의만
            inquiries = inquiryRepository.findByProductIdAndIsPrivateFalseOrderByCreatedAtDesc(
                productId, pageable);
            log.info("공개 문의 쿼리 결과: {}개 문의", inquiries.getTotalElements());
        }
        
        return inquiries.map(inquiry -> convertToDto(inquiry, canUserAnswer(currentUserId, inquiry)));
    }
    
    /**
     * 사용자의 문의 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<ProductInquiryDto> getUserInquiries(UUID userId, Pageable pageable) {
        Page<ProductInquiry> inquiries = inquiryRepository.findByUserUserIdxOrderByCreatedAtDesc(userId, pageable);
        return inquiries.map(inquiry -> convertToDto(inquiry, false));
    }
    
    /**
     * 답변 대기 중인 문의 목록 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public Page<ProductInquiryDto> getPendingInquiries(Pageable pageable, UUID currentUserId) {
        Page<ProductInquiry> inquiries = inquiryRepository.findByStatusOrderByCreatedAtDesc(
            ProductInquiry.InquiryStatus.OPEN, pageable);
        
        return inquiries.map(inquiry -> convertToDto(inquiry, canUserAnswer(currentUserId, inquiry)));
    }
    
    /**
     * 문의 답변
     */
    @Transactional
    public ProductInquiryDto answerInquiry(Long inquiryId, AnswerInquiryRequest request, UUID answeredBy) {
        log.info("문의 답변 요청: inquiryId={}, answeredBy={}", inquiryId, answeredBy);
        
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        if (!inquiry.canBeAnswered()) {
            throw new RuntimeException("답변할 수 없는 문의입니다");
        }
        
        // 답변자 조회
        User answerer = userRepository.findById(answeredBy)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 답변 업데이트
        inquiry.setAnswer(request.getAnswer());
        inquiry.setAnsweredBy(answerer);
        inquiry.setAnsweredAt(LocalDateTime.now());
        inquiry.setStatus(ProductInquiry.InquiryStatus.ANSWERED);
        
        inquiry = inquiryRepository.save(inquiry);
        log.info("문의 답변 완료: inquiryId={}", inquiryId);
        
        return convertToDto(inquiry, true);
    }
    
    /**
     * 문의 상태 변경 (관리자용)
     */
    @Transactional
    public ProductInquiryDto updateInquiryStatus(Long inquiryId, ProductInquiry.InquiryStatus status, UUID updatedBy) {
        log.info("문의 상태 변경 요청: inquiryId={}, status={}, updatedBy={}", inquiryId, status, updatedBy);
        
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        inquiry.setStatus(status);
        inquiry = inquiryRepository.save(inquiry);
        
        return convertToDto(inquiry, canUserAnswer(updatedBy, inquiry));
    }
    
    /**
     * 문의 삭제 (작성자만 가능)
     */
    @Transactional
    public void deleteInquiry(Long inquiryId, UUID userId) {
        log.info("문의 삭제 요청: inquiryId={}, userId={}", inquiryId, userId);
        
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        if (!inquiry.getUser().getUserIdx().equals(userId)) {
            throw new RuntimeException("본인의 문의만 삭제할 수 있습니다");
        }
        
        inquiryRepository.delete(inquiry);
        log.info("문의 삭제 완료: inquiryId={}", inquiryId);
    }
    
    /**
     * 사용자가 답변할 수 있는지 확인
     */
    private boolean canUserAnswer(UUID userId, ProductInquiry inquiry) {
        if (userId == null) return false;
        
        // TODO: 관리자 권한 확인 로직 추가 필요
        // 현재는 모든 로그인 사용자가 답변 가능하도록 설정
        return true;
    }
    
    /**
     * 엔티티를 DTO로 변환
     */
    private ProductInquiryDto convertToDto(ProductInquiry inquiry, boolean canBeAnswered) {
        return ProductInquiryDto.builder()
            .inquiryId(inquiry.getInquiryId())
            .productId(inquiry.getProductId())
            .userId(inquiry.getUser().getUserIdx())
            .userNickname(inquiry.getUser().getNickname())
            .userProfileImage(inquiry.getUser().getProfileImage())
            .title(inquiry.getTitle())
            .content(inquiry.getContent())
            .isPrivate(inquiry.getIsPrivate())
            .status(inquiry.getStatus())
            .answer(inquiry.getAnswer())
            .answeredBy(inquiry.getAnsweredBy() != null ? inquiry.getAnsweredBy().getUserIdx() : null)
            .answeredByNickname(inquiry.getAnsweredBy() != null ? inquiry.getAnsweredBy().getNickname() : null)
            .answeredAt(inquiry.getAnsweredAt())
            .createdAt(inquiry.getCreatedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .canBeAnswered(canBeAnswered)
            .build();
    }
}
