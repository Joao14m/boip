package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.auth.AuthUser;
import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserSignupRequestDto;
import com.boip.backend.dto.UserUpdateRequestDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;


@Validated
@RequestMapping("/api/users")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto signup(@Valid @RequestBody UserSignupRequestDto req) {
        return userService.signup(requireFirebaseUid(), req);
    }

    @GetMapping("/{id}")
    public UserResponseDto readUser(@PathVariable UUID id) {
        return userService.readUser(id);
    }

    @PatchMapping("/{id}")
    public UserResponseDto updateUser(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequestDto req) {
        return userService.updateUser(id, req, requireAppUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id, requireAppUser());
    }

    private String requireFirebaseUid() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof AppUser u) return u.getFirebaseUid();
        if (principal instanceof AuthUser u) return u.uid();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firebase token required");
    }

    private AppUser requireAppUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof AppUser u) return u;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Complete signup first");
    }
}
