package com.boip.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.google.firebase.FirebaseApp;
import com.jayway.jsonpath.JsonPath;

import org.springframework.jdbc.core.JdbcTemplate;
import java.util.UUID;

@WithMockUser
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class UserControllerTest {
    @MockitoBean FirebaseApp firebaseApp;

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
        r.add("spring.flyway.enabled", () -> true); // if you use Flyway migrations
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @Test
    void signup_read_update_delete_flow() throws Exception {
        UUID locationId = jdbc.queryForObject(
            "select id from location limit 1",
            UUID.class
        );

        // 1) signup
        String signupJson = """
        {
            "firstName":"Joao",
            "lastName":"Silva",
            "email":"joao.it@test.com",
            "phone":"21999990000",
            "docType":"CPF",
            "personDoc":"12345671001",
            "hasCar":false,
            "carNumber":null,
            "locationId":"%s"
        }
        """.formatted(locationId);

        MvcResult res = mvc.perform(post("/api/users/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(signupJson))
        .andExpect(status().isCreated())
        .andReturn();

        String body = res.getResponse().getContentAsString();
        String userId = JsonPath.read(body, "$.id");

        // 2) read
        mvc.perform(get("/api/users/{id}", userId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("joao.it@test.com"));

        // 3) patch
        String patchJson = """
        { "firstName":"Joao Marcelo" }
        """;
        mvc.perform(patch("/api/users/{id}", userId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(patchJson))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.firstName").value("Joao Marcelo"));

        // 4) delete
        mvc.perform(delete("/api/users/{id}", userId))
        .andExpect(status().isNoContent());

        // 5) read after delete => 404
        mvc.perform(get("/api/users/{id}", userId))
        .andExpect(status().isNotFound());
    }
}
