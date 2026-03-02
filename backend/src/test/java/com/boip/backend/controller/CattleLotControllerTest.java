package com.boip.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;

import com.jayway.jsonpath.JsonPath;

import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class CattleLotControllerTest {

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
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none"); // Flyway owns schema
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    private String createUser(String email, String personDoc, UUID locationId) throws Exception {
        String body = """
                {
                  "firstName":"Owner",
                  "lastName":"User",
                  "email":"%s",
                  "phone":"21999990000",
                  "docType":"CPF",
                  "personDoc":"%s",
                  "hasCar":false,
                  "carNumber":null,
                  "locationId":"%s"
                }
                """.formatted(email, personDoc, locationId);

        MvcResult res = mvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        return JsonPath.read(res.getResponse().getContentAsString(), "$.id");
    }

    private String createLot(String ownerUserId, String lotCode, UUID locationId) throws Exception {
        String body = """
                {
                  "ownerUserId":"%s",
                  "lotCode":"%s",
                  "headCount":25,
                  "locationId":"%s"
                }
                """.formatted(ownerUserId, lotCode, locationId);

        MvcResult res = mvc.perform(post("/api/lots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        return JsonPath.read(res.getResponse().getContentAsString(), "$.id");
    }

    @Test
    void create_read_update_delete_flow() throws Exception {
        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);
        String ownerUserId = createUser("owner@test.com", "12345671001", locationId);
        String lotId = createLot(ownerUserId, "LOT-001", locationId);

        // read
        mvc.perform(get("/api/lots/{id}", lotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lotCode").value("LOT-001"))
                .andExpect(jsonPath("$.headCount").value(25));

        // patch/update
        mvc.perform(patch("/api/lots/{id}", lotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"headCount\": 30 }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headCount").value(30));

        // delete
        mvc.perform(delete("/api/lots/{id}", lotId))
                .andExpect(status().isNoContent());

        // read after delete → 404
        mvc.perform(get("/api/lots/{id}", lotId))
                .andExpect(status().isNotFound());
    }

    @Test
    void profile_create_get_history_flow() throws Exception {
        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);
        String ownerUserId = createUser("profile-owner@test.com", "98765432100", locationId);
        String lotId = createLot(ownerUserId, "LOT-PRF-001", locationId);

        // 1) no profile yet → GET current returns 404
        mvc.perform(get("/api/lots/{id}/profile", lotId))
                .andExpect(status().isNotFound());

        // 2) GET history with no profiles → empty list
        mvc.perform(get("/api/lots/{id}/profile/history", lotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // 3) POST profile v1 → 201, version == 1
        mvc.perform(post("/api/lots/{id}/profile", lotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "breed": "Nelore",
                                  "sex": "M",
                                  "purpose": "BEEF",
                                  "avgWeightKg": 450.50,
                                  "avgAgeMonths": 24,
                                  "birthYear": 2022,
                                  "description": "First version"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profileVersion").value(1))
                .andExpect(jsonPath("$.lotId").value(lotId))
                .andExpect(jsonPath("$.breed").value("Nelore"))
                .andExpect(jsonPath("$.sex").value("M"))
                .andExpect(jsonPath("$.purpose").value("BEEF"));

        // 4) GET current profile → v1
        mvc.perform(get("/api/lots/{id}/profile", lotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileVersion").value(1))
                .andExpect(jsonPath("$.breed").value("Nelore"));

        // 5) POST profile v2 → 201, version auto-increments to 2
        mvc.perform(post("/api/lots/{id}/profile", lotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "breed": "Angus",
                                  "sex": "MIXED",
                                  "purpose": "DAIRY",
                                  "avgWeightKg": 500.00,
                                  "avgAgeMonths": 30,
                                  "birthYear": 2021,
                                  "description": "Second version"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profileVersion").value(2))
                .andExpect(jsonPath("$.breed").value("Angus"));

        // 6) GET current profile → v2 (the latest)
        mvc.perform(get("/api/lots/{id}/profile", lotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileVersion").value(2))
                .andExpect(jsonPath("$.breed").value("Angus"));

        // 7) GET history → 2 entries ordered newest first
        mvc.perform(get("/api/lots/{id}/profile/history", lotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].profileVersion").value(2))
                .andExpect(jsonPath("$[1].profileVersion").value(1));

        // 8) GET lot → currentProfile is now v2
        mvc.perform(get("/api/lots/{id}", lotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentProfile.profileVersion").value(2))
                .andExpect(jsonPath("$.currentProfile.breed").value("Angus"));

        // 9) invalid sex → 400
        mvc.perform(post("/api/lots/{id}/profile", lotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"sex\": \"X\" }"))
                .andExpect(status().isBadRequest());

        // 10) invalid purpose → 400
        mvc.perform(post("/api/lots/{id}/profile", lotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"purpose\": \"SLAUGHTER\" }"))
                .andExpect(status().isBadRequest());

        // 11) unknown lot → 404
        mvc.perform(post("/api/lots/{id}/profile", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }
}
