package com.boip.backend.controller;

import com.boip.backend.dto.AsaasPaymentEventDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.service.WebhooksService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class WebhooksControllerIT {

    private static final String SECRET = "test-webhook-secret";
    private static final String BODY = """
            { "event":"PAYMENT_CONFIRMED", "payment": { "id":"pay_123", "status":"CONFIRMED" } }
            """;

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
        r.add("app.webhook-auth-token", () -> SECRET);
    }

    @MockitoBean FirebaseApp firebaseApp;
    @MockitoBean FirebaseAuth firebaseAuth;
    @MockitoBean WebhooksService webhooksService;

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired AppUserRepository appUserRepository;

    @BeforeEach
    void clean() {
        jdbc.update("delete from app_user");
    }

    @Test
    void asaas_noToken_returns401() throws Exception {
        mvc.perform(post("/api/webhooks/asaas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isUnauthorized());
        verify(webhooksService, never()).handleEvent(any());
    }

    @Test
    void asaas_wrongToken_returns401() throws Exception {
        mvc.perform(post("/api/webhooks/asaas")
                        .header("asaas-access-token", "nope")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isUnauthorized());
        verify(webhooksService, never()).handleEvent(any());
    }

    @Test
    void asaas_correctToken_returns200_andDispatches() throws Exception {
        mvc.perform(post("/api/webhooks/asaas")
                        .header("asaas-access-token", SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isOk());
        verify(webhooksService, times(1)).handleEvent(any(AsaasPaymentEventDto.class));
    }

    @Test
    void register_withoutAuth_isForbidden() throws Exception {
        mvc.perform(post("/api/webhooks/register"))
                .andExpect(status().isForbidden());
        verify(webhooksService, never()).registerWebhook();
    }

    @Test
    void register_withAuthenticatedAppUser_reachesService() throws Exception {
        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);
        appUserRepository.save(AppUser.builder()
                .firebaseUid("uid-admin").firstName("X").lastName("Y")
                .email("x@y.com").phone("11999990000")
                .personDoc("12345671001").docType("CPF")
                .hasCar(false).locationId(locationId).build());

        FirebaseToken tok = mock(FirebaseToken.class);
        when(tok.getUid()).thenReturn("uid-admin");
        when(tok.getEmail()).thenReturn("x@y.com");
        when(tok.isEmailVerified()).thenReturn(true);
        when(firebaseAuth.verifyIdToken(eq("jwt-admin"))).thenReturn(tok);

        mvc.perform(post("/api/webhooks/register")
                        .header("Authorization", "Bearer jwt-admin"));

        verify(webhooksService, times(1)).registerWebhook();
    }
}
