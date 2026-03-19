package com.boip.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.asaas.apisdk.models.WebhookConfigGetResponseDto;
import com.boip.backend.dto.AsaasPaymentEventDto;
import com.boip.backend.service.WebhooksService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhooksController {
    private final WebhooksService webhooksService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public WebhookConfigGetResponseDto register() {
        return webhooksService.registerWebhook();
    }

    @PostMapping("/asaas")
    @ResponseStatus(HttpStatus.OK)
    public void handleAsaasEvent(@RequestBody AsaasPaymentEventDto event) {
        webhooksService.handleEvent(event);
    }
}
