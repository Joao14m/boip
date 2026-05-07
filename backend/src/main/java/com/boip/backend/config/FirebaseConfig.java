package com.boip.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp(
            @Value("${boip.firebase.service-account:${FIREBASE_SERVICE_ACCOUNT:}}") Resource serviceAccount,
            @Value("${FIREBASE_SERVICE_ACCOUNT_JSON:}") String serviceAccountJson
    ) throws IOException {

        if (!FirebaseApp.getApps().isEmpty()) return FirebaseApp.getInstance();

        InputStream credentialsStream;
        if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
            credentialsStream = new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        } else if (serviceAccount != null && serviceAccount.exists()) {
            credentialsStream = serviceAccount.getInputStream();
        } else {
            throw new IllegalStateException(
                    "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON) or FIREBASE_SERVICE_ACCOUNT (file path)."
            );
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                .build();

        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
