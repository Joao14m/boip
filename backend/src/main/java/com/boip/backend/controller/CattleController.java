package com.boip.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.boip.backend.dto.CattleLotCreateRequestDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.dto.CattleLotUpdateRequestDto;
import com.boip.backend.service.CattleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lots")
public class CattleController {
    private final CattleService cattleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CattleLotResponseDto createLot(@Valid @RequestBody CattleLotCreateRequestDto req) {
        return cattleService.createLot(req);
    }

    @GetMapping("/{id}")    
    public CattleLotResponseDto readLot(@PathVariable UUID id){
        return cattleService.check(id);
    }

    // Needs to add page and size for pagination\
    @GetMapping
    public List<CattleLotResponseDto> filterLot(@RequestParam(required = false) UUID locationId, @RequestParam(required = false) String uf, 
                                                @RequestParam(required = false) String municipality, @RequestParam(required = false)  String sort,
                                                @RequestParam(required = false) String direction) {
        return cattleService.filter(locationId, uf, municipality, sort, direction);
    }

    @PatchMapping("/{id}")
    public CattleLotResponseDto updateCattleLot(@PathVariable UUID id, @Valid @RequestBody CattleLotUpdateRequestDto req) {        
        return cattleService.updateLot(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLot(@PathVariable UUID id){
        cattleService.deleteLot(id);
    }

}
