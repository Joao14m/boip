package com.boip.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.CattleLot;

@Repository
public interface CattleLotRepository extends JpaRepository<CattleLot, UUID> {

    boolean existsByOwnerUserIdAndLotCode(UUID ownerUserId, String lotCode);

    Optional<CattleLot> findByOwnerUserIdAndLotCode(UUID ownerUserId, String lotCode);

    List<CattleLot> findAllByOwnerUserId(UUID ownerUserId);

    List<CattleLot> findAllByOwnerUserIdOrderByCreatedAtDesc(UUID ownerUserId);

    Page<CattleLot> findAllByLocationId(UUID locationId, Pageable pageable);

    Page<CattleLot> findAllByLocation_Uf(String uf, Pageable pageable);

    Page<CattleLot> findAllByLocation_Municipality(String municipality, Pageable pageable);
}
