package com.snapfit.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerProductDto {
    
    private Long id;
    private String productName;
    private String productContent;
    private String productImage;
    private String productLink;
    private String productCategory;
    private Integer productPrice;
    private String status;
    private Long partnerApplicationId;
    private String partnerCompanyName;
    private Boolean isActive;
    private String rejectionReason;
    private LocalDateTime submittedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 