// com.snapfit.api.service.MediaUploadService.java
package com.snapfit.api.service;

import com.snapfit.api.entity.Media;
import org.springframework.web.multipart.MultipartFile;

public interface MediaUploadService {
    Media uploadMedia(MultipartFile file, String purpose, Long refId);
    void deleteMedia(String uidName);
}
