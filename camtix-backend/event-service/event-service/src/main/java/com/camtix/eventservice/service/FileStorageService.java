package com.camtix.eventservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String endpoint;

    public String uploadImage(MultipartFile file) {
        if (minioClient == null) {
            throw new RuntimeException("MinIO is not configured. Image storage unavailable.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                originalFilename = "unknown";
            }
            String ext = "";
            int dotIdx = originalFilename.lastIndexOf('.');
            if (dotIdx > 0) {
                ext = originalFilename.substring(dotIdx);
            }
            String objectName = UUID.randomUUID() + ext;

            InputStream is = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String publicUrl = endpoint + "/" + bucketName + "/" + objectName;
            log.info("Image uploaded to MinIO: {}", publicUrl);
            return publicUrl;

        } catch (Exception e) {
            log.error("Failed to upload image to MinIO: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
