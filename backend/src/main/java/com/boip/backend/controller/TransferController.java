package com.boip.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.asaas.apisdk.models.TransferGetResponseDto;
import com.asaas.apisdk.models.TransferSaveRequestDto;
import com.boip.backend.service.TransferService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {
    private final TransferService transferService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferGetResponseDto transfer(@RequestBody TransferSaveRequestDto request) {
        return transferService.createTransfer(request);
    }
}
