package com.snapfit.api.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 게시글 생성 요청 DTO
 */
@Data
public class CreatePostRequestDto {

    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    @Size(max = 10000, message = "내용은 10000자를 초과할 수 없습니다")
    private String content;

    @Size(max = 10, message = "태그는 최대 10개까지 가능합니다")
    private List<String> tags;

    @Size(max = 30, message = "이미지는 최대 30개까지 가능합니다")
    private List<String> mediaUrls;

    // 게시판 타입 (필수)
    private String boardType;

    // 익명 게시글 여부
    private Boolean isAnonymous;

    // 코디 관련 필드 (선택사항)
    private CodyData codyData;
    // 기존 Outfit을 게시글에 연결할 때 사용 (중복 저장 방지)
    private Long outfitId;

    // 익명 사용자 비밀번호 (로그인하지 않은 경우 필수)
    private String anonymousPassword;

    @Data
    public static class CodyData {
        private String name;
        private List<CodyItem> items;
        private CodyBackground background;
        private Long timestamp;
        private String thumbnailUrl;
    }

    @Data
    public static class CodyItem {
        private Long productId;
        private String itemId; // 프론트엔드 호환성을 위해 추가
        private String name;
        private String slot;
        private String src;
        private Double nx;
        private Double ny;
        private Double rotation;
        private Double z;
        private Double scale;
    }

    @Data
    public static class CodyBackground {
        private String type;
        private String selectedBackground;
        private String customColor;
    }
}
