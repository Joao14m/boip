package com.boip.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.boip.backend.entity.Location;

public interface LocationRepository extends JpaRepository<Location, UUID> {
    boolean existsByIbgeCode(String ibgeCode);

    @Query("SELECT l.id FROM Location l ORDER BY l.createdAt ASC LIMIT 1")
    Optional<UUID> findAnyId();
}
