package com.boip.backend.dto;

import com.boip.backend.validation.ValidPayoutInfo;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@ValidPayoutInfo
public class UserPayoutInfoRequestDto {

    @NotBlank
    private String transferType; // PIX | TED

    // PIX
    private String pixKey;
    private String pixKeyType;

    // TED
    private String bankCode;
    private String agency;
    private String account;
    private String accountDigit;
    private String bankAccountType;
    private String ispb;
}
