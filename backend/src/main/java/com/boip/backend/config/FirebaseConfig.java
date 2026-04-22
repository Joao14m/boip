package com.boip.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.core.io.Resource;

import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp(
            @Value("${boip.firebase.service-account:${FIREBASE_SERVICE_ACCOUNT:}}") Resource serviceAccount
    ) throws IOException {

        if (serviceAccount == null || !serviceAccount.exists()) {
            throw new IllegalStateException("Firebase service account not found. Set boip.firebase.service-account or FIREBASE_SERVICE_ACCOUNT");
        }

        if (!FirebaseApp.getApps().isEmpty()) return FirebaseApp.getInstance();

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount.getInputStream()))
                .build();

        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
