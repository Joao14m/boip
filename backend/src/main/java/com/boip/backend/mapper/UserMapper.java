package com.boip.backend.mapper;

import com.boip.backend.dto.SellerPublicDto;
import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.Location;

public final class UserMapper {

    private UserMapper() {}

    public static SellerPublicDto toSellerPublicDto(AppUser entity, Location location) {
        return SellerPublicDto.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .uf(location != null ? location.getUf() : null)
                .build();
    }

    public static UserResponseDto toDto(AppUser entity) {
        return UserResponseDto.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .personDoc(entity.getPersonDoc())
                .docType(entity.getDocType())
                .hasCar(entity.getHasCar())
                .carNumber(entity.getCarNumber())
                .locationId(entity.getLocationId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
