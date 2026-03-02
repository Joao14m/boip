package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.CattleLotCreateRequestDto;
import com.boip.backend.dto.CattleLotProfileRequestDto;
import com.boip.backend.dto.CattleLotProfileResponseDto;
import com.boip.backend.dto.CattleLotResponseDto;
import com.boip.backend.dto.CattleLotUpdateRequestDto;
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

    // ── Lot CRUD ─────────────────────────────────────────────────────────────

    public CattleLotResponseDto createLot(CattleLotCreateRequestDto req) {
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
            return CattleMapper.toDto(saved, null);
        } catch (DataIntegrityViolationException e) {
            // catches FK location_id not found, or unique constraints if race condition
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

    public void deleteLot(UUID id) {
        if (!cattleRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + id);
        cattleRepository.deleteById(id);
    }

    public CattleLotResponseDto updateLot(UUID id, CattleLotUpdateRequestDto req) {
        CattleLot existing = cattleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found"));

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

    public List<CattleLotResponseDto> filter(UUID locationId, String uf, String municipality, String sort, String direction) {
        String ufT = null;
        String municip = null;

        // If not sort or direction, provide these
        String effectiveSort = "createdAt";
        String effectiveDir = "desc";

        if (uf != null && !uf.isBlank()) {
            ufT = uf.trim().toUpperCase();
        }
        if (municipality != null && !municipality.isBlank()) {
            municip = municipality.trim();
        }
        if (sort != null && !sort.isBlank()) {
            effectiveSort = sort.trim();
        }
        if (direction != null && !direction.isBlank()) {
            effectiveDir = direction.trim().toLowerCase();
        }

        if (!"createdAt".equals(effectiveSort)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sort field: " + effectiveSort);
        }

        if (!effectiveDir.equals("asc") && !effectiveDir.equals("desc")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid direction: " + effectiveDir);
        }

        List<CattleLot> res;

        // Only allows sorting by "createdAt" for MVP safety
        Sort.Direction dir = "asc".equalsIgnoreCase(effectiveDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Sort sortObj = Sort.by(dir, effectiveSort);

        if (locationId == null && ufT == null && municip == null) {
            res = cattleRepository.findAll(sortObj);
        } else if (locationId != null && ufT == null && municip == null) {
            res = cattleRepository.findAllByLocationId(locationId, sortObj);
        } else if (locationId == null && ufT != null && municip == null) {
            res = cattleRepository.findAllByLocation_Uf(ufT, sortObj);
        } else if (locationId == null && ufT == null && municip != null) {
            res = cattleRepository.findAllByLocation_Municipality(municip, sortObj);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported filter combination (for now)");
        }

        return res.stream().map(lot -> {
            CattleLotProfileResponseDto profile = profileRepository
                    .findTopByLotIdOrderByProfileVersionDesc(lot.getId())
                    .map(CattleMapper::profileToDto)
                    .orElse(null);
            return CattleMapper.toDto(lot, profile);
        }).toList();
    }

    // ── Profile methods ───────────────────────────────────────────────────────

    public CattleLotProfileResponseDto createProfile(UUID lotId, CattleLotProfileRequestDto req) {
        if (!cattleRepository.existsById(lotId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CattleLot not found with id: " + lotId);

        if (req.getSex() != null && !VALID_SEX.contains(req.getSex().toUpperCase()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid sex value. Allowed: " + VALID_SEX);

        if (req.getPurpose() != null && !VALID_PURPOSE.contains(req.getPurpose().toUpperCase()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid purpose value. Allowed: " + VALID_PURPOSE);

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
