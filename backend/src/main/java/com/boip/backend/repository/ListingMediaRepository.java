package com.boip.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.ListingMedia;

@Repository
public interface ListingMediaRepository extends JpaRepository<ListingMedia, UUID> {

    List<ListingMedia> findAllByListingId(UUID listingId);

    List<ListingMedia> findAllByListingIdIn(Collection<UUID> listingIds);

    boolean existsByListingIdAndMediaSlot(UUID listingId, Integer mediaSlot);
}
