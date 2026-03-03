package com.boip.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.boip.backend.entity.Location;

public interface LocationRepository extends JpaRepository<Location, UUID> {
    boolean existsByIbgeCode(String ibgeCode);
}
