package com.boip.backend.controller;

import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.CattleLot;
import com.boip.backend.entity.Listing;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.CattleLotRepository;
import com.boip.backend.repository.ListingRepository;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security regression tests for listing visibility (finding #3) and server-side
 * media contentType validation (finding #2).
 *
 * #3 — Non-ACTIVE listings (DRAFT/PAUSED/SOLD/CANCELLED) must be visible only to
 *      their owner across findById, findBySeller, and findByLot.
 * #2 — The declared media contentType must match the slot's media kind.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ListingSecurityIT {

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
    @Autowired CattleLotRepository cattleLotRepository;
    @Autowired ListingRepository listingRepository;

    private AppUser owner;
    private CattleLot lot;
    private Listing activeListing;
    private Listing draftListing;

    @BeforeEach
    void seed() {
        jdbc.update("delete from listing_media");
        jdbc.update("delete from listing");
        jdbc.update("delete from cattle_lot");
        jdbc.update("delete from app_user");

        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);

        owner = appUserRepository.save(AppUser.builder()
                .firebaseUid("uid-owner").firstName("Owner").lastName("One")
                .email("owner@test.com").phone("11999990001")
                .personDoc("11111111111").docType("CPF")
                .hasCar(false).locationId(locationId).build());

        // A second, unrelated user — the "attacker" trying to read the owner's inventory.
        appUserRepository.save(AppUser.builder()
                .firebaseUid("uid-other").firstName("Other").lastName("Two")
                .email("other@test.com").phone("11999990002")
                .personDoc("22222222222").docType("CPF")
                .hasCar(false).locationId(locationId).build());

        lot = cattleLotRepository.save(CattleLot.builder()
                .ownerUserId(owner.getId()).lotCode("LOT-SEC-001")
                .headCount(40).locationId(locationId).build());

        activeListing = saveListing("ACTIVE");
        draftListing = saveListing("DRAFT");

        stubToken("jwt-owner", "uid-owner");
        stubToken("jwt-other", "uid-other");
    }

    private Listing saveListing(String status) {
        return listingRepository.save(Listing.builder()
                .lotId(lot.getId())
                .sellerUserId(owner.getId())
                .status(status)
                .priceType("PER_HEAD")
                .priceAmount(BigDecimal.valueOf(1500))
                .currency("BRL")
                .build());
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

    // ---- #3: findById ----

    @Test
    void owner_canSee_ownDraft_byId() throws Exception {
        mvc.perform(get("/api/listings/{id}", draftListing.getId())
                        .header("Authorization", "Bearer jwt-owner"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void nonOwner_cannotSee_draft_byId() throws Exception {
        mvc.perform(get("/api/listings/{id}", draftListing.getId())
                        .header("Authorization", "Bearer jwt-other"))
                .andExpect(status().isNotFound());
    }

    @Test
    void anyone_canSee_active_byId() throws Exception {
        mvc.perform(get("/api/listings/{id}", activeListing.getId())
                        .header("Authorization", "Bearer jwt-other"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // ---- #3: findBySeller ----

    @Test
    void nonOwner_findBySeller_seesOnlyActive() throws Exception {
        mvc.perform(get("/api/listings")
                        .param("sellerUserId", owner.getId().toString())
                        .header("Authorization", "Bearer jwt-other"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    void owner_findBySeller_seesAllStatuses() throws Exception {
        mvc.perform(get("/api/listings")
                        .param("sellerUserId", owner.getId().toString())
                        .header("Authorization", "Bearer jwt-owner"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2));
    }

    // ---- #3: findByLot ----

    @Test
    void nonOwner_findByLot_seesOnlyActive() throws Exception {
        mvc.perform(get("/api/listings")
                        .param("lotId", lot.getId().toString())
                        .header("Authorization", "Bearer jwt-other"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    void owner_findByLot_seesAllStatuses() throws Exception {
        mvc.perform(get("/api/listings")
                        .param("lotId", lot.getId().toString())
                        .header("Authorization", "Bearer jwt-owner"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2));
    }

    // ---- #2: server-side contentType validation ----

    @Test
    void addMedia_rejects_contentType_mismatchedWithSlot() throws Exception {
        String body = """
                {
                  "listingId":"%s",
                  "mediaSlot":0,
                  "mediaType":"IMAGE",
                  "mediaKey":"listings/uid-owner/%s/0.jpg",
                  "contentType":"application/pdf"
                }
                """.formatted(activeListing.getId(), lot.getId());

        mvc.perform(post("/api/listings/{id}/media", activeListing.getId())
                        .header("Authorization", "Bearer jwt-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addMedia_accepts_matchingImageContentType() throws Exception {
        String body = """
                {
                  "listingId":"%s",
                  "mediaSlot":0,
                  "mediaType":"IMAGE",
                  "mediaKey":"listings/uid-owner/%s/0.jpg",
                  "contentType":"image/jpeg"
                }
                """.formatted(activeListing.getId(), lot.getId());

        mvc.perform(post("/api/listings/{id}/media", activeListing.getId())
                        .header("Authorization", "Bearer jwt-owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }
}
