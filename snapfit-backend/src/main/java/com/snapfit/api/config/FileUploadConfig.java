package com.snapfit.api.config;

import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

import jakarta.servlet.MultipartConfigElement;

@Configuration
public class FileUploadConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // 최대 파일 크기: 10MB
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        
        // 최대 요청 크기: 10MB
        factory.setMaxRequestSize(DataSize.ofMegabytes(10));
        
        return factory.createMultipartConfig();
    }
}
