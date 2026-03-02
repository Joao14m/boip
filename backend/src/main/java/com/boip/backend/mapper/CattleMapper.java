package com.boip.backend.mapper;

import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.entity.CattleLot;

public final class CattleMapper {

    private CattleMapper() {}

    public static CattleLotResponseDto toDto(CattleLot entity) {
        return CattleLotResponseDto.builder()
                .id(entity.getId())
                .ownerUserId(entity.getOwnerUserId())
                .lotCode(entity.getLotCode())
                .headCount(entity.getHeadCount())
                .locationId(entity.getLocationId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
