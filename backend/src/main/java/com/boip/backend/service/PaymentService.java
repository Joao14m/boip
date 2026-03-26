package com.boip.backend.service;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.asaas.apisdk.AsaasSdk;
import com.asaas.apisdk.models.CustomerSaveRequestDto;
import com.asaas.apisdk.models.PaymentBillingInfoResponseDto;
import com.asaas.apisdk.models.PaymentGetResponseDto;
import com.asaas.apisdk.models.PaymentSaveRequestBillingType;
import com.asaas.apisdk.models.PaymentSaveRequestDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.Listing;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.ListingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final AsaasSdk asaasSdk;
    private final ListingRepository listingRepository;
    private final AppUserRepository appUserRepository;

    public PaymentGetResponseDto createCharge(UUID listingId, AppUser buyer){
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + listingId));

        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Listing is not active");
        }

        try {
            if (buyer.getAsaasCustomerId() == null) {
                CustomerSaveRequestDto customerRequest = CustomerSaveRequestDto.builder()
                    .name(buyer.getFirstName() + " " + buyer.getLastName())
                    .email(buyer.getEmail())
                    .mobilePhone(buyer.getPhone())
                    .cpfCnpj(buyer.getPersonDoc())
                    .build();

                log.info("Creating Asaas customer: name={}, email={}, phone={}, cpfCnpj={}",
                    customerRequest.getName(), customerRequest.getEmail(),
                    customerRequest.getMobilePhone(), customerRequest.getCpfCnpj());

                String asaasId = asaasSdk.customer.createNewCustomer(customerRequest).getId();
                buyer.setAsaasCustomerId(asaasId);
                appUserRepository.save(buyer);
            }

            PaymentSaveRequestDto request = PaymentSaveRequestDto.builder()
                .customer(buyer.getAsaasCustomerId())
                .billingType(PaymentSaveRequestBillingType.PIX)
                .value(listing.getPriceAmount().doubleValue())
                .dueDate(LocalDate.now().plusDays(3).toString())
                .externalReference(listingId.toString())
                .build();

            log.info("Creating Asaas payment: customer={}, value={}, dueDate={}, externalRef={}",
                request.getCustomer(), request.getValue(), request.getDueDate(), request.getExternalReference());

            return asaasSdk.payment.createNewPayment(request);
        } catch (com.asaas.apisdk.exceptions.ErrorResponseDtoException e) {
            var errors = e.getError().getErrors();
            if (errors != null) {
                for (var item : errors) {
                    log.error("Asaas error: code={}, description={}", item.getCode(), item.getDescription());
                }
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payment provider error: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Asaas API failed: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payment provider error: " + e.getMessage(), e);
        }
    }

    public PaymentBillingInfoResponseDto retrieveBilling(String chargeId){
        return asaasSdk.payment.retrievePaymentBillingInformation(chargeId);
    }
}
