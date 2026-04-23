package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.SellerPublicDto;
import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserUpdateRequestDto;
import com.boip.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

import static com.boip.backend.auth.SecurityUtils.requireAppUser;


@Validated
@RequestMapping("/api/users")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public UserResponseDto readUser(@PathVariable UUID id) {
        return userService.readUser(id, requireAppUser());
    }

    @GetMapping("/{id}/public")
    public SellerPublicDto readPublic(@PathVariable UUID id) {
        return userService.readPublic(id);
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
}
