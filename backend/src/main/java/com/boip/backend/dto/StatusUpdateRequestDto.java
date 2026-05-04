package com.boip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class StatusUpdateRequestDto {
    @NotBlank
    @Pattern(regexp = "ACTIVE|PAUSED|SOLD|CANCELLED", message = "status must be ACTIVE, PAUSED, SOLD, or CANCELLED")
    String status;
}
