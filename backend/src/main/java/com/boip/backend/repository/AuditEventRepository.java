package com.boip.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boip.backend.entity.AuditEvent;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {}
