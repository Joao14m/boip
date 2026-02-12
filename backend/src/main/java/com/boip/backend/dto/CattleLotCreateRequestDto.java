package com.boip.backend.dto;

import java.util.UUID;

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
    @NotNull
    UUID ownerUserId; 

    @NotBlank @Size(max=60)
    String lotCode;

    @NotNull @Min(1)
    Integer headCount;
    
    @NotNull
    UUID locationId;
}
