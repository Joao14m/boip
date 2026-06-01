package com.boip.backend.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.Listing;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    Page<Listing> findAllBySellerUserId(UUID sellerUserId, Pageable pageable);

    Page<Listing> findAllByLotId(UUID lotId, Pageable pageable);

    Page<Listing> findAllByStatus(String status, Pageable pageable);

    // Marketplace feed ordered by distance from the buyer's origin (lat/lng, in
    // degrees) using the Haversine great-circle formula. A listing's target point
    // is its lot's precise pin when set, else its municipality center (COALESCE).
    // Listings with no coordinates at all sort last. Tie-break: newest first.
    // ORDER BY lives in the query, so pass only page/size in the Pageable.
    @Query(value = """
            SELECT l.* FROM listing l
            JOIN cattle_lot cl ON cl.id = l.lot_id
            JOIN location  loc ON loc.id = cl.location_id
            WHERE l.status = :status
            ORDER BY
              CASE WHEN COALESCE(cl.latitude, loc.latitude) IS NULL
                     OR COALESCE(cl.longitude, loc.longitude) IS NULL THEN 1 ELSE 0 END,
              6371 * acos(LEAST(1, GREATEST(-1,
                cos(radians(:lat)) * cos(radians(COALESCE(cl.latitude, loc.latitude))) *
                cos(radians(COALESCE(cl.longitude, loc.longitude)) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(COALESCE(cl.latitude, loc.latitude)))
              ))) ASC,
              l.created_at DESC
            """,
            countQuery = "SELECT count(*) FROM listing l WHERE l.status = :status",
            nativeQuery = true)
    Page<Listing> findActiveNearby(@Param("status") String status,
                                   @Param("lat") double lat,
                                   @Param("lng") double lng,
                                   Pageable pageable);
}
