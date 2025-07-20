package com.snapfit.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

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
} 