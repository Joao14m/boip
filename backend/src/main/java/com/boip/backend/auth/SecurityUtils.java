package com.boip.backend.auth;

import com.boip.backend.entity.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static AppUser requireAppUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }
        if (auth.getPrincipal() instanceof AppUser u) return u;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Complete signup first");
    }

    // Returns the onboarded AppUser when one is authenticated, or null otherwise.
    // Use on public endpoints (e.g. the marketplace feed) that may personalize for
    // a signed-in caller but must still work for anonymous visitors.
    public static AppUser currentAppUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AppUser u) return u;
        return null;
    }
}
