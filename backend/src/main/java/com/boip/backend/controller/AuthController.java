package com.boip.backend.controller;

import com.boip.backend.auth.AuthUser;
import com.boip.backend.dto.AuthMeResponse;
import com.boip.backend.dto.AuthOnboardReq;
import com.boip.backend.dto.OnboardResponse;
import com.boip.backend.entity.AppUser;
import com.boip.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public AuthMeResponse me(Authentication authentication) {
        AuthIdentity id = resolve(authentication);
        var status = authService.meStatus(id.uid());
        return new AuthMeResponse(id.uid(), id.email(), id.emailVerified(), status.onboarded(), status.userId());
    }

    @PostMapping("/onboard")
    public OnboardResponse onboard(Authentication authentication,
                                   @Valid @RequestBody AuthOnboardReq req) {
        AuthIdentity id = resolve(authentication);
        AuthUser authUser = new AuthUser(id.uid(), id.email(), id.emailVerified(), java.util.Set.of());
        AppUser user = authService.onboard(authUser, req);
        return new OnboardResponse(user.getId(), id.uid(), id.email(), true);
    }

    // Extracts uid/email/emailVerified from either AppUser or AuthUser principal.
    private AuthIdentity resolve(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUser u) {
            return new AuthIdentity(u.getFirebaseUid(), u.getEmail(), true);
        }
        if (principal instanceof AuthUser u) {
            return new AuthIdentity(u.uid(), u.email(), u.emailVerified());
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
    }

    private record AuthIdentity(String uid, String email, boolean emailVerified) {}
}
