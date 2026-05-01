package com.boip.backend.entity;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "webhook_event")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WebhookEvent {

    @Id
    @Column(name = "payment_id", length = 100)
    private String paymentId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @CreationTimestamp
    @Column(name = "processed_at", nullable = false, updatable = false)
    private OffsetDateTime processedAt;

    public WebhookEvent(String paymentId, String eventType) {
        this.paymentId = paymentId;
        this.eventType = eventType;
    }
}
