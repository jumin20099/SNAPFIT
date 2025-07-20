package com.snapfit.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerApplicationAdminDto {
    
    private Long id;
    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String businessRegistration;
    private String businessRegistrationFile;
    private String logo;
    private LocalDateTime applicationDate;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 