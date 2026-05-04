package com.boip.backend.dto;

import com.boip.backend.validation.ValidPayoutInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@ValidPayoutInfo
public class UserPayoutInfoRequestDto {

    @NotBlank
    @Pattern(regexp = "PIX|TED", message = "transferType must be PIX or TED")
    private String transferType;

    // PIX
    @Size(max = 77)
    private String pixKey;

    @Pattern(regexp = "^(CPF|CNPJ|EMAIL|PHONE|EVP)?$", message = "pixKeyType must be CPF, CNPJ, EMAIL, PHONE or EVP")
    private String pixKeyType;

    // TED
    @Size(max = 4)
    private String bankCode;

    @Size(max = 10)
    private String agency;

    @Size(max = 20)
    private String account;

    @Size(max = 2)
    private String accountDigit;

    @Pattern(regexp = "^(CONTA_CORRENTE|CONTA_POUPANCA)?$", message = "bankAccountType must be CONTA_CORRENTE or CONTA_POUPANCA")
    private String bankAccountType;

    @Size(max = 8)
    private String ispb;
}
