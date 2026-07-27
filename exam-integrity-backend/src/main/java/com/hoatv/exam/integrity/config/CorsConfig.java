package com.hoatv.exam.integrity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permissive CORS for local/dev network access.
 * DEFERRED: lock down origins/methods before production.
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOriginPatterns(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://192.168.*.*:3000",
                        "http://10.*.*.*:3000",
                        "http://172.16.*.*:3000",
                        "http://172.17.*.*:3000",
                        "http://172.18.*.*:3000",
                        "http://172.19.*.*:3000",
                        "http://172.2*.*.*:3000",
                        "http://172.30.*.*:3000",
                        "http://172.31.*.*:3000",
                        "http://localhost:6006"
                    )
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
