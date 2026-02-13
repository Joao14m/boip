package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.CattleLotCreateRequestDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.service.CattleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequiredArgsConstructor
public class CattleController {
    private final CattleService cattleService;

    @PostMapping("/lots")
    public CattleLotResponseDto createLot(@Valid @RequestBody CattleLotCreateRequestDto req) {
        return cattleService.createLot(req);
    }
    
}
