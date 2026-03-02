package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.LocationRequestDto;
import com.boip.backend.dto.LocationResponseDto;
import com.boip.backend.entity.Location;
import com.boip.backend.mapper.LocationMapper;
import com.boip.backend.repository.LocationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocationService {
    private final LocationRepository locationRepository;

    public List<LocationResponseDto> findAll() {
        return locationRepository.findAll().stream()
                .map(LocationMapper::toDto)
                .toList();
    }

    public LocationResponseDto findById(UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
        return LocationMapper.toDto(location);
    }

    public LocationResponseDto create(LocationRequestDto dto) {
        if (locationRepository.existsByIbgeCode(dto.getIbgeCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "ibgeCode already exists");
        }

        Location location = Location.builder()
                .municipality(dto.getMunicipality())
                .uf(dto.getUf())
                .ibgeCode(dto.getIbgeCode())
                .createdAt(OffsetDateTime.now())
                .build();

        Location saved = locationRepository.saveAndFlush(location);
        return LocationMapper.toDto(saved);
    }

}
