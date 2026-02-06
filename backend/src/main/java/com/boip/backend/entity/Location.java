package com.boip.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "location")
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

    // getters/setters (mínimo necessário)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
}