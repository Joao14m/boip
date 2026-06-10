package com.boip.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor @AllArgsConstructor 
@Getter @Setter
@Builder 
public class CattleLotUpdateRequestDto {
    @Size(max=60)
    String lotCode;

    @Min(1)
    Integer headCount;
    
    UUID locationId;

    @DecimalMin("-90.0") @DecimalMax("90.0")
    BigDecimal latitude;

    @DecimalMin("-180.0") @DecimalMax("180.0")
    BigDecimal longitude;
}
