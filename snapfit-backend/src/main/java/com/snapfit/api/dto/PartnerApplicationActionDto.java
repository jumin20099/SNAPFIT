package com.snapfit.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerApplicationActionDto {
    
    private String action; // "approve" 또는 "reject"
    private String rejectionReason; // 거절 시에만 사용
} 