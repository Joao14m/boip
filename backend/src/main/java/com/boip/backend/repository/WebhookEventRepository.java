package com.boip.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boip.backend.entity.WebhookEvent;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, String> {
}
