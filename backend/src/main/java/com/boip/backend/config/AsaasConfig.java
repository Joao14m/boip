package com.boip.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.asaas.apisdk.AsaasSdk;
import com.asaas.apisdk.config.ApiKeyAuthConfig;
import com.asaas.apisdk.config.AsaasSdkConfig;
import org.springframework.beans.factory.annotation.Value;

// Spring creates the AsaasSdk once at startup and makes it injectable anywhere
@Configuration
public class AsaasConfig {
    @Value("${asaas.api-key}")
    private String apiKey;

    @Value("${asaas.base-url}")
    private String baseUrl;

    @Bean
    public AsaasSdk asaasSdk(){
        ApiKeyAuthConfig authConfig = ApiKeyAuthConfig.builder()
            .apiKey(apiKey)
            .build();

        AsaasSdkConfig config = AsaasSdkConfig.builder()
            .apiKeyAuthConfig(authConfig)
            .baseUrl(baseUrl)
            .build();

        return new AsaasSdk(config);
    }
}
