package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserSignupRequestDto;
import com.boip.backend.dto.UserUpdateRequestDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.mapper.UserMapper;
import com.boip.backend.repository.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AppUserRepository usersRepository;

    public UserResponseDto signup(UserSignupRequestDto req){
        String email = req.getEmail().trim();
        String docType = req.getDocType().trim();
        String personDoc = req.getPersonDoc().trim();
        String carNumber = req.getCarNumber() == null ? null : req.getCarNumber().trim();

        // business validation (same as DB checks, but better error messages)
        if (docType.equals("CPF") && personDoc.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF must have 11 digits");
        }
        if (docType.equals("CNPJ") && personDoc.length() != 14) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ must have 14 digits");
        }
        if (Boolean.TRUE.equals(req.getHasCar())) {
            if (carNumber == null || carNumber.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "carNumber is required when hasCar is true");
            }
        } else {
            // match your DB rule: has_car=false => car_number must be null
            carNumber = null;
        }
        // pre-checks (optional; still keep DB as source of truth)
        if (usersRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already exists");
        }
        if (usersRepository.existsByPersonDoc(personDoc)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "personDoc already exists");
        }

        OffsetDateTime now = OffsetDateTime.now();

        AppUser userEntity = AppUser.builder()
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .email(email)
            .phone(req.getPhone())
            .personDoc(personDoc)
            .docType(docType)
            .hasCar(req.getHasCar())
            .locationId(req.getLocationId())
            .createdAt(now)
            .updatedAt(now)
            .build();

        try {
            AppUser saved = usersRepository.saveAndFlush(userEntity);

            return UserMapper.toDto(saved);
        } catch (DataIntegrityViolationException e) {
            // catches FK location_id not found, or unique constraints if race condition
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }

    public UserResponseDto readUser(UUID id){
        AppUser userEntity = usersRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserMapper.toDto(userEntity);
    }

    public UserResponseDto updateUser(UUID id, UserUpdateRequestDto req){
        AppUser existing = usersRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (req.getFirstName() != null && !req.getFirstName().trim().isEmpty()) existing.setFirstName(req.getFirstName().trim());
        if (req.getLastName() != null && !req.getLastName().trim().isEmpty()) existing.setLastName(req.getLastName().trim());
        if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) existing.setEmail(req.getEmail().trim().toLowerCase());
        if (req.getPhone() != null && !req.getPhone().trim().isEmpty()) existing.setPhone(req.getPhone().trim());
        if (req.getPersonDoc() != null && !req.getPersonDoc().trim().isEmpty()) existing.setPersonDoc(req.getPersonDoc().trim());
        if (req.getDocType() != null && !req.getDocType().trim().isEmpty()) existing.setDocType(req.getDocType().trim().toUpperCase());
        if (req.getCarNumber() != null && !req.getCarNumber().trim().isEmpty()) existing.setCarNumber(req.getCarNumber().trim());
        if (req.getLocationId() != null) existing.setLocationId(req.getLocationId());

        try {
            AppUser saved = usersRepository.save(existing);
            return UserMapper.toDto(saved);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }

    public void deleteUser(UUID id){
        if (!usersRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id);
        }
        usersRepository.deleteById(id);
    }

}
