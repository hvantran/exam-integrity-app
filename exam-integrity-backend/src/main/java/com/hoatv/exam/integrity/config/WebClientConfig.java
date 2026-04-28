package com.hoatv.exam.integrity.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configures a RestClient bean pointing at the PDF ingestion service.
 * Uses Spring 6 RestClient (synchronous, no WebFlux required).
 */
@Configuration
public class WebClientConfig {

    @Bean
    public RestClient ingestionRestClient(
            @Value("${ingestion.service.base-url:http://localhost:8091}") String baseUrl) {
        return RestClient.builder()
            .baseUrl(baseUrl)
            .build();
    }
}
