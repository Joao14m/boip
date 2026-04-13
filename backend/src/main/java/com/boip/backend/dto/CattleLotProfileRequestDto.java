package com.boip.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
@Builder
public class CattleLotProfileRequestDto {
    @NotBlank
    @Size(max = 80)
    String breed;

    @NotBlank
    @Pattern(regexp = "M|F|MIXED", message = "sex must be M, F or MIXED")
    String sex;

    @NotBlank
    @Pattern(regexp = "Corte|Leite|Reprodução|Misto", message = "purpose must be Corte, Leite, Reprodução or Misto")
    String purpose;

    @NotNull
    @DecimalMin(value = "0.01", message = "avgWeightKg must be greater than 0")
    BigDecimal avgWeightKg;

    @NotNull
    @Min(value = 1, message = "avgAgeMonths must be at least 1")
    Integer avgAgeMonths;

    @Min(value = 1900, message = "birthYear must be at least 1900")
    Integer birthYear;

    @Size(max = 500)
    String description;
}
