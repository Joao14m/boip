package com.boip.backend.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Getter @Setter 
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "app_user")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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
    private boolean hasCar;

    @Column(name = "car_number", length = 30)
    private String carNumber;

    // store UUID directly, no Location entity needed right now
    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
