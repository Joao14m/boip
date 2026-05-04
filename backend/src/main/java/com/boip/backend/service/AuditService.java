package com.boip.backend.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.boip.backend.entity.AuditEvent;
import com.boip.backend.repository.AuditEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository repository;
    private final ObjectMapper objectMapper;

    public void record(UUID actorId, String action, UUID targetId, Map<String, Object> payload) {
        try {
            String json = (payload == null || payload.isEmpty())
                    ? null
                    : objectMapper.writeValueAsString(payload);

            repository.save(AuditEvent.builder()
                    .actorId(actorId)
                    .action(action)
                    .targetId(targetId)
                    .payloadJson(json)
                    .build());
        } catch (JsonProcessingException | RuntimeException e) {
            // Audit failure must never break the main operation.
            log.warn("Failed to write audit event: action={} target={} error={}", action, targetId, e.getMessage());
        }
    }
}
