package com.boip.backend.service;

import com.boip.backend.auth.AuthUser;
import com.boip.backend.dto.AuthOnboardReq;
import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.LocationRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final LocationRepository locationRepository;

    public AuthService(AppUserRepository userRepository, LocationRepository locationRepository) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional
    public AppUser onboard(AuthUser me, AuthOnboardReq req) {
        // Auth sanity (não é responsabilidade do DTO)
        if (me == null || me.uid() == null || me.uid().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }

        // Email pode vir null dependendo do provider/config; se você EXIGE email, trate aqui:
        if (me.email() == null || me.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "missing_email");
        }

        // Regra/consistência: locationId precisa existir
        // (req.locationId já foi validado como NOT NULL no DTO)
        if (!locationRepository.existsById(req.locationId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid_locationId");
        }

        // Upsert por firebaseUid
        AppUser user = userRepository.findByFirebaseUid(me.uid()).orElseGet(AppUser::new);

        user.setFirebaseUid(me.uid());
        user.setEmail(me.email());

        // Campos do onboard (validados no DTO)
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPhone(req.phone());
        user.setPersonDoc(req.personDoc());
        user.setDocType(req.docType());
        user.setHasCar(req.hasCar());

        // Consistência: se hasCar=false, zera carNumber
        user.setCarNumber(Boolean.TRUE.equals(req.hasCar()) ? req.carNumber() : null);

        user.setLocationId(req.locationId());

        return userRepository.save(user);
    }

    public UUID anyLocationIdOrThrow() {
        return locationRepository.findAnyId()
                .orElseThrow(() -> new IllegalStateException("no locations found"));
    }

    public record MeStatus(boolean onboarded, UUID userId) {}

    public MeStatus meStatus(String firebaseUid) {
        if (firebaseUid == null || firebaseUid.isBlank()) {
            return new MeStatus(false, null);
        }

        return userRepository.findByFirebaseUid(firebaseUid)
                .map(u -> new MeStatus(true, u.getId()))
                .orElseGet(() -> new MeStatus(false, null));
    }
}
