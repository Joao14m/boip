package com.boip.backend.dto;

import java.util.UUID;

public record OnboardResponse(
        UUID userId,
        String uid,
        String email,
        boolean onboarded
) {}
