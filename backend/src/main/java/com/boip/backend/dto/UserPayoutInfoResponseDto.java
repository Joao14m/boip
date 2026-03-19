package com.boip.backend.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class UserPayoutInfoResponseDto {
    private UUID id;
    private UUID userId;
    private String transferType;

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
