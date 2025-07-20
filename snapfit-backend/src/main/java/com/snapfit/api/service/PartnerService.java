package com.snapfit.api.service;

import com.snapfit.api.dto.PartnerApplicationDto;
import com.snapfit.api.dto.PartnerProductDto;
import com.snapfit.api.dto.PartnerDashboardDto;
import com.snapfit.api.dto.PartnerApplicationAdminDto;
import com.snapfit.api.dto.PartnerApplicationActionDto;
import com.snapfit.api.entity.PartnerApplication;
import com.snapfit.api.entity.PartnerProduct;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.PartnerApplicationRepository;
import com.snapfit.api.repository.PartnerProductRepository;
import com.snapfit.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PartnerService {
    
    @Autowired
    private PartnerApplicationRepository partnerApplicationRepository;
    
    @Autowired
    private PartnerProductRepository partnerProductRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // 제휴사 신청 제출
    public PartnerApplicationDto submitApplication(PartnerApplicationDto dto) {
        PartnerApplication application = new PartnerApplication();
        application.setCompanyName(dto.getCompanyName());
        application.setContactEmail(dto.getContactEmail());
        application.setContactPhone(dto.getContactPhone());
        application.setBusinessRegistration(dto.getBusinessRegistration());
        application.setBusinessRegistrationFile(dto.getBusinessRegistrationFile());
        application.setUserIdx(dto.getUserIdx());
        application.setStatus(PartnerApplication.ApplicationStatus.PENDING);
        
        PartnerApplication saved = partnerApplicationRepository.save(application);
        return convertToDto(saved);
    }
    
    // 제휴사 신청 조회
    public PartnerApplicationDto getApplication() {
        Optional<PartnerApplication> application = partnerApplicationRepository.findFirstByOrderByCreatedAtDesc();
        return application.map(this::convertToDto).orElse(null);
    }
    
    // 제휴사 신청 수정
    public PartnerApplicationDto updateApplication(Long id, PartnerApplicationDto dto) {
        Optional<PartnerApplication> existing = partnerApplicationRepository.findById(id);
        if (existing.isPresent()) {
            PartnerApplication application = existing.get();
            application.setCompanyName(dto.getCompanyName());
            application.setContactEmail(dto.getContactEmail());
            application.setContactPhone(dto.getContactPhone());
            application.setBusinessRegistration(dto.getBusinessRegistration());
            application.setBusinessRegistrationFile(dto.getBusinessRegistrationFile());
            
            PartnerApplication saved = partnerApplicationRepository.save(application);
            return convertToDto(saved);
        }
        return null;
    }
    
    // 상품 등록
    public PartnerProductDto submitProduct(PartnerProductDto dto) {
        PartnerProduct product = new PartnerProduct();
        product.setProductName(dto.getProductName());
        product.setProductContent(dto.getProductContent());
        product.setProductImage(dto.getProductImage());
        product.setProductLink(dto.getProductLink());
        product.setProductCategory(dto.getProductCategory());
        product.setProductPrice(dto.getProductPrice());
        product.setPartnerApplicationId(dto.getPartnerApplicationId());
        product.setStatus(PartnerProduct.ProductStatus.PENDING);
        
        PartnerProduct saved = partnerProductRepository.save(product);
        return convertToProductDto(saved);
    }
    
    // 상품 목록 조회
    public List<PartnerProductDto> getProducts(Long partnerApplicationId) {
        List<PartnerProduct> products = partnerProductRepository.findByPartnerApplicationIdOrderByCreatedAtDesc(partnerApplicationId);
        return products.stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList());
    }
    
    // 상품 수정
    public PartnerProductDto updateProduct(Long id, PartnerProductDto dto) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            product.setProductName(dto.getProductName());
            product.setProductContent(dto.getProductContent());
            product.setProductImage(dto.getProductImage());
            product.setProductLink(dto.getProductLink());
            product.setProductCategory(dto.getProductCategory());
            product.setProductPrice(dto.getProductPrice());
            
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }
    
    // 대시보드 정보 조회
    public PartnerDashboardDto getDashboard(Long partnerApplicationId) {
        PartnerDashboardDto dashboard = new PartnerDashboardDto();
        
        // partnerApplicationId가 null이면 기본값 사용
        Long applicationId = partnerApplicationId != null ? partnerApplicationId : 1L;
        
        // 신청 상태 조회
        Optional<PartnerApplication> application = partnerApplicationRepository.findById(applicationId);
        if (application.isPresent()) {
            dashboard.setApplicationStatus(application.get().getStatus().name().toLowerCase());
        } else {
            dashboard.setApplicationStatus("pending");
        }
        
        // 상품 통계 조회
        List<PartnerProduct> products = partnerProductRepository.findByPartnerApplicationIdOrderByCreatedAtDesc(applicationId);
        dashboard.setTotalProducts(products.size());
        dashboard.setApprovedProducts((int) products.stream()
                .filter(p -> p.getStatus() == PartnerProduct.ProductStatus.APPROVED)
                .count());
        dashboard.setPendingProducts((int) products.stream()
                .filter(p -> p.getStatus() == PartnerProduct.ProductStatus.PENDING)
                .count());
        dashboard.setRejectedProducts((int) products.stream()
                .filter(p -> p.getStatus() == PartnerProduct.ProductStatus.REJECTED)
                .count());
        
        // 매출 (현재는 0으로 설정)
        dashboard.setMonthlyRevenue(0);
        
        // 최근 활동 - 실제 상품 등록 활동만 표시
        List<PartnerDashboardDto.ActivityDto> activities = products.stream()
                .limit(5)
                .map(product -> new PartnerDashboardDto.ActivityDto(
                    product.getId(),
                    "product",
                    "상품 등록: " + product.getProductName(),
                    product.getSubmittedDate().format(DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm"))
                ))
                .collect(Collectors.toList());
        
        dashboard.setRecentActivities(activities);
        
        return dashboard;
    }
    
    // Entity를 DTO로 변환
    private PartnerApplicationDto convertToDto(PartnerApplication application) {
        return new PartnerApplicationDto(
            application.getId(),
            application.getCompanyName(),
            application.getContactEmail(),
            application.getContactPhone(),
            application.getBusinessRegistration(),
            application.getBusinessRegistrationFile(),
            application.getUserIdx(),
            application.getApplicationDate(),
            application.getStatus().name().toLowerCase(),
            application.getRejectionReason(),
            application.getCreatedAt(),
            application.getUpdatedAt()
        );
    }
    
    // Entity를 Product DTO로 변환
    private PartnerProductDto convertToProductDto(PartnerProduct product) {
        return new PartnerProductDto(
            product.getId(),
            product.getProductName(),
            product.getProductContent(),
            product.getProductImage(),
            product.getProductLink(),
            product.getProductCategory(),
            product.getProductPrice(),
            product.getStatus().name().toLowerCase(),
            product.getPartnerApplicationId(),
            product.getSubmittedDate(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
    
    // Entity를 Admin DTO로 변환
    private PartnerApplicationAdminDto convertToAdminDto(PartnerApplication application) {
        return new PartnerApplicationAdminDto(
            application.getId(),
            application.getCompanyName(),
            application.getContactEmail(),
            application.getContactPhone(),
            application.getBusinessRegistration(),
            application.getBusinessRegistrationFile(),
            application.getApplicationDate(),
            application.getStatus().name().toLowerCase(),
            application.getRejectionReason(),
            application.getCreatedAt(),
            application.getUpdatedAt()
        );
    }
    
    // 어드민용 제휴 신청 목록 조회
    public List<PartnerApplicationAdminDto> getAllApplications() {
        List<PartnerApplication> applications = partnerApplicationRepository.findByStatusOrderByCreatedAtDesc(PartnerApplication.ApplicationStatus.PENDING);
        return applications.stream()
                .map(this::convertToAdminDto)
                .collect(Collectors.toList());
    }
    
    // 어드민용 제휴 신청 상세 조회
    public PartnerApplicationAdminDto getApplicationById(Long id) {
        Optional<PartnerApplication> application = partnerApplicationRepository.findById(id);
        return application.map(this::convertToAdminDto).orElse(null);
    }
    
    // 어드민용 제휴 신청 승인/거절
    public PartnerApplicationAdminDto updateApplicationStatus(Long id, PartnerApplicationActionDto actionDto) {
        Optional<PartnerApplication> existing = partnerApplicationRepository.findById(id);
        if (existing.isPresent()) {
            PartnerApplication application = existing.get();
            
            if ("approve".equals(actionDto.getAction())) {
                application.setStatus(PartnerApplication.ApplicationStatus.APPROVED);
                application.setRejectionReason(null);
                
                // 승인 시 사용자 권한 변경
                Optional<User> user = userRepository.findByUserIdx(application.getUserIdx());
                if (user.isPresent()) {
                    User updatedUser = user.get();
                    updatedUser.setRole(User.Role.PARTNER);
                    userRepository.save(updatedUser);
                }
            } else if ("reject".equals(actionDto.getAction())) {
                application.setStatus(PartnerApplication.ApplicationStatus.REJECTED);
                application.setRejectionReason(actionDto.getRejectionReason());
            }
            
            PartnerApplication saved = partnerApplicationRepository.save(application);
            return convertToAdminDto(saved);
        }
        return null;
    }
} 