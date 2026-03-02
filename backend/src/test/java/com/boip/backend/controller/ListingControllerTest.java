package com.boip.backend.controller;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class ListingControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.flyway.enabled", () -> true);
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @Test
    void create_listing_add_media_update_status_delete_flow() throws Exception {

        // -- setup: create a user and a cattle lot to reference --
        UUID locationId = jdbc.queryForObject(
                "SELECT id FROM location LIMIT 1", UUID.class);

        String userJson = """
                {
                    "firstName":"Test",
                    "lastName":"Seller",
                    "email":"seller.listing@test.com",
                    "phone":"21999990001",
                    "docType":"CPF",
                    "personDoc":"12345678902",
                    "hasCar":false,
                    "carNumber":null,
                    "locationId":"%s"
                }
                """.formatted(locationId);

        MvcResult userRes = mvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated())
                .andReturn();
        String sellerUserId = JsonPath.read(userRes.getResponse().getContentAsString(), "$.id");

        String lotJson = """
                {
                    "ownerUserId":"%s",
                    "lotCode":"LOT-LISTING-001",
                    "headCount":50,
                    "locationId":"%s"
                }
                """.formatted(sellerUserId, locationId);

        MvcResult lotRes = mvc.perform(post("/api/lots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(lotJson))
                .andExpect(status().isCreated())
                .andReturn();
        String lotId = JsonPath.read(lotRes.getResponse().getContentAsString(), "$.id");

        // 1) POST /api/listings → 201 (with slot 0 IMAGE included at creation)
        String listingJson = """
                {
                    "lotId":"%s",
                    "sellerUserId":"%s",
                    "priceType":"PER_HEAD",
                    "priceAmount":1500.00,
                    "media":[
                        {"mediaSlot":0,"mediaType":"IMAGE","mediaKey":"images/listing/photo0.jpg"}
                    ]
                }
                """.formatted(lotId, sellerUserId);

        MvcResult listingRes = mvc.perform(post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listingJson))
                .andExpect(status().isCreated())
                .andReturn();
        String listingId = JsonPath.read(listingRes.getResponse().getContentAsString(), "$.id");

        // 2) GET /api/listings/{id} → 200, assert priceType, status, and 1 media from creation
        mvc.perform(get("/api/listings/{id}", listingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priceType").value("PER_HEAD"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.media.length()").value(1));

        // 3) POST /api/listings/{id}/media slot 3, VIDEO → 201 (adding media to existing listing)
        String mediaVideo = """
                {
                    "mediaSlot":3,
                    "mediaType":"VIDEO",
                    "mediaKey":"videos/listing/%s/tour.mp4"
                }
                """.formatted(listingId);

        mvc.perform(post("/api/listings/{id}/media", listingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mediaVideo))
                .andExpect(status().isCreated());

        // 4) GET /api/listings/{id}/media → 200, assert 2 items total
        mvc.perform(get("/api/listings/{id}/media", listingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // 5) PATCH /api/listings/{id}/status → 200 ACTIVE
        mvc.perform(patch("/api/listings/{id}/status", listingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 6) DELETE /api/listings/{id} → 204
        mvc.perform(delete("/api/listings/{id}", listingId))
                .andExpect(status().isNoContent());

        // 7) GET /api/listings/{id} → 404
        mvc.perform(get("/api/listings/{id}", listingId))
                .andExpect(status().isNotFound());
    }
}
