package com.boip.backend.service;

import java.time.OffsetDateTime;

import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.UserResponseDto;
import com.boip.backend.dto.UserSignupRequestDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;

import lombok.Builder;
import lombok.RequiredArgsConstructor;

@Service
@Builder
@RequiredArgsConstructor
public class UserService {
    private final AppUserRepository users;

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
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already exists");
        }
        if (users.existsByPersonDoc(personDoc)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "personDoc already exists");
        }

        AppUser u = new AppUser();
        u.setFirstName(req.getFirstName().trim());
        u.setLastName(req.getLastName().trim());
        u.setEmail(email);
        u.setPhone(req.getPhone().trim());
        u.setDocType(docType);
        u.setPersonDoc(personDoc);
        u.setHasCar(req.getHasCar());
        u.setCarNumber(carNumber);
        u.setLocationId(req.getLocationId());

        // DB has defaults, but JPA will send null unless we set them.
        // Setting them here keeps response consistent.
        OffsetDateTime now = OffsetDateTime.now();
        u.setCreatedAt(now);
        u.setUpdatedAt(now);
        
        users.save(u);

        try {
            return UserResponseDto.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .docType(u.getDocType())
                .hasCar(u.isHasCar())
                .carNumber(u.getCarNumber())
                .locationId(u.getLocationId())
                .createdAt(now)
                .updatedAt(now)
                .build();
        } catch (DataIntegrityViolationException e) {
            // catches FK location_id not found, or unique constraints if race condition
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid data (check locationId / uniqueness)", e);
        }
    }
}
