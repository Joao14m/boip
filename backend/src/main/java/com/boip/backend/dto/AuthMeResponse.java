package com.boip.backend.dto;

public record AuthMeResponse(
        String uid,
        String email,
        boolean emailVerified
) {}
