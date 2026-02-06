package com.boip.backend.dto;

import java.util.UUID;

public record AuthMeResponse(
        String uid,
        String email,
        boolean emailVerified,
        boolean onboarded,
        UUID userId
) {}
