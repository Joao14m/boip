package com.boip.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.core.io.Resource;

import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Bean
    public FirebaseApp firebaseApp(
            @Value("${boip.auth.bypass:false}") boolean authBypass,
            @Value("${boip.firebase.service-account:${FIREBASE_SERVICE_ACCOUNT:}}") Resource serviceAccount
    ) throws IOException {

        if (authBypass) {
            log.warn("Firebase auth bypass is ENABLED — all Bearer tokens are trusted without verification. Do NOT use in production.");
            return null;
        }

        if (serviceAccount == null || !serviceAccount.exists()) {
            throw new IllegalStateException("Firebase service account not found. Set boip.firebase.service-account or FIREBASE_SERVICE_ACCOUNT");
        }

        if (!FirebaseApp.getApps().isEmpty()) return FirebaseApp.getInstance();

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount.getInputStream()))
                .build();

        return FirebaseApp.initializeApp(options);
    }
}
