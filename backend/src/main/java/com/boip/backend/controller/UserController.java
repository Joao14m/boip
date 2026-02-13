package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserSignupRequestDto;
import com.boip.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/users")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;    
    
    @PostMapping("/signup")
    public UserResponseDto signup(@Valid @RequestBody UserSignupRequestDto req){
        return userService.signup(req);
    }
    
}
