// com.snapfit.api.controller.MediaController.java
package com.snapfit.api.controller;

import com.snapfit.api.entity.Media;
import com.snapfit.api.service.MediaUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@ConditionalOnBean(MediaUploadService.class)
public class MediaController {

    // MediaUploadService를 조건부로 주입
    @Autowired(required = false)
    private MediaUploadService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam("purpose") String purpose,
                                    @RequestParam("refId") Long refId) {
        if (mediaService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "미디어 업로드 서비스가 설정되지 않았습니다.");
        }
        
        Media saved = mediaService.uploadMedia(file, purpose, refId);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "url", saved.getMediaUrl()
        ));
    }
}
