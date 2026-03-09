package com.boip.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder 
public class UserResponseDto {
    UUID id;
    String firstName;
    String lastName;
    String email;
    String phone;
    String personDoc;
    String docType;
    boolean hasCar;
    String carNumber;
    UUID locationId;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}
