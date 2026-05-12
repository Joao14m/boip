package com.boip.backend.repository;

import java.util.Collection;
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

    @Query("""
        SELECT p FROM CattleLotProfile p
        WHERE p.lotId IN :lotIds
          AND p.profileVersion = (
            SELECT MAX(p2.profileVersion) FROM CattleLotProfile p2
            WHERE p2.lotId = p.lotId
          )
        """)
    List<CattleLotProfile> findLatestByLotIdIn(Collection<UUID> lotIds);
}
