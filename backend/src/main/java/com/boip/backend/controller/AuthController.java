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
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser u)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }
        var status = authService.meStatus(u.uid());
        return new AuthMeResponse(u.uid(), u.email(), u.emailVerified(), status.onboarded(), status.userId());
    }

    @PostMapping("/onboard")
    public OnboardResponse onboard(Authentication authentication,
                                   @Valid @RequestBody AuthOnboardReq req) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser u)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }

        AppUser user = authService.onboard(u, req);
        return new OnboardResponse(user.getId(), u.uid(), u.email(), true);
    }
}
