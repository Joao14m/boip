package com.boip.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
}
