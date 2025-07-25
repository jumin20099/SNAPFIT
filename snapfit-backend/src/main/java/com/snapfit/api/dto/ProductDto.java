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

    private String genderCategory;
    private String majorCategory;
    private String subCategory;
    private String productLink;
}