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
import com.snapfit.api.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaUploadService mediaService;

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

    @PostMapping("/upload/profile")
    public ResponseEntity<?> uploadProfile(@RequestParam("file") MultipartFile file,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (mediaService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "미디어 업로드 서비스가 설정되지 않았습니다.");
        }
        
        // 파일 유효성 검사
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "파일이 비어있습니다",
                "code", "EMPTY_FILE"
            ));
        }
        
        // 파일 크기 제한 (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "파일 크기는 5MB 이하여야 합니다",
                "code", "FILE_SIZE_LIMIT"
            ));
        }
        
        // 파일 형식 검사
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/jpeg") && 
                                   !contentType.startsWith("image/png") && 
                                   !contentType.startsWith("image/webp"))) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "JPG, PNG, WEBP 형식만 지원됩니다",
                "code", "INVALID_FILE_TYPE"
            ));
        }
        
        try {
            // 프로필 이미지 전용 purpose 사용
            Media saved = mediaService.uploadMedia(file, "profile", 0L); // refId는 0으로 설정
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "id", saved.getId(),
                    "url", saved.getMediaUrl(),
                    "mediaType", saved.getMediaType()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "파일 업로드 중 오류가 발생했습니다",
                "code", "UPLOAD_ERROR"
            ));
        }
    }
}
