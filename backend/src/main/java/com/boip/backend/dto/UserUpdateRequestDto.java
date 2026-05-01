package com.boip.backend.dto;

import java.util.UUID;

import com.boip.backend.validation.PersonDocHolder;
import com.boip.backend.validation.ValidPersonDoc;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@ValidPersonDoc
@NoArgsConstructor @AllArgsConstructor @Builder
@Getter @Setter
public class UserUpdateRequestDto implements PersonDocHolder {

    @Size(max = 80)  String firstName;
    @Size(max = 120) String lastName;
    @Size(max = 20)  String phone;

    String personDoc;

    @Pattern(regexp = "CPF|CNPJ", message = "docType must be CPF or CNPJ")
    String docType;

    @Size(max = 30) String carNumber;

    UUID locationId;
}
