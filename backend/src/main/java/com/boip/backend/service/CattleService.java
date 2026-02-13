package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.UUID;

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
        
        if (lotCode.length() > 60 || lotCode.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Must be greater than 0 and less than or equal 60 digits");

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
            CattleLot saved = cattleRepository.save(cattleEntity);
            return toDto(saved);
        } catch (DataIntegrityViolationException e) {
            // catches FK location_id not found, or unique constraints if race condition
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }

    public CattleLotResponseDto check(UUID id){
            CattleLot cattleEntity = cattleRepository.findById(id)
            .orElseThrow((() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + id)));
            
            return toDto(cattleEntity);
    }

    private CattleLotResponseDto toDto(CattleLot cattleEntity){
        return CattleLotResponseDto.builder()
                .id(cattleEntity.getId())
                .ownerUserId(cattleEntity.getOwnerUserId())
                .lotCode(cattleEntity.getLotCode())
                .headCount(cattleEntity.getHeadCount())
                .locationId(cattleEntity.getLocationId())
                .createdAt(cattleEntity.getCreatedAt())
                .updatedAt(cattleEntity.getUpdatedAt())
                .build();
    }
}
