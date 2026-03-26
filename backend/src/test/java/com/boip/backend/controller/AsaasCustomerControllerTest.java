package com.boip.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.asaas.apisdk.models.CustomerGetResponseDto;
import com.boip.backend.service.AsaasCustomerService;
import com.google.firebase.FirebaseApp;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WithMockUser
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class AsaasCustomerControllerTest {

    @MockitoBean FirebaseApp firebaseApp;
    @MockitoBean AsaasCustomerService asaasCustomerService;

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
        r.add("asaas.api-key", () -> "test-api-key");
    }

    @Autowired MockMvc mvc;

    @Test
    void createCustomer_returns201_and_customerId() throws Exception {
        CustomerGetResponseDto mockResponse = CustomerGetResponseDto.builder()
            .id("cus_000001234567")
            .name("John Doe")
            .email("john.doe@asaas.com.br")
            .cpfCnpj("24971563792")
            .build();

        when(asaasCustomerService.createCustomer(any())).thenReturn(mockResponse);

        String requestBody = """
        {
            "name": "John Doe",
            "cpfCnpj": "24971563792",
            "email": "john.doe@asaas.com.br",
            "phone": "4738010919",
            "mobilePhone": "4799376637"
        }
        """;

        mvc.perform(post("/api/customer")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("cus_000001234567"))
        .andExpect(jsonPath("$.name").value("John Doe"))
        .andExpect(jsonPath("$.email").value("john.doe@asaas.com.br"));
    }

    @Test
    void createCustomer_missingRequiredFields_returns400() throws Exception {
        String requestBody = """
        {
            "email": "john.doe@asaas.com.br"
        }
        """;

        mvc.perform(post("/api/customer")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isBadRequest());
    }
}
