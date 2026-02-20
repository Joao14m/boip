package com.boip.backend.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "location")
@Getter @Setter @NoArgsConstructor
public class Location {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 120)
    private String municipality;

    @Column(nullable = false, length = 2)
    private String uf;

    @Column(name = "ibge_code", nullable = false, length = 7)
    private String ibgeCode;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
