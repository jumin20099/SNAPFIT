package com.snapfit.api.dto.report;

import com.snapfit.api.entity.Report;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@ToString
public class ReportCreateRequest {

    private Report.TargetType targetType;
    private Long targetId;
    private UUID targetUserId;
    private Long reportedPostId;
    private Long reportedCommentId;
    private Report.Category category;
    private String reason;

    public Report.TargetType resolveTargetType() {
        if (targetType != null) {
            return targetType;
        }
        if (reportedPostId != null) {
            return Report.TargetType.POST;
        }
        if (reportedCommentId != null) {
            return Report.TargetType.COMMENT;
        }
        if (targetUserId != null) {
            return Report.TargetType.USER;
        }
        return null;
    }

    public Long resolveTargetId() {
        Report.TargetType resolved = resolveTargetType();
        if (resolved == null) {
            return targetId;
        }
        return switch (resolved) {
            case POST -> reportedPostId != null ? reportedPostId : targetId;
            case COMMENT -> reportedCommentId != null ? reportedCommentId : targetId;
            case USER -> targetId;
        };
    }

    public Report.Category resolveCategory() {
        return category == null ? Report.Category.OTHER : category;
    }
}
