package com.boip.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.CattleLot;

@Repository
public interface CattleLotRepository extends JpaRepository<CattleLot, UUID>{
    boolean existsByOwnerUserIdAndLotCode(UUID ownerUserId, String lotCode);

    Optional<CattleLot> findByOwnerUserIdAndLotCode(UUID ownerUserId, String lotCode);

    List<CattleLot> findAllByOwnerUserId(UUID ownerUserId);

    List<CattleLot> findAllByOwnerUserIdOrderByCreatedAtDesc(UUID ownerUserId);

    List<CattleLot> findAllByLocationId(UUID locationId);
}
