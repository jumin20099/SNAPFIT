package com.snapfit.api.dto.report;

import com.snapfit.api.entity.Report;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ReportResponseDto {

    private final Long reportId;
    private final UUID reporterId;
    private final Report.TargetType targetType;
    private final Long targetId;
    private final UUID targetUserId;
    private final Report.Category category;
    private final String reason;
    private final Report.Status status;
    private final String adminNotes;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final LocalDateTime resolvedAt;

    public static ReportResponseDto from(Report report) {
        return ReportResponseDto.builder()
            .reportId(report.getReportId())
            .reporterId(report.getReporterId())
            .targetType(report.getTargetType())
            .targetId(report.getTargetId())
            .targetUserId(report.getTargetUserId())
            .category(report.getCategory())
            .reason(report.getReason())
            .status(report.getStatus())
            .adminNotes(report.getAdminNotes())
            .createdAt(report.getCreatedAt())
            .updatedAt(report.getUpdatedAt())
            .resolvedAt(report.getResolvedAt())
            .build();
    }
}
