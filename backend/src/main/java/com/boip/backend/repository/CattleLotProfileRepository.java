package com.boip.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.CattleLotProfile;

@Repository
public interface CattleLotProfileRepository extends JpaRepository<CattleLotProfile, UUID> {

    List<CattleLotProfile> findAllByLotIdOrderByProfileVersionDesc(UUID lotId);

    Optional<CattleLotProfile> findTopByLotIdOrderByProfileVersionDesc(UUID lotId);

    @Query("SELECT COALESCE(MAX(p.profileVersion), 0) FROM CattleLotProfile p WHERE p.lotId = :lotId")
    Integer findMaxProfileVersionByLotId(UUID lotId);
}
