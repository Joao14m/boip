package com.boip.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

// DTO for creating a new lot 

@Data
@NoArgsConstructor @AllArgsConstructor 
@Getter @Setter
@Builder
public class CattleLotCreateRequestDto {
    @NotBlank @Size(max=60)
    String lotCode;

    @NotNull @Min(1)
    Integer headCount;
    
    @NotNull
    UUID locationId;

    // Optional precise map pin. Omit to use the location's municipality center.
    @DecimalMin("-90.0") @DecimalMax("90.0")
    BigDecimal latitude;

    @DecimalMin("-180.0") @DecimalMax("180.0")
    BigDecimal longitude;
}
