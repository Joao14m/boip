package com.boip.backend.auth;

import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises the auth filter end-to-end with a mocked FirebaseAuth bean.
 * Proves that the bypass code path is truly gone — only tokens that verifyIdToken
 * accepts can authenticate.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class FirebaseTokenFilterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb").withUsername("test").withPassword("test");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.flyway.enabled", () -> true);
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    }

    @MockitoBean FirebaseApp firebaseApp;
    @MockitoBean FirebaseAuth firebaseAuth;

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired AppUserRepository appUserRepository;

    @BeforeEach
    void clean() {
        jdbc.update("delete from app_user");
    }

    @Test
    void noAuthHeader_protectedEndpoint_returns403() throws Exception {
        mvc.perform(get("/api/users/{id}", UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidToken_returns401() throws Exception {
        when(firebaseAuth.verifyIdToken(eq("garbage-token")))
                .thenThrow(mock(FirebaseAuthException.class));

        mvc.perform(get("/api/users/{id}", UUID.randomUUID())
                        .header("Authorization", "Bearer garbage-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid or expired Firebase token"));
    }

    @Test
    void arbitraryUidAsBearer_isRejected() throws Exception {
        // Critical-1 regression guard: a raw uid string must NOT authenticate.
        // Without the deleted bypass, verifyIdToken is the only path, and it throws for anything non-JWT.
        when(firebaseAuth.verifyIdToken(eq("some-firebase-uid")))
                .thenThrow(mock(FirebaseAuthException.class));

        mvc.perform(get("/api/users/{id}", UUID.randomUUID())
                        .header("Authorization", "Bearer some-firebase-uid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validTokenNotOnboarded_meReturnsOnboardedFalse() throws Exception {
        FirebaseToken tok = mock(FirebaseToken.class);
        when(tok.getUid()).thenReturn("uid-new");
        when(tok.getEmail()).thenReturn("new@example.com");
        when(tok.isEmailVerified()).thenReturn(true);
        when(firebaseAuth.verifyIdToken(eq("valid-new-jwt"))).thenReturn(tok);

        mvc.perform(get("/auth/me").header("Authorization", "Bearer valid-new-jwt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uid").value("uid-new"))
                .andExpect(jsonPath("$.onboarded").value(false));
    }

    @Test
    void validTokenOnboarded_protectedEndpointAllowed() throws Exception {
        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);

        AppUser u = appUserRepository.save(AppUser.builder()
                .firebaseUid("uid-existing")
                .firstName("A").lastName("B")
                .email("a@b.com").phone("11999990000")
                .personDoc("12345671001").docType("CPF")
                .hasCar(false).locationId(locationId)
                .build());

        FirebaseToken tok = mock(FirebaseToken.class);
        when(tok.getUid()).thenReturn("uid-existing");
        when(tok.getEmail()).thenReturn("a@b.com");
        when(tok.isEmailVerified()).thenReturn(true);
        when(firebaseAuth.verifyIdToken(eq("valid-onboarded-jwt"))).thenReturn(tok);

        mvc.perform(get("/api/users/{id}", u.getId())
                        .header("Authorization", "Bearer valid-onboarded-jwt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("a@b.com"));
    }
}
