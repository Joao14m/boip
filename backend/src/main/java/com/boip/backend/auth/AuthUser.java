package com.boip.backend.auth;

import java.util.Set;

public record AuthUser(
        String uid,
        String email,
        boolean emailVerified,
        Set<String> roles
) {}
