package com.boip.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class ListingPatchRequestDto {

    @Pattern(regexp = "PER_HEAD|TOTAL")
    String priceType;

    @DecimalMin("0.01")
    BigDecimal priceAmount;

    @Pattern(regexp = "^[A-Z]{3}$", message = "currency must be a 3-letter ISO code")
    String currency;

    OffsetDateTime expiresAt;
}
