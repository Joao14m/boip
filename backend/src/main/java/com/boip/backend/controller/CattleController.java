package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.CattleLotCreateRequestDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.service.CattleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lots")
public class CattleController {
    private final CattleService cattleService;

    @PostMapping
    public CattleLotResponseDto createLot(@Valid @RequestBody CattleLotCreateRequestDto req) {
        return cattleService.createLot(req);
    }

    @GetMapping("/{id}")    
    public CattleLotResponseDto readLot(@PathVariable UUID id){
        return cattleService.check(id);
    }
    
}
