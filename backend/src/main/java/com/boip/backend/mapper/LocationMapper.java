package com.boip.backend.mapper;

import com.boip.backend.dto.LocationResponseDto;
import com.boip.backend.entity.Location;

public final class LocationMapper {

    private LocationMapper() {}

    public static LocationResponseDto toDto(Location entity) {
        return LocationResponseDto.builder()
                .id(entity.getId())
                .municipality(entity.getMunicipality())
                .uf(entity.getUf())
                .ibgeCode(entity.getIbgeCode())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
