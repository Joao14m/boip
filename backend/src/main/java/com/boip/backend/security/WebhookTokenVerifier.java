package com.boip.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class WebhookTokenVerifier {

    private final byte[] expected;

    public WebhookTokenVerifier(@Value("${app.webhook-auth-token:}") String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("app.webhook-auth-token must be set");
        }
        this.expected = token.getBytes(StandardCharsets.UTF_8);
    }

    public boolean verify(String candidate) {
        if (candidate == null) return false;
        byte[] given = candidate.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, given);
    }
}
