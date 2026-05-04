package com.boip.backend.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.UserPayoutInfoRequestDto;
import com.boip.backend.dto.UserPayoutInfoResponseDto;
import com.boip.backend.entity.UserPayoutInfo;
import com.boip.backend.repository.UserPayoutInfoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPayoutInfoService {
    private final UserPayoutInfoRepository userPayoutInfoRepository;

    public UserPayoutInfoResponseDto upsert(UUID userId, UserPayoutInfoRequestDto dto) {
        UserPayoutInfo info = userPayoutInfoRepository.findByUserId(userId)
            .orElse(UserPayoutInfo.builder().userId(userId).build());

        info.setTransferType(dto.getTransferType());
        info.setPixKey(dto.getPixKey());
        info.setPixKeyType(dto.getPixKeyType());
        info.setBankCode(dto.getBankCode());
        info.setAgency(dto.getAgency());
        info.setAccount(dto.getAccount());
        info.setAccountDigit(dto.getAccountDigit());
        info.setBankAccountType(dto.getBankAccountType());
        info.setIspb(dto.getIspb());

        return toResponse(userPayoutInfoRepository.save(info));
    }

    public UserPayoutInfoResponseDto get(UUID userId) {
        UserPayoutInfo info = userPayoutInfoRepository.findByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payout info not found for user: " + userId));
        return toResponse(info);
    }

    private UserPayoutInfoResponseDto toResponse(UserPayoutInfo info) {
        return UserPayoutInfoResponseDto.builder()
            .id(info.getId())
            .userId(info.getUserId())
            .transferType(info.getTransferType())
            .pixKey(info.getPixKey())
            .pixKeyType(info.getPixKeyType())
            .bankCode(info.getBankCode())
            .agency(info.getAgency())
            .account(info.getAccount())
            .accountDigit(info.getAccountDigit())
            .bankAccountType(info.getBankAccountType())
            .ispb(info.getIspb())
            .build();
    }
}
