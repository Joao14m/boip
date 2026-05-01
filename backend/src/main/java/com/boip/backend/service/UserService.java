package com.boip.backend.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.SellerPublicDto;
import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserUpdateRequestDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.Location;
import com.boip.backend.mapper.UserMapper;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.LocationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AppUserRepository usersRepository;
    private final LocationRepository locationRepository;
    private final AuditService auditService;

    public UserResponseDto readUser(UUID id, AppUser caller) {
         if (!caller.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        AppUser userEntity = usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserMapper.toDto(userEntity);
    }

    public SellerPublicDto readPublic(UUID id) {
        AppUser user = usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Location location = locationRepository.findById(user.getLocationId()).orElse(null);
        return UserMapper.toSellerPublicDto(user, location);
    }

    public UserResponseDto updateUser(UUID id, UserUpdateRequestDto req, AppUser caller) {
        if (!caller.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        AppUser existing = usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.getFirstName() != null && !req.getFirstName().trim().isEmpty()) existing.setFirstName(req.getFirstName().trim());
        if (req.getLastName() != null && !req.getLastName().trim().isEmpty()) existing.setLastName(req.getLastName().trim());
        if (req.getPhone() != null && !req.getPhone().trim().isEmpty()) existing.setPhone(req.getPhone().trim());
        if (req.getPersonDoc() != null && !req.getPersonDoc().trim().isEmpty()) {
            if (existing.getAsaasCustomerId() != null) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Document cannot be changed after a payment account has been created");
            }
            existing.setPersonDoc(req.getPersonDoc().trim());
        }
        if (req.getDocType() != null && !req.getDocType().trim().isEmpty()) {
            if (existing.getAsaasCustomerId() != null) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Document type cannot be changed after a payment account has been created");
            }
            existing.setDocType(req.getDocType().trim().toUpperCase());
        }
        if (req.getCarNumber() != null && !req.getCarNumber().trim().isEmpty()) existing.setCarNumber(req.getCarNumber().trim());
        if (req.getLocationId() != null) existing.setLocationId(req.getLocationId());

        try {
            AppUser saved = usersRepository.save(existing);
            return UserMapper.toDto(saved);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }

    public void deleteUser(UUID id, AppUser caller) {
        if (!caller.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        if (!usersRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id);
        }
        auditService.record(caller.getId(), "USER_DELETED", id, Map.of());
        usersRepository.deleteById(id);
    }
}
