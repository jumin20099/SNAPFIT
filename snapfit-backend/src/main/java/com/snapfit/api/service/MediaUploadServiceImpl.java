package com.snapfit.api.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.snapfit.api.entity.Media;
import com.snapfit.api.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class MediaUploadServiceImpl implements MediaUploadService {
    @Value("${cloud.aws.s3.user-bucket}")
    private String userBucket;
    @Value("${cloud.aws.s3.static-bucket}")
    private String staticBucket;

    private final AmazonS3 amazonS3;
    private final MediaRepository mediaRepository;

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
            default:
                throw new IllegalArgumentException("Unknown purpose: " + purpose);
        }
        if (bucket == null || key == null) throw new IllegalStateException("bucket/key not set");

        // 2) 메타데이터 세팅
        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentLength(file.getSize());
        meta.setContentType(file.getContentType());

        // 3) S3 업로드
        try (InputStream is = file.getInputStream()) {
            PutObjectRequest req = new PutObjectRequest(bucket, key, is, meta);
            amazonS3.putObject(req);
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 실제 에러 메시지 출력
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "S3 업로드 실패: " + e.getMessage(), e);
        }

        // 4) public URL 얻기
        String url = amazonS3.getUrl(bucket, key).toString();

        // 5) DB 저장
        Media media = Media.builder()
                .mediaRealName(file.getOriginalFilename())
                .mediaUidName(key)
                .mediaType(file.getContentType())
                .mediaUrl(url)
                .mediaPurpose(purpose)
                .build();
        return mediaRepository.save(media);
    }

    @Override
    public void deleteMedia(String uidName) {
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