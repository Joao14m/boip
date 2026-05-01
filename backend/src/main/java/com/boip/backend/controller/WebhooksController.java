package com.boip.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.boip.backend.security.WebhookTokenVerifier;
import com.boip.backend.service.WebhooksService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

@Validated
@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhooksController {
    private final WebhooksService webhooksService;
    private final WebhookTokenVerifier tokenVerifier;

    @GetMapping
    public ResponseEntity<WebhookConfigListResponseDto> listWebhooks(
            @RequestHeader(value = "asaas-access-token", required = false) String accessToken) {
        requireAdminToken(accessToken);
        return ResponseEntity.ok(webhooksService.listWebhooks());
    }

    @PostMapping("/register")
    public ResponseEntity<WebhookConfigGetResponseDto> registerWebhook(
            @RequestHeader(value = "asaas-access-token", required = false) String accessToken) {
        requireAdminToken(accessToken);
        return ResponseEntity.ok(webhooksService.registerWebhook());
    }

    @DeleteMapping("/{webhookId}")
    public ResponseEntity<WebhookConfigDeleteResponseDto> deleteWebhook(
            @PathVariable String webhookId,
            @RequestHeader(value = "asaas-access-token", required = false) String accessToken) {
        requireAdminToken(accessToken);
        return ResponseEntity.ok(webhooksService.deleteWebhook(webhookId));
    }

    private void requireAdminToken(String token) {
        if (!tokenVerifier.verify(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin token");
        }
    }

    @PostMapping("/asaas")
    public ResponseEntity<Void> handleAsaasEvent(
            HttpServletRequest request,
            @RequestHeader(value = "asaas-access-token", required = false) String accessToken,
            @RequestBody AsaasPaymentEventDto event) {

        if (!tokenVerifier.verify(accessToken)) {
            // NOTE: getRemoteAddr returns the proxy IP behind load balancers;
            // prefer X-Forwarded-For when deployed behind a trusted proxy.
            log.warn("Webhook rejected: invalid access token from {}", request.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("Asaas webhook accepted: event={} paymentId={}",
                event.getEvent(),
                event.getPayment() != null ? event.getPayment().getId() : null);

        try {
            webhooksService.handleEvent(event);
        } catch (Exception e) {
            log.error("Webhook processing failed for event: {} - {}", event.getEvent(), e.getMessage(), e);
        }
        return ResponseEntity.ok().build();
    }
}
