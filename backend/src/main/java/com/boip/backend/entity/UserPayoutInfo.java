package com.boip.backend.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "user_payout_info")
public class UserPayoutInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "transfer_type", nullable = false, length = 3)
    private String transferType; // PIX | TED

    // PIX fields
    @Column(name = "pix_key", length = 100)
    private String pixKey;

    @Column(name = "pix_key_type", length = 10)
    private String pixKeyType; // CPF | CNPJ | EMAIL | PHONE | EVP

    // TED fields
    @Column(name = "bank_code", length = 10)
    private String bankCode;

    @Column(name = "agency", length = 10)
    private String agency;

    @Column(name = "account", length = 20)
    private String account;

    @Column(name = "account_digit", length = 2)
    private String accountDigit;

    @Column(name = "bank_account_type", length = 20)
    private String bankAccountType; // CONTA_CORRENTE | CONTA_POUPANCA

    @Column(name = "ispb", length = 8)
    private String ispb;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
