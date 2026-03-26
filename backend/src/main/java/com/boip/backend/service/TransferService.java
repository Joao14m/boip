package com.boip.backend.service;

import org.springframework.stereotype.Service;

import com.asaas.apisdk.AsaasSdk;
import com.asaas.apisdk.models.TransferGetResponseDto;
import com.asaas.apisdk.models.TransferSaveRequestDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransferService {
    private final AsaasSdk asaasSdk;

    public TransferGetResponseDto createTransfer(TransferSaveRequestDto request) {
        return asaasSdk.transfer.transferToAnotherInstitutionAccountOrPixKey(request);
    }
}
