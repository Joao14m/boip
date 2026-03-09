package com.boip.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
@Builder
public class CattleLotResponseDto {
    UUID id;
    UUID ownerUserId;
    String lotCode;
    Integer headCount;
    UUID locationId;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
    CattleLotProfileResponseDto currentProfile;
}
