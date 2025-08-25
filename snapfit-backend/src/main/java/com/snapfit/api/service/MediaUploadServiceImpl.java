package com.snapfit.api.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import java.util.Date;
import com.snapfit.api.entity.Media;
import com.snapfit.api.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class MediaUploadServiceImpl implements MediaUploadService {
    @Value("${cloud.aws.s3.user-bucket:default-bucket}")
    private String userBucket;
    @Value("${cloud.aws.s3.static-bucket:default-bucket}")
    private String staticBucket;

    private final MediaRepository mediaRepository;
    
    // AmazonS3 주입
    private final AmazonS3 amazonS3;

    @Override
    public Media uploadMedia(MultipartFile file, String purpose, Long refId) {
        String bucket = null;
        String key = null;
        String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'));
        String originalName = file.getOriginalFilename();
        String uidName = UUID.randomUUID() + "_" + originalName; // UUID+원본이름 조합

        switch (purpose) {
            case "store_logo":
                bucket = staticBucket;
                key = "stores/" + refId + "/" + uidName;
                break;
            case "product_image":
                bucket = staticBucket;
                key = "products/" + refId + "/" + uidName;
                break;
            case "partner_application":
                bucket = staticBucket;
                key = "partner_applications/" + refId + "/" + uidName;
                break;
            case "partner_logo":
                bucket = staticBucket;
                key = "partner_logos/" + refId + "/" + uidName;
                break;
            case "post_image":
                bucket = staticBucket;
                key = "posts/" + refId + "/" + uidName;
                break;
            case "profile":
                bucket = userBucket;
                key = "profiles/" + refId + "/" + uidName;
                break;
            default:
                throw new IllegalArgumentException("Unknown purpose: " + purpose);
        }
        if (bucket == null || key == null) throw new IllegalStateException("bucket/key not set");

        // S3 업로드 시도
        if (amazonS3 != null) {
            try {
                // 2) 메타데이터 세팅
                ObjectMetadata meta = new ObjectMetadata();
                meta.setContentLength(file.getSize());
                meta.setContentType(file.getContentType());

                // 3) S3 업로드
                try (InputStream is = file.getInputStream()) {
                    PutObjectRequest req = new PutObjectRequest(bucket, key, is, meta);
                    amazonS3.putObject(req);
                }

                // 4) S3 URL 생성 (원본 S3 URL을 DB에 저장)
                String s3Url = amazonS3.getUrl(bucket, key).toString();

                // 5) DB 저장
                Media media = Media.builder()
                        .mediaRealName(file.getOriginalFilename())
                        .mediaUidName(key)
                        .mediaType(file.getContentType())
                        .mediaUrl(s3Url) // 원본 S3 URL 저장
                        .mediaPurpose(purpose)
                        .build();
                return mediaRepository.save(media);
            } catch (Exception e) {
                // S3 업로드 실패 시 로컬 저장으로 fallback
                System.out.println("S3 업로드 실패, 로컬 저장으로 fallback: " + e.getMessage());
            }
        }

        // 로컬 파일 시스템에 저장 (fallback)
        try {
            String uploadDir = "./uploads/" + purpose + "/" + refId;
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = uidName;
            java.io.File destFile = new java.io.File(dir, fileName);
            
            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(destFile)) {
                fos.write(file.getBytes());
            }

            // 로컬 URL 생성
            String localUrl = "/uploads/" + purpose + "/" + refId + "/" + fileName;

            // DB 저장
            Media media = Media.builder()
                    .mediaRealName(file.getOriginalFilename())
                    .mediaUidName(key)
                    .mediaType(file.getContentType())
                    .mediaUrl(localUrl)
                    .mediaPurpose(purpose)
                    .build();
            return mediaRepository.save(media);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteMedia(String uidName) {
        if (amazonS3 == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "S3 서비스가 설정되지 않았습니다.");
        }
        
        String bucket = (uidName.startsWith("profile/") || uidName.startsWith("posts/")) ? userBucket : staticBucket;
        // S3에서 삭제
        amazonS3.deleteObject(new DeleteObjectRequest(bucket, uidName));
        // DB에서 삭제
        Media media = mediaRepository.findByMediaUidName(uidName);
        if (media != null) {
            mediaRepository.deleteById(media.getId());
        }
    }

    // ... (나머지 구현부 동일)
}