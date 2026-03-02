package com.boip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LocationRequestDto {
    @NotBlank @Size(max = 120)
    String municipality;

    @NotBlank @Pattern(regexp = "^[A-Z]{2}$", message = "uf must be two uppercase letters")
    String uf;

    @NotBlank @Size(max = 7)
    String ibgeCode;
}
