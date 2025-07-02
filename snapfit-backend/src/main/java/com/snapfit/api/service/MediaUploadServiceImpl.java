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
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private final AmazonS3 amazonS3;
    private final MediaRepository mediaRepository;

    @Override
    public Media uploadMedia(MultipartFile file, String purpose) {
        // 1) UUID 파일명 생성
        String ext = file.getOriginalFilename()
                         .substring(file.getOriginalFilename().lastIndexOf('.'));
        String uidName = UUID.randomUUID() + ext;

        // 2) 메타데이터 세팅
        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentLength(file.getSize());
        meta.setContentType(file.getContentType());

        // 3) S3 업로드
        try (InputStream is = file.getInputStream()) {
            PutObjectRequest req = new PutObjectRequest(bucket, uidName, is, meta)
                    .withCannedAcl(CannedAccessControlList.PublicRead);
            amazonS3.putObject(req);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "S3 업로드 실패", e);
        }

        // 4) public URL 얻기
        String url = amazonS3.getUrl(bucket, uidName).toString();

        // 5) DB 저장
        Media media = Media.builder()
                .mediaRealName(file.getOriginalFilename())
                .mediaUidName(uidName)
                .mediaType(file.getContentType())
                .mediaUrl(url)
                .mediaPurpose(purpose)
                .build();
        return mediaRepository.save(media);
    }

    @Override
    public void deleteMedia(String uidName) {
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