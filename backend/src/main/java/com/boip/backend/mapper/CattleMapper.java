package com.boip.backend.mapper;

import com.boip.backend.dto.CattleLotProfileResponseDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.entity.CattleLot;
import com.boip.backend.entity.CattleLotProfile;

public final class CattleMapper {

    private CattleMapper() {}

    public static CattleLotResponseDto toDto(CattleLot entity) {
        return toDto(entity, null);
    }

    public static CattleLotResponseDto toDto(CattleLot entity, CattleLotProfileResponseDto currentProfile) {
        return CattleLotResponseDto.builder()
                .id(entity.getId())
                .ownerUserId(entity.getOwnerUserId())
                .lotCode(entity.getLotCode())
                .headCount(entity.getHeadCount())
                .locationId(entity.getLocationId())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .currentProfile(currentProfile)
                .build();
    }

    public static CattleLotProfileResponseDto profileToDto(CattleLotProfile entity) {
        return CattleLotProfileResponseDto.builder()
                .id(entity.getId())
                .lotId(entity.getLotId())
                .profileVersion(entity.getProfileVersion())
                .breed(entity.getBreed())
                .sex(entity.getSex())
                .purpose(entity.getPurpose())
                .avgWeightKg(entity.getAvgWeightKg())
                .avgAgeMonths(entity.getAvgAgeMonths())
                .birthYear(entity.getBirthYear())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
