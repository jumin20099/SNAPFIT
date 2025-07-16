package com.snapfit.api.dto;

import lombok.Data;

@Data
public class StoreDto {
    private String storeName;
    private String storeLogo;      // S3 URL
    private String storeLink;
    private Float royaltyRate;
    private String contact;
}
