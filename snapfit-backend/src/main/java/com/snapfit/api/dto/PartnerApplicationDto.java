package com.snapfit.api.dto;

import com.snapfit.api.security.InputSanitizer;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerApplicationDto {
    
    private Long id;
    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String businessRegistration;
    private String businessRegistrationFile;
    private String logo;
    private String storeLink;
    private Float royaltyRate;
    private UUID userIdx;
    private LocalDateTime applicationDate;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 입력 sanitizing 메서드
    public void sanitizeInputs(InputSanitizer inputSanitizer) {
        if (companyName != null) {
            companyName = inputSanitizer.sanitizeText(companyName);
        }
        if (contactEmail != null) {
            contactEmail = inputSanitizer.sanitizeText(contactEmail);
        }
        if (contactPhone != null) {
            contactPhone = inputSanitizer.sanitizeText(contactPhone);
        }
        if (businessRegistration != null) {
            businessRegistration = inputSanitizer.sanitizeText(businessRegistration);
        }
        if (businessRegistrationFile != null) {
            businessRegistrationFile = inputSanitizer.sanitizeText(businessRegistrationFile);
        }
        if (logo != null) {
            logo = inputSanitizer.sanitizeText(logo);
        }
        if (storeLink != null) {
            storeLink = inputSanitizer.sanitizeText(storeLink);
        }
        if (rejectionReason != null) {
            rejectionReason = inputSanitizer.sanitizeText(rejectionReason);
        }
    }
} 