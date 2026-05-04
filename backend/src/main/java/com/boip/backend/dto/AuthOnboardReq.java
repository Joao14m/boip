package com.boip.backend.dto;

import com.boip.backend.validation.PersonDocHolder;
import com.boip.backend.validation.ValidPersonDoc;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@ValidPersonDoc
public record AuthOnboardReq(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 120) String lastName,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank String personDoc,
        @NotBlank @Pattern(regexp = "CPF|CNPJ", message = "docType must be CPF or CNPJ") String docType,
        @NotNull Boolean hasCar,
        @Size(max = 30) String carNumber,
        @NotNull UUID locationId
) implements PersonDocHolder {

    @Override public String getPersonDoc() { return personDoc; }
    @Override public String getDocType()   { return docType;   }
}
