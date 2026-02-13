package com.boip.backend.service;

import java.time.OffsetDateTime;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserSignupRequestDto;
import com.boip.backend.entity.AppUser;
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

            return UserResponseDto.builder()
                .id(saved.getId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .docType(saved.getDocType())
                .hasCar(saved.isHasCar())
                .carNumber(saved.getCarNumber())
                .locationId(saved.getLocationId())
                .createdAt(now)
                .updatedAt(now)
                .build();
        } catch (DataIntegrityViolationException e) {
            // catches FK location_id not found, or unique constraints if race condition
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }
}
