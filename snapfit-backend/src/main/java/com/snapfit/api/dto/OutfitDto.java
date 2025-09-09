package com.snapfit.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

/**
 * Outfit 생성/수정 요청에 사용되는 DTO.
 */
@Data
public class OutfitDto {
    /** 코디에 사용된 상품 정보(JSON) */
    private JsonNode outfitItem;
    /** 미리보기 썸네일 URL */
    private String outfitThumbnail;
    /** 공개 여부 */
    private Boolean isPublic = true;
} 