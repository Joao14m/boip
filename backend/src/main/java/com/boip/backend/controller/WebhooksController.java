package com.boip.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.asaas.apisdk.models.WebhookConfigDeleteResponseDto;
import com.asaas.apisdk.models.WebhookConfigGetResponseDto;
import com.asaas.apisdk.models.WebhookConfigListResponseDto;
import com.boip.backend.dto.AsaasPaymentEventDto;
import com.boip.backend.service.WebhooksService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;

@Validated
@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhooksController {
    private final WebhooksService webhooksService;

    @Value("${app.webhook-auth-token}")
    private String webhookAuthToken;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public WebhookConfigGetResponseDto register() {
        return webhooksService.registerWebhook();
    }

    @GetMapping
    public WebhookConfigListResponseDto list() {
        return webhooksService.listWebhooks();
    }

    @DeleteMapping("/{webhookId}")
    public WebhookConfigDeleteResponseDto delete(@PathVariable String webhookId) {
        return webhooksService.deleteWebhook(webhookId);
    }

    @PostMapping("/asaas")
    @ResponseStatus(HttpStatus.OK)
    public void handleAsaasEvent(
            @RequestHeader(value = "asaas-access-token", required = false) String accessToken,
            @RequestBody AsaasPaymentEventDto event) {
        if (!webhookAuthToken.equals(accessToken)) {
            log.warn("Webhook rejected: invalid access token");
            return;
        }
        try {
            webhooksService.handleEvent(event);
        } catch (Exception e) {
            log.error("Webhook processing failed for event: {} - {}", event.getEvent(), e.getMessage(), e);
        }
    }
}
