package com.boip.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.UserPayoutInfoRequestDto;
import com.boip.backend.dto.UserPayoutInfoResponseDto;
import com.boip.backend.service.UserPayoutInfoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/{userId}/payout-info")
@RequiredArgsConstructor
public class UserPayoutInfoController {
    private final UserPayoutInfoService userPayoutInfoService;

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public UserPayoutInfoResponseDto upsert(@PathVariable UUID userId,
                                            @Valid @RequestBody UserPayoutInfoRequestDto dto) {
        return userPayoutInfoService.upsert(userId, dto);
    }

    @GetMapping
    public UserPayoutInfoResponseDto get(@PathVariable UUID userId) {
        return userPayoutInfoService.get(userId);
    }
}
