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
import lombok.*;

@Getter @Setter 
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "app_user")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
    private String firebaseUid;

    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 120)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "person_doc", nullable = false, length = 14, unique = true)
    private String personDoc;

    @Column(name = "doc_type", nullable = false, length = 4)
    private String docType; // CPF | CNPJ

    @Column(name = "has_car", nullable = false)
    private Boolean hasCar;

    @Column(name = "car_number", length = 30)
    private String carNumber;

    @Column(name = "location_id", nullable = false, columnDefinition = "uuid")
    private UUID locationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // resolve created_at/updated_at null no INSERT
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
