package com.snapfit.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 설정
 * API 문서 자동 생성 및 스키마 정의
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI snapfitOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SnapFit API")
                        .description("SnapFit 커뮤니티 플랫폼 API 문서")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SnapFit Team")
                                .email("dev@snapfit.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local development server"),
                        new Server().url("https://api.snapfit.com").description("Production server")))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token for authentication")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"));
    }
}