package com.boip.backend.service;

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
import com.asaas.apisdk.models.WebhookConfigGetResponseDto;
import com.asaas.apisdk.models.WebhookConfigSaveRequestDto;
import com.asaas.apisdk.models.WebhookConfigSaveRequestWebhookEvent;
import com.asaas.apisdk.models.WebhookConfigSaveRequestWebhookSendType;
import com.boip.backend.dto.AsaasPaymentEventDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.Listing;
import com.boip.backend.entity.UserPayoutInfo;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.ListingRepository;
import com.boip.backend.repository.UserPayoutInfoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebhooksService {
    private static final double PLATFORM_COMMISSION = 0.05;

    private final AsaasSdk asaasSdk;
    private final ListingRepository listingRepository;
    private final AppUserRepository appUserRepository;
    private final UserPayoutInfoRepository userPayoutInfoRepository;
    private final TransferService transferService;

    @Value("${app.webhook-url}")
    private String webhookUrl;

    public WebhookConfigGetResponseDto registerWebhook() {
        WebhookConfigSaveRequestDto request = WebhookConfigSaveRequestDto.builder()
            .name("Agregis Payments")
            .url(webhookUrl)
            .enabled(true)
            .apiVersion(3L)
            .events(List.of(WebhookConfigSaveRequestWebhookEvent.PAYMENT_CONFIRMED))
            .sendType(WebhookConfigSaveRequestWebhookSendType.NON_SEQUENTIALLY)
            .build();

        return asaasSdk.webhook.createNewWebhook(request);
    }

    public void handleEvent(AsaasPaymentEventDto event) {
        if (!"PAYMENT_CONFIRMED".equals(event.getEvent())) return;

        AsaasPaymentEventDto.Payment payment = event.getPayment();
        UUID listingId = UUID.fromString(payment.getExternalReference());

        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + listingId));

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
