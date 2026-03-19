package com.boip.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class AsaasPaymentEventDto {
    private String event;
    private Payment payment;

    @Getter @Setter @NoArgsConstructor
    public static class Payment {
        private String id;
        private String externalReference;
        private Double value;
        private String status;
    }
}
