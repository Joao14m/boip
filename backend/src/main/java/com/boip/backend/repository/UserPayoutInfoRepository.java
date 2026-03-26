package com.boip.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boip.backend.entity.UserPayoutInfo;

public interface UserPayoutInfoRepository extends JpaRepository<UserPayoutInfo, UUID> {
    Optional<UserPayoutInfo> findByUserId(UUID userId);
}
