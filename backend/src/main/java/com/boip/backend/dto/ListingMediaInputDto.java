package com.boip.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class ListingMediaInputDto {

    @NotNull @Min(0) @Max(3)
    Integer mediaSlot;

    @NotBlank @Pattern(regexp = "IMAGE|VIDEO")
    String mediaType;

    @NotBlank @Size(max = 500)
    String mediaKey;

    @Size(max = 80)
    String contentType;
}
