package com.snapfit.api.dto.comment;

import lombok.Data;

/**
 * 댓글 통계 DTO
 */
@Data
public class CommentStatisticsDto {

    private Long totalCommentCount;
    private Long todayCommentCount;
    private Long averageCommentsPerPost;
    private Long mostActivePostId;
    private String mostActivePostTitle;
}
