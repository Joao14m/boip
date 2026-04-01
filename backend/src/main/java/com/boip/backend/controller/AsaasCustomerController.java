package com.boip.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.asaas.apisdk.models.CustomerGetResponseDto;
import com.asaas.apisdk.models.CustomerSaveRequestDto;
import com.asaas.apisdk.models.CustomerUpdateRequestDto;
import com.boip.backend.service.AsaasCustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Validated
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class AsaasCustomerController {
    private final AsaasCustomerService asaasCustomerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerGetResponseDto createAsaas(@Valid @RequestBody CustomerSaveRequestDto req){
        return asaasCustomerService.createCustomer(req);
    }

    // Kinda unnecessary
    @PutMapping("/{id}")
    public CustomerGetResponseDto updateAsaas(@PathVariable String id, @Valid @RequestBody CustomerUpdateRequestDto req){
        return asaasCustomerService.updateCustomer(id, req);
    }
}
