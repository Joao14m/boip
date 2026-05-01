package com.boip.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WebhookTokenVerifierTest {

    private static final String SECRET = "s3cret-token";

    @Test
    void ctor_throwsOnNull() {
        assertThrows(IllegalStateException.class, () -> new WebhookTokenVerifier(null));
    }

    @Test
    void ctor_throwsOnEmpty() {
        assertThrows(IllegalStateException.class, () -> new WebhookTokenVerifier(""));
    }

    @Test
    void ctor_throwsOnBlank() {
        assertThrows(IllegalStateException.class, () -> new WebhookTokenVerifier("   "));
    }

    @Test
    void verify_nullCandidate_false() {
        assertFalse(new WebhookTokenVerifier(SECRET).verify(null));
    }

    @Test
    void verify_emptyCandidate_false() {
        assertFalse(new WebhookTokenVerifier(SECRET).verify(""));
    }

    @Test
    void verify_wrongCandidate_false() {
        assertFalse(new WebhookTokenVerifier(SECRET).verify("wrong"));
    }

    @Test
    void verify_differentLength_false() {
        assertFalse(new WebhookTokenVerifier(SECRET).verify(SECRET + "-extra"));
    }

    @Test
    void verify_correctCandidate_true() {
        assertTrue(new WebhookTokenVerifier(SECRET).verify(SECRET));
    }
}
