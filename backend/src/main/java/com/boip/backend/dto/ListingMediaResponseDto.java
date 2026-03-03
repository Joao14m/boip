package com.boip.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class ListingMediaResponseDto {

    UUID id;
    UUID listingId;
    Integer mediaSlot;
    String mediaType;
    String mediaKey;
    String contentType;
    OffsetDateTime createdAt;
}
