package com.boip.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.UserPayoutInfoRequestDto;
import com.boip.backend.dto.UserPayoutInfoResponseDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.service.UserPayoutInfoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Validated
@RestController
@RequestMapping("/api/users/{userId}/payout-info")
@RequiredArgsConstructor
public class UserPayoutInfoController {
    private final UserPayoutInfoService userPayoutInfoService;

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public UserPayoutInfoResponseDto upsert(@PathVariable UUID userId, @Valid @RequestBody UserPayoutInfoRequestDto dto) {
        AppUser caller = requireAppUser();
        if (!caller.getId().equals(userId)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        return userPayoutInfoService.upsert(userId, dto);
    }

    @GetMapping
    public UserPayoutInfoResponseDto get(@PathVariable UUID userId) {
        AppUser caller = requireAppUser();
        if (!caller.getId().equals(userId)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        return userPayoutInfoService.get(userId);
    }

    private AppUser requireAppUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }
        if (auth.getPrincipal() instanceof AppUser u) return u;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Complete signup first");
    }
}
