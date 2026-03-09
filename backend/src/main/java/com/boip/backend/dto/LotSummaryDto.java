package com.boip.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class LotSummaryDto {
    UUID lotId;
    String lotCode;
    Integer headCount;
    String breed;
    String sex;
    String purpose;
    BigDecimal avgWeightKg;
    Integer avgAgeMonths;
}
