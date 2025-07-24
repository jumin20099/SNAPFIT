package com.snapfit.api.dto;

import lombok.Data;

@Data
public class ProductDto {
    private Long storeIdx;
    private String productName;
    private String productContent;
    private Integer productPrice;
    private String productImage;
    private String productCategory;

    // 대분류(예: 상의, 하의)
    private String majorCategory;

    // 세부 분류(예: 맨투맨/스웨트)
    private String subCategory;
    private String productLink;
}