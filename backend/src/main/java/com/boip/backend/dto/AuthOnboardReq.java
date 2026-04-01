package com.boip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AuthOnboardReq(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 120) String lastName,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Pattern(regexp = "\\d+", message = "personDoc must contain only digits") String personDoc,
        @NotBlank @Pattern(regexp = "CPF|CNPJ", message = "docType must be CPF or CNPJ") String docType,
        @NotNull Boolean hasCar,
        @Size(max = 30) String carNumber,
        @NotNull UUID locationId
) {}
