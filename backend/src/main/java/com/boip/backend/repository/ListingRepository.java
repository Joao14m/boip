package com.boip.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.Listing;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    List<Listing> findAllBySellerUserId(UUID sellerUserId);

    List<Listing> findAllByLotId(UUID lotId);

    List<Listing> findAllByStatus(String status, Sort sort);
}
