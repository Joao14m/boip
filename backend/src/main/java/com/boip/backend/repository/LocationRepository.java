package com.boip.backend.repository;

import com.boip.backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {

    @Query(value = "select id from location order by created_at desc limit 1", nativeQuery = true)
    Optional<UUID> findAnyId();
}
