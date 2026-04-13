package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.CattleLotCreateRequestDto;
import com.boip.backend.dto.CattleLotProfileRequestDto;
import com.boip.backend.dto.CattleLotProfileResponseDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.dto.CattleLotUpdateRequestDto;
import com.boip.backend.dto.PageResponseDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.CattleLot;
import com.boip.backend.entity.CattleLotProfile;
import com.boip.backend.mapper.CattleMapper;
import com.boip.backend.repository.CattleLotProfileRepository;
import com.boip.backend.repository.CattleLotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CattleService {

    private static final Set<String> VALID_SEX = Set.of("M", "F", "MIXED");
    private static final Set<String> VALID_PURPOSE = Set.of("BEEF", "DAIRY", "BREEDING", "MIXED");

    private final CattleLotRepository cattleRepository;
    private final CattleLotProfileRepository profileRepository;

    public CattleLotResponseDto createLot(CattleLotCreateRequestDto req) {
        String lotCode = req.getLotCode().trim();

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
            return CattleMapper.toDto(saved, null);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }

    public CattleLotResponseDto check(UUID id) {
        CattleLot lot = cattleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + id));

        CattleLotProfileResponseDto profile = profileRepository
                .findTopByLotIdOrderByProfileVersionDesc(id)
                .map(CattleMapper::profileToDto)
                .orElse(null);

        return CattleMapper.toDto(lot, profile);
    }

    public void deleteLot(UUID id, AppUser caller) {
        CattleLot lot = cattleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + id));
        if (!caller.getId().equals(lot.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your lot");
        }
        cattleRepository.deleteById(id);
    }

    public CattleLotResponseDto updateLot(UUID id, CattleLotUpdateRequestDto req, AppUser caller) {
        CattleLot existing = cattleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found"));
        if (!caller.getId().equals(existing.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your lot");
        }

        if (req.getLotCode() != null) existing.setLotCode(req.getLotCode().trim());
        if (req.getHeadCount() != null) existing.setHeadCount(req.getHeadCount());
        if (req.getLocationId() != null) existing.setLocationId(req.getLocationId());

        CattleLot saved = cattleRepository.save(existing);

        CattleLotProfileResponseDto profile = profileRepository
                .findTopByLotIdOrderByProfileVersionDesc(id)
                .map(CattleMapper::profileToDto)
                .orElse(null);

        return CattleMapper.toDto(saved, profile);
    }

    public PageResponseDto<CattleLotResponseDto> filter(UUID locationId, String uf, String municipality,
                                                         String sort, String direction, int page, int size) {
        String ufT = (uf != null && !uf.isBlank()) ? uf.trim().toUpperCase() : null;
        String municip = (municipality != null && !municipality.isBlank()) ? municipality.trim() : null;
        String effectiveSort = (sort != null && !sort.isBlank()) ? sort.trim() : "createdAt";
        String effectiveDir = (direction != null && !direction.isBlank()) ? direction.trim().toLowerCase() : "desc";

        if (!"createdAt".equals(effectiveSort)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sort field: " + effectiveSort);
        }
        if (!effectiveDir.equals("asc") && !effectiveDir.equals("desc")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid direction: " + effectiveDir);
        }

        Sort.Direction dir = "asc".equalsIgnoreCase(effectiveDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        var pageable = PageRequest.of(page, size, Sort.by(dir, effectiveSort));

        org.springframework.data.domain.Page<CattleLot> pageResult;

        if (locationId == null && ufT == null && municip == null) {
            pageResult = cattleRepository.findAll(pageable);
        } else if (locationId != null && ufT == null && municip == null) {
            pageResult = cattleRepository.findAllByLocationId(locationId, pageable);
        } else if (locationId == null && ufT != null && municip == null) {
            pageResult = cattleRepository.findAllByLocation_Uf(ufT, pageable);
        } else if (locationId == null && ufT == null && municip != null) {
            pageResult = cattleRepository.findAllByLocation_Municipality(municip, pageable);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported filter combination (for now)");
        }

        return PageResponseDto.of(pageResult.map(lot -> {
            CattleLotProfileResponseDto profile = profileRepository
                    .findTopByLotIdOrderByProfileVersionDesc(lot.getId())
                    .map(CattleMapper::profileToDto)
                    .orElse(null);
            return CattleMapper.toDto(lot, profile);
        }));
    }

    public CattleLotProfileResponseDto createProfile(UUID lotId, CattleLotProfileRequestDto req, AppUser caller) {
        CattleLot lot = cattleRepository.findById(lotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + lotId));
        if (!caller.getId().equals(lot.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your lot");
        }

        int nextVersion = profileRepository.findMaxProfileVersionByLotId(lotId) + 1;

        CattleLotProfile profile = CattleLotProfile.builder()
                .lotId(lotId)
                .profileVersion(nextVersion)
                .breed(req.getBreed())
                .sex(req.getSex() != null ? req.getSex().toUpperCase() : null)
                .purpose(req.getPurpose() != null ? req.getPurpose().toUpperCase() : null)
                .avgWeightKg(req.getAvgWeightKg())
                .avgAgeMonths(req.getAvgAgeMonths())
                .birthYear(req.getBirthYear())
                .description(req.getDescription())
                .build();

        CattleLotProfile saved = profileRepository.save(profile);
        return CattleMapper.profileToDto(saved);
    }

    public CattleLotProfileResponseDto getCurrentProfile(UUID lotId) {
        if (!cattleRepository.existsById(lotId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + lotId);

        return profileRepository.findTopByLotIdOrderByProfileVersionDesc(lotId)
                .map(CattleMapper::profileToDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No profile found for lot: " + lotId));
    }

    public List<CattleLotProfileResponseDto> getProfileHistory(UUID lotId) {
        if (!cattleRepository.existsById(lotId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + lotId);

        return profileRepository.findAllByLotIdOrderByProfileVersionDesc(lotId)
                .stream()
                .map(CattleMapper::profileToDto)
                .toList();
    }
}
