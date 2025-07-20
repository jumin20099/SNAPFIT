package com.snapfit.api.dto;

import lombok.Data;

@Data
public class ProductApprovalActionDto {
    private String action; // "approve" or "reject"
    private String rejectionReason;
} 