package com.snapfit.api.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI snapfitOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Snapfit 코디 시스템 API")
                        .description("Outfit · Like · ViewCounter · Scrap 등 API 명세")
                        .version("v1.0")
                        .license(new License().name("Apache 2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("개발 서버"),
                        new Server().url("https://api.snapfit.app").description("운영 서버")
                ))
                .externalDocs(new ExternalDocumentation()
                        .description("GitHub Repo")
                        .url("https://github.com/your-org/snapfit"));
    }
} 