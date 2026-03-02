package com.boip.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class ListingResponseDto {

    UUID id;
    UUID lotId;
    UUID sellerUserId;
    String status;
    String priceType;
    BigDecimal priceAmount;
    String currency;
    OffsetDateTime publishedAt;
    OffsetDateTime expiresAt;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
    List<ListingMediaResponseDto> media;
}
