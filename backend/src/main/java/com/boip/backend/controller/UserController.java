package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.dto.CattleLotUpdateRequestDto;
import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserSignupRequestDto;
import com.boip.backend.dto.UserUpdateRequestDto;
import com.boip.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;


@RequestMapping("/api/users")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;    
    
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto signup(@Valid @RequestBody UserSignupRequestDto req){
        return userService.signup(req);
    }

    @GetMapping("/{id}")
    public UserResponseDto readUser(@PathVariable UUID id) {
        return userService.readUser(id);
    }
    
    @PatchMapping("/{id}")
    public UserResponseDto updateUser(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequestDto req) {        
        return userService.updateUser(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id){
        userService.deleteUser(id);
    }
    
}
