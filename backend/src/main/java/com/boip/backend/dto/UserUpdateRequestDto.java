package com.boip.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor @AllArgsConstructor @Builder 
@Getter @Setter
public class UserUpdateRequestDto {
    @Size(max = 80) 
    String firstName;
    
    @Size(max = 120) 
    String lastName;

    @Email 
    String email;
    
    @Size(max = 20) 
    String phone;

    // digits only
    @Pattern(regexp = "\\d+", message = "personDoc must contain only digits")
    String personDoc;
    
    @Pattern(regexp = "CPF|CNPJ", message = "docType must be CPF or CNPJ")
    String docType;

    @Size(max = 30) 
    String carNumber;

    UUID locationId;
}
