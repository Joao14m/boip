package com.boip.backend.service;

import com.boip.backend.auth.AuthUser;
import com.boip.backend.dto.AuthOnboardReq;
import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.boip.backend.repository.LocationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

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
        AppUser user = userRepository.findByFirebaseUid(me.uid()).orElseGet(AppUser::new);

        user.setFirebaseUid(me.uid());
        user.setEmail(me.email());

        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPhone(req.phone());
        user.setPersonDoc(req.personDoc());
        user.setDocType(req.docType());
        user.setHasCar(req.hasCar());
        user.setCarNumber(req.carNumber());
        user.setLocationId(req.locationId());

        return userRepository.save(user);
    }

    public UUID anyLocationIdOrThrow() {
        return locationRepository.findAnyId()
                .orElseThrow(() -> new IllegalStateException("no locations found"));
    }

}
