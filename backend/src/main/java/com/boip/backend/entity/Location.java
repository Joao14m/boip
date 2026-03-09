package com.boip.backend.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "location")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "municipality", nullable = false, length = 120)
    private String municipality;

    @Column(name = "uf", nullable = false, length = 2)
    private String uf;

    @Column(name = "ibge_code", nullable = false, length = 7, unique = true)
    private String ibgeCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
