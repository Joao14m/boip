package com.boip.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
@Builder
public class CattleLotProfileRequestDto {
    String breed;
    String sex;
    String purpose;
    BigDecimal avgWeightKg;
    Integer avgAgeMonths;
    Integer birthYear;
    String description;
}
