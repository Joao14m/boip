package com.boip.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

// DTO for creating a new user

@Data @NoArgsConstructor @AllArgsConstructor @Builder 
@Getter @Setter
public class UserSignupRequestDto {
    @NotBlank @Size(max = 80) 
    String firstName;
    
    @NotBlank @Size(max = 120) 
    String lastName;

    @NotBlank @Email 
    String email;
    
    @NotBlank @Size(max = 20) 
    String phone;

    // digits only
    @NotBlank @Pattern(regexp = "\\d+", message = "personDoc must contain only digits")
    String personDoc;
    
    @NotBlank @Pattern(regexp = "CPF|CNPJ", message = "docType must be CPF or CNPJ")
    String docType;

    @NotNull 
    Boolean hasCar;
    
    @Size(max = 30) 
    String carNumber;

    @NotNull 
    UUID locationId;
}
