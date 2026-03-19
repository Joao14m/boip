package com.boip.backend.service;

import org.springframework.stereotype.Service;

import com.asaas.apisdk.AsaasSdk;
import com.asaas.apisdk.models.CustomerGetResponseDto;
import com.asaas.apisdk.models.CustomerSaveRequestDto;
import com.asaas.apisdk.models.CustomerUpdateRequestDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AsaasCustomerService {
    private final AsaasSdk asaasSdk;

    public CustomerGetResponseDto createCustomer(CustomerSaveRequestDto req) {
        return asaasSdk.customer.createNewCustomer(req);
    }

    // Kinda unnecessary
    public CustomerGetResponseDto updateCustomer(String id, CustomerUpdateRequestDto req){
        return asaasSdk.customer.updateExistingCustomer(id, req);
    }

}
