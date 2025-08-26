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
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.entity.Media;
import com.snapfit.api.repository.MediaRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.HttpMethod;
import java.io.IOException;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    @Value("${cloud.aws.s3.user-bucket:default-user-bucket}")
    private String userBucket;
    @Value("${cloud.aws.s3.static-bucket:default-bucket}")
    private String staticBucket;

    private final MediaUploadService mediaService;
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final AmazonS3 amazonS3;

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
        System.out.println("=== 프로필 업로드 인증 확인 ===");
        System.out.println("userDetails: " + userDetails);
        
        // 인증 확인
        if (userDetails == null) {
            System.out.println("userDetails가 null입니다!");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", "인증이 필요합니다",
                "code", "UNAUTHORIZED"
            ));
        }
        
        System.out.println("userDetails 사용자명: " + userDetails.getUsername());
        
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
            // 현재 사용자 정보 가져오기
            String email = userDetails.getUsername();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "error", "사용자를 찾을 수 없습니다",
                    "code", "USER_NOT_FOUND"
                ));
            }
            
            User user = userOpt.get();
            
            // UUID를 문자열로 변환하여 사용 (음수 방지)
            String userId = user.getUserIdx().toString();
            
            // 프로필 이미지 전용 purpose 사용
            Media saved = mediaService.uploadMedia(file, "profile", 0L); // 임시로 0L 사용
            
            // 프록시 URL과 S3 URL 모두 반환
            String proxyUrl = "/api/media/image/" + saved.getId();
            String s3Url = saved.getMediaUrl(); // S3 URL (DB에 저장된 실제 URL)
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "id", saved.getId(),
                    "url", proxyUrl, // 프록시 URL (프론트 표시용)
                    "s3Url", s3Url,  // S3 URL (실제 저장된 URL)
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
    
    /**
     * 이미지 프록시 엔드포인트 - 이미지 URL로 리다이렉트 또는 로컬 파일 제공
     */
    @GetMapping("/image/{mediaId}")
    public ResponseEntity<?> getImage(@PathVariable Long mediaId) {
        try {
            // 미디어 정보 조회
            Optional<Media> mediaOpt = mediaRepository.findById(mediaId);
            if (mediaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Media media = mediaOpt.get();
            String mediaUrl = media.getMediaUrl();
            
            // S3 URL인 경우 임시 접근 가능한 URL로 리다이렉트
            if (mediaUrl.startsWith("https://") && amazonS3 != null) {
                try {
                    // S3 URL에서 버킷과 키 추출
                    String bucket = media.getMediaPurpose().equals("profile") ? userBucket : staticBucket;
                    
                    // S3 URL에서 키 추출 (https://bucket.s3.region.amazonaws.com/key)
                    String key;
                    if (mediaUrl.contains(".s3.")) {
                        // S3 URL에서 키 부분만 추출
                        String[] urlParts = mediaUrl.split("\\.s3\\.");
                        if (urlParts.length > 1) {
                            String afterS3 = urlParts[1];
                            String[] keyParts = afterS3.split("/", 2);
                            if (keyParts.length > 1) {
                                key = keyParts[1]; // region.amazonaws.com/key 부분에서 key만 추출
                            } else {
                                key = media.getMediaUidName(); // fallback
                            }
                        } else {
                            key = media.getMediaUidName(); // fallback
                        }
                    } else {
                        key = media.getMediaUidName(); // fallback
                    }
                    
                    System.out.println("=== S3 키 추출 ===");
                    System.out.println("원본 URL: " + mediaUrl);
                    System.out.println("추출된 키: " + key);
                    System.out.println("버킷: " + bucket);
                    
                    // Pre-signed URL 생성 (1시간 유효)
                    Date expiration = new Date();
                    long expTimeMillis = expiration.getTime();
                    expTimeMillis += 1000 * 60 * 60; // 1시간
                    expiration.setTime(expTimeMillis);
                    
                    GeneratePresignedUrlRequest generatePresignedUrlRequest = 
                        new GeneratePresignedUrlRequest(bucket, key)
                            .withMethod(HttpMethod.GET)
                            .withExpiration(expiration);
                    
                    String presignedUrl = amazonS3.generatePresignedUrl(generatePresignedUrlRequest).toString();
                    
                    System.out.println("생성된 Pre-signed URL: " + presignedUrl);
                    
                    // 리다이렉트 응답
                    return ResponseEntity.status(302)
                        .header("Location", presignedUrl)
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                        .build();
                        
                } catch (Exception e) {
                    System.out.println("Pre-signed URL 생성 실패: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.status(404).build();
                }
            }
            
            // 로컬 파일인 경우 직접 제공
            if (mediaUrl.startsWith("/uploads/")) {
                try {
                    String localPath = "." + mediaUrl; // ./uploads/... 경로
                    java.io.File file = new java.io.File(localPath);
                    if (file.exists()) {
                        byte[] content = java.nio.file.Files.readAllBytes(file.toPath());
                        ByteArrayResource resource = new ByteArrayResource(content);
                        
                        return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(media.getMediaType()))
                            .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                            .body(resource);
                    }
                } catch (IOException e) {
                    return ResponseEntity.internalServerError().build();
                }
            }
            
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
