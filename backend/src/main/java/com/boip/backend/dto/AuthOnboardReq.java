package com.boip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AuthOnboardReq(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String phone,
        @NotBlank String personDoc,
        @NotBlank String docType,
        @NotNull Boolean hasCar,
        String carNumber,
        @NotNull UUID locationId
) {}
