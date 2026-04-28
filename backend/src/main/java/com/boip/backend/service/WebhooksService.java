package com.boip.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.asaas.apisdk.AsaasSdk;
import com.asaas.apisdk.models.TransferBankAccountSaveRequestBankAccountType;
import com.asaas.apisdk.models.TransferBankAccountSaveRequestDto;
import com.asaas.apisdk.models.TransferBankSaveRequestDto;
import com.asaas.apisdk.models.TransferSaveRequestDto;
import com.asaas.apisdk.models.TransferSaveRequestPixAddressKeyType;
import com.asaas.apisdk.models.TransferSaveRequestTransferType;
import com.asaas.apisdk.models.WebhookConfigDeleteResponseDto;
import com.asaas.apisdk.models.WebhookConfigGetResponseDto;
import com.asaas.apisdk.models.WebhookConfigListResponseDto;
import com.asaas.apisdk.models.WebhookConfigSaveRequestDto;
import com.asaas.apisdk.models.WebhookConfigSaveRequestWebhookEvent;
import com.asaas.apisdk.models.WebhookConfigSaveRequestWebhookSendType;
import com.boip.backend.dto.AsaasPaymentEventDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.Listing;
import com.boip.backend.entity.UserPayoutInfo;
import com.boip.backend.entity.WebhookEvent;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.ListingRepository;
import com.boip.backend.repository.UserPayoutInfoRepository;
import com.boip.backend.repository.WebhookEventRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhooksService {
    private static final double PLATFORM_COMMISSION = 0.05;

    private final AsaasSdk asaasSdk;
    private final ListingRepository listingRepository;
    private final AppUserRepository appUserRepository;
    private final UserPayoutInfoRepository userPayoutInfoRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final TransferService transferService;

    @Value("${app.webhook-url}")
    private String webhookUrl;

    @Value("${app.webhook-auth-token}")
    private String webhookAuthToken;

    @Value("${app.webhook-contact-email}")
    private String webhookContactEmail;

    public WebhookConfigGetResponseDto registerWebhook() {
        WebhookConfigSaveRequestDto request = WebhookConfigSaveRequestDto.builder()
            .name("Agregis Payments")
            .url(webhookUrl)
            .email(webhookContactEmail)
            .enabled(true)
            .interrupted(false)
            .authToken(webhookAuthToken)
            .events(List.of(
                WebhookConfigSaveRequestWebhookEvent.PAYMENT_CONFIRMED,
                WebhookConfigSaveRequestWebhookEvent.PAYMENT_RECEIVED
            ))
            .sendType(WebhookConfigSaveRequestWebhookSendType.NON_SEQUENTIALLY)
            .build();

        return asaasSdk.webhook.createNewWebhook(request);
    }

    public WebhookConfigListResponseDto listWebhooks() {
        return asaasSdk.webhook.listWebhooks();
    }

    public WebhookConfigDeleteResponseDto deleteWebhook(String webhookId) {
        return asaasSdk.webhook.removeWebhook(webhookId);
    }

    public void handleEvent(AsaasPaymentEventDto event) {
        String eventType = event.getEvent();
        if (!"PAYMENT_CONFIRMED".equals(eventType) && !"PAYMENT_RECEIVED".equals(eventType)) return;

        AsaasPaymentEventDto.Payment payment = event.getPayment();

        // Idempotency guard: insert-first on payment_id PK. Any duplicate
        // (Asaas retry, CONFIRMED+RECEIVED pair, manual replay) hits the
        // unique constraint and is dropped before the payout fires.
        try {
            webhookEventRepository.saveAndFlush(new WebhookEvent(payment.getId(), eventType));
        } catch (DataIntegrityViolationException duplicate) {
            log.info("Duplicate webhook event ignored: paymentId={} eventType={}",
                    payment.getId(), eventType);
            return;
        }

        UUID listingId = UUID.fromString(payment.getExternalReference());

        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + listingId));

        // Verify the paid amount matches the listing price. Guards against an
        // attacker creating a cheap charge with a forged externalReference
        // pointing at a high-value listing, which would otherwise trigger a
        // payout for 95% of the listing price regardless of what was actually paid.
        BigDecimal paidAmount = payment.getValue() == null ? BigDecimal.ZERO : BigDecimal.valueOf(payment.getValue());
        if (paidAmount.compareTo(listing.getPriceAmount()) != 0) {
            log.error("Payment amount mismatch: listingId={} expected={} paid={} paymentId={} — refusing payout",
                    listingId, listing.getPriceAmount(), paidAmount, payment.getId());
            return;
        }

        listing.setStatus("SOLD");
        listingRepository.save(listing);

        userPayoutInfoRepository.findByUserId(listing.getSellerUserId()).ifPresent(payoutInfo -> {
            double sellerAmount = listing.getPriceAmount().doubleValue() * (1 - PLATFORM_COMMISSION);
            TransferSaveRequestDto transfer = buildTransfer(payoutInfo, sellerAmount, listingId, listing);
            transferService.createTransfer(transfer);
        });
    }

    private TransferSaveRequestDto buildTransfer(UserPayoutInfo payoutInfo, double amount, UUID listingId, Listing listing) {
        if ("PIX".equals(payoutInfo.getTransferType())) {
            return TransferSaveRequestDto.builder()
                .value(amount)
                .operationType(TransferSaveRequestTransferType.PIX)
                .pixAddressKey(payoutInfo.getPixKey())
                .pixAddressKeyType(TransferSaveRequestPixAddressKeyType.fromValue(payoutInfo.getPixKeyType()))
                .externalReference(listingId.toString())
                .build();
        }

        // TED — needs seller's personal details from AppUser
        AppUser seller = appUserRepository.findById(listing.getSellerUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        TransferBankSaveRequestDto bank = TransferBankSaveRequestDto.builder()
            .code(payoutInfo.getBankCode())
            .build();

        TransferBankAccountSaveRequestDto bankAccount = TransferBankAccountSaveRequestDto.builder()
            .bank(bank)
            .ownerName(seller.getFirstName() + " " + seller.getLastName())
            .cpfCnpj(seller.getPersonDoc())
            .agency(payoutInfo.getAgency())
            .account(payoutInfo.getAccount())
            .accountDigit(payoutInfo.getAccountDigit())
            .bankAccountType(TransferBankAccountSaveRequestBankAccountType.fromValue(payoutInfo.getBankAccountType()))
            .ispb(payoutInfo.getIspb())
            .build();

        return TransferSaveRequestDto.builder()
            .value(amount)
            .operationType(TransferSaveRequestTransferType.TED)
            .bankAccount(bankAccount)
            .externalReference(listingId.toString())
            .build();
    }
}
