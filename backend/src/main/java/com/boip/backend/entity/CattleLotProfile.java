package com.boip.backend.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

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

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "cattle_lot_profile")
public class CattleLotProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "lot_id", nullable = false)
    private UUID lotId;

    @Column(name = "profile_version", nullable = false)
    private Integer profileVersion;

    @Column(name = "breed", length = 80)
    private String breed;

    @Column(name = "sex", length = 8)
    private String sex;

    @Column(name = "purpose", length = 30)
    private String purpose;

    @Column(name = "avg_weight_kg", precision = 8, scale = 2)
    private BigDecimal avgWeightKg;

    @Column(name = "avg_age_months")
    private Integer avgAgeMonths;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(name = "description", length = 800)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
