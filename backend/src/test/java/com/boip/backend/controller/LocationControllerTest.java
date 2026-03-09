package com.boip.backend.controller;

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

import com.jayway.jsonpath.JsonPath;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class LocationControllerTest {
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
    void create_read_flow() throws Exception {
        String createJson = """
            {
                "municipality":"Curitiba",
                "uf":"PR",
                "ibgeCode":"4106902"
            }
                """;

        MvcResult locRes = mvc.perform(post("/api/locations")
            .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(status().isCreated()) // change to isCreated() if you set 201
            .andReturn();

        String locBody = locRes.getResponse().getContentAsString();
        String locId = JsonPath.read(locBody, "$.id");
        
        // Read
        mvc.perform(get("/api/locations/{id}", locId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ibgeCode").value("4106902"));

        // Read All
        mvc.perform(get("/api/locations"))
            .andExpect(status().isOk());
    }

}
