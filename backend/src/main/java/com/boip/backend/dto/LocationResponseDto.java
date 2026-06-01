package com.boip.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LocationResponseDto {
    UUID id;
    String municipality;
    String uf;
    String ibgeCode;
    BigDecimal latitude;
    BigDecimal longitude;
    OffsetDateTime createdAt;
}
