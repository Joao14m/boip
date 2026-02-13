package com.boip.backend.service;

import java.time.OffsetDateTime;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.CattleLotCreateRequestDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.entity.CattleLot;
import com.boip.backend.repository.CattleLotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CattleService {
    private final CattleLotRepository cattleRepository;

    public CattleLotResponseDto createLot(CattleLotCreateRequestDto req){
        String lotCode = req.getLotCode().trim();
        Integer headCount = req.getHeadCount();
        
        if (lotCode.length() > 60)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Must be less than or equal 60 digits");

        if (headCount == null || headCount <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Must be at greater than 0");

        if (cattleRepository.existsByOwnerUserIdAndLotCode(req.getOwnerUserId(), lotCode))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lot Code already exists");
        
        OffsetDateTime now = OffsetDateTime.now();

        CattleLot cattleEntity = CattleLot.builder()
            .ownerUserId(req.getOwnerUserId())
            .lotCode(lotCode)
            .headCount(req.getHeadCount())
            .locationId(req.getLocationId())
            .createdAt(now)
            .updatedAt(now)
            .build();

        try {
            CattleLot saved = cattleRepository.saveAndFlush(cattleEntity);

            return CattleLotResponseDto.builder()
                .id(saved.getId())
                .ownerUserId(saved.getOwnerUserId())
                .lotCode(saved.getLotCode())
                .headCount(saved.getHeadCount())
                .locationId(saved.getLocationId())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
        } catch (DataIntegrityViolationException e) {
            // catches FK location_id not found, or unique constraints if race condition
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }

    }





}
