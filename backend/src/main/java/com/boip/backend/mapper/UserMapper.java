package com.boip.backend.mapper;

import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.entity.AppUser;

public final class UserMapper {

    private UserMapper() {}

    public static UserResponseDto toDto(AppUser entity) {
        return UserResponseDto.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .docType(entity.getDocType())
                .hasCar(entity.isHasCar())
                .carNumber(entity.getCarNumber())
                .locationId(entity.getLocationId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
