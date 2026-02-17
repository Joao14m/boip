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

    @Test
    void create_read_update_delete_flow() throws Exception {
        // pick a seeded location id (from your V2 seed)
        UUID locationId = jdbc.queryForObject("select id from location limit 1", UUID.class);

        // 0) create a user (owner_user_id FK)
        String signupJson = """
        {
          "firstName":"Owner",
          "lastName":"User",
          "email":"owner@test.com",
          "phone":"21999990000",
          "docType":"CPF",
          "personDoc":"12345671001",
          "hasCar":false,
          "carNumber":null,
          "locationId":"%s"
        }
        """.formatted(locationId);

        MvcResult userRes = mvc.perform(post("/api/users/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signupJson))
            .andExpect(status().isCreated()) // change to isCreated() if you set 201
            .andReturn();

        String userBody = userRes.getResponse().getContentAsString();
        String ownerUserId = JsonPath.read(userBody, "$.id");

        // 1) create cattle lot
        String createLotJson = """
        {
          "ownerUserId":"%s",
          "lotCode":"LOT-001",
          "headCount":25,
          "locationId":"%s"
        }
        """.formatted(ownerUserId, locationId);

        MvcResult lotRes = mvc.perform(post("/api/lots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createLotJson))
            .andExpect(status().isCreated()) // or isOk() depending on your controller
            .andReturn();

        String lotBody = lotRes.getResponse().getContentAsString();
        String lotId = JsonPath.read(lotBody, "$.id");

        // 2) read
        mvc.perform(get("/api/lots/{id}", lotId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.lotCode").value("LOT-001"))
            .andExpect(jsonPath("$.headCount").value(25));

        // 3) patch/update
        String patchJson = """
        { "headCount": 30 }
        """;

        mvc.perform(patch("/api/lots/{id}", lotId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(patchJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.headCount").value(30));

        // 4) delete
        mvc.perform(delete("/api/lots/{id}", lotId))
            .andExpect(status().isNoContent()); // or isOk()

        // 5) read after delete => 404
        mvc.perform(get("/api/lots/{id}", lotId))
            .andExpect(status().isNotFound());
    }
}