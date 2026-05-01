package com.boip.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.asaas.apisdk.models.PaymentBillingInfoResponseDto;
import com.asaas.apisdk.models.PaymentGetResponseDto;
import com.boip.backend.service.PaymentService;

import static com.boip.backend.auth.SecurityUtils.requireAppUser;

import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Validated
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    // Endpoint to send to Asaas
    // It's necessary for our webhook config too
    @PostMapping("/{listingId}")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentGetResponseDto chargePayment(@PathVariable UUID listingId){
        return paymentService.createCharge(listingId, requireAppUser());
    }

    // Endpoints if the frontend needs to display payment instructions to the buyer after the charge is created
    @GetMapping("/{chargeId}")
    public PaymentBillingInfoResponseDto getBillingStatus(@PathVariable String chargeId){
        return paymentService.retrieveBilling(chargeId, requireAppUser());
    }

}
