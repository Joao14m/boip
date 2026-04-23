package com.boip.backend.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SellerPublicDto {
    UUID id;
    String firstName;
    String lastName;
    String email;
    String phone;
    String uf;
}
