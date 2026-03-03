package com.boip.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class ListingRequestDto {

    @NotNull
    UUID lotId;

    @NotNull
    UUID sellerUserId;

    @NotBlank @Pattern(regexp = "PER_HEAD|TOTAL")
    String priceType;

    @NotNull @DecimalMin("0.01")
    BigDecimal priceAmount;

    String currency;

    OffsetDateTime expiresAt;

    @NotEmpty @Valid
    List<ListingMediaInputDto> media;
}
