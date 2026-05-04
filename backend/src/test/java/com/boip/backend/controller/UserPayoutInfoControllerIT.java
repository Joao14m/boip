package com.boip.backend.controller;

import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression test for the payout-info IDOR vulnerability.
 * Proves that user A cannot read or write user B's payout info.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class UserPayoutInfoControllerIT {

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

    private AppUser userA;
    private AppUser userB;

    private static final String PIX_BODY = """
            { "transferType":"PIX", "pixKey":"attacker@evil.com", "pixKeyType":"EMAIL" }
            """;

    @BeforeEach
    void seed() {
        jdbc.update("delete from user_payout_info");
        jdbc.update("delete from app_user");

        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);

        userA = appUserRepository.save(AppUser.builder()
                .firebaseUid("uid-A").firstName("A").lastName("One")
                .email("a@test.com").phone("11999990001")
                .personDoc("11111111111").docType("CPF")
                .hasCar(false).locationId(locationId).build());

        userB = appUserRepository.save(AppUser.builder()
                .firebaseUid("uid-B").firstName("B").lastName("Two")
                .email("b@test.com").phone("11999990002")
                .personDoc("22222222222").docType("CPF")
                .hasCar(false).locationId(locationId).build());

        stubToken("jwt-A", "uid-A");
        stubToken("jwt-B", "uid-B");
    }

    private void stubToken(String jwt, String uid) {
        FirebaseToken tok = mock(FirebaseToken.class);
        when(tok.getUid()).thenReturn(uid);
        when(tok.getEmail()).thenReturn(uid + "@test.com");
        when(tok.isEmailVerified()).thenReturn(true);
        try {
            when(firebaseAuth.verifyIdToken(eq(jwt))).thenReturn(tok);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void userA_cannotWrite_userB_payoutInfo() throws Exception {
        mvc.perform(put("/api/users/{userId}/payout-info", userB.getId())
                        .header("Authorization", "Bearer jwt-A")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PIX_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    void userA_cannotRead_userB_payoutInfo() throws Exception {
        // First, user B writes their own payout (legitimately).
        mvc.perform(put("/api/users/{userId}/payout-info", userB.getId())
                        .header("Authorization", "Bearer jwt-B")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "transferType":"PIX", "pixKey":"b@real.com", "pixKeyType":"EMAIL" }
                                """))
                .andExpect(status().isOk());

        // User A attempts to read it — must be denied.
        mvc.perform(get("/api/users/{userId}/payout-info", userB.getId())
                        .header("Authorization", "Bearer jwt-A"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userA_canReadAndWrite_ownPayoutInfo() throws Exception {
        mvc.perform(put("/api/users/{userId}/payout-info", userA.getId())
                        .header("Authorization", "Bearer jwt-A")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PIX_BODY))
                .andExpect(status().isOk());

        mvc.perform(get("/api/users/{userId}/payout-info", userA.getId())
                        .header("Authorization", "Bearer jwt-A"))
                .andExpect(status().isOk());
    }

    @Test
    void anonymous_cannotAccessPayoutInfo() throws Exception {
        mvc.perform(get("/api/users/{userId}/payout-info", userA.getId()))
                .andExpect(status().isForbidden());
    }
}
