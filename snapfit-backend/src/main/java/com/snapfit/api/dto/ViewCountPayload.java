package com.snapfit.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ViewCountPayload {
    private String key;
    private long count;
} 