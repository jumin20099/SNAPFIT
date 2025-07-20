package com.snapfit.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkProductApprovalActionDto {
    private List<Long> ids;
    private String action; // "approve" or "reject"
    private String rejectionReason;
} 