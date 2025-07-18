// com.snapfit.api.controller.MediaController.java
package com.snapfit.api.controller;

import com.snapfit.api.entity.Media;
import com.snapfit.api.service.MediaUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaUploadService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam("purpose") String purpose,
                                    @RequestParam("refId") Long refId) {
        Media saved = mediaService.uploadMedia(file, purpose, refId);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "url", saved.getMediaUrl()
        ));
    }
}
