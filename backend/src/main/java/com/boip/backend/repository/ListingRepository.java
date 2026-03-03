package com.boip.backend.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.Listing;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    Page<Listing> findAllBySellerUserId(UUID sellerUserId, Pageable pageable);

    Page<Listing> findAllByLotId(UUID lotId, Pageable pageable);

    Page<Listing> findAllByStatus(String status, Pageable pageable);
}
