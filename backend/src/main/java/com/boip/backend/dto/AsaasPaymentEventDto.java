package com.boip.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AsaasPaymentEventDto {
    private String event;
    private Payment payment;

    @Getter @Setter @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Payment {
        private String id;
        private String externalReference;
        private Double value;
        private String status;
    }
}
