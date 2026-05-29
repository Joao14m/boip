package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import com.boip.backend.dto.ListingMediaInputDto;
import com.boip.backend.dto.ListingMediaRequestDto;
import com.boip.backend.dto.ListingMediaResponseDto;
import com.boip.backend.dto.ListingPatchRequestDto;
import com.boip.backend.dto.ListingRequestDto;
import com.boip.backend.dto.ListingResponseDto;
import com.boip.backend.dto.LotSummaryDto;
import com.boip.backend.dto.PageResponseDto;
import com.boip.backend.entity.AppUser;
import com.boip.backend.entity.CattleLot;
import com.boip.backend.entity.CattleLotProfile;
import com.boip.backend.entity.Listing;
import com.boip.backend.entity.ListingMedia;
import com.boip.backend.entity.Location;
import com.boip.backend.mapper.ListingMapper;
import com.boip.backend.repository.CattleLotProfileRepository;
import com.boip.backend.repository.CattleLotRepository;
import com.boip.backend.repository.ListingMediaRepository;
import com.boip.backend.repository.ListingRepository;
import com.boip.backend.repository.LocationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ListingService {

    private static final Set<String> VALID_STATUSES =
            Set.of("DRAFT", "ACTIVE", "PAUSED", "SOLD", "CANCELLED");

    private final ListingRepository listingRepository;
    private final ListingMediaRepository listingMediaRepository;
    private final CattleLotRepository cattleLotRepository;
    private final CattleLotProfileRepository cattleLotProfileRepository;
    private final LocationRepository locationRepository;
    private final AuditService auditService;
    private final FirebaseStorageService firebaseStorageService;

    @Transactional
    public ListingResponseDto create(ListingRequestDto req, AppUser caller) {
        // Ownership guard: caller must own the lot they're listing.
        CattleLot lot = cattleLotRepository.findById(req.getLotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found: " + req.getLotId()));
        if (!caller.getId().equals(lot.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your lot");
        }

        List<ListingMediaInputDto> mediaItems = req.getMedia();

        String expectedPrefix = "listings/" + caller.getFirebaseUid() + "/" + lot.getId() + "/";
        Set<Integer> seenSlots = new HashSet<>();
        for (ListingMediaInputDto m : mediaItems) {
            if (!seenSlots.add(m.getMediaSlot())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Duplicate media slot: " + m.getMediaSlot());
            }
            if (m.getMediaSlot() == 3 && !"VIDEO".equals(m.getMediaType())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot 3 must be VIDEO");
            }
            if (m.getMediaSlot() < 3 && !"IMAGE".equals(m.getMediaType())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slots 0-2 must be IMAGE");
            }
            // Pin mediaKey to the caller's own Storage path. Without this, a client could submit
            // listings/{otherUserId}/.../x.jpg and have the listing render someone else's media,
            // or smuggle path traversal segments past the public-read Firebase Storage rule.
            if (!isValidMediaKey(m.getMediaKey(), expectedPrefix)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "mediaKey must be under " + expectedPrefix);
            }
        }

        String currency = (req.getCurrency() == null || req.getCurrency().isBlank())
                ? "BRL"
                : req.getCurrency().trim();

        OffsetDateTime now = OffsetDateTime.now();

        Listing entity = Listing.builder()
                .lotId(req.getLotId())
                .sellerUserId(caller.getId()) // I have change this
                .status("DRAFT")
                .priceType(req.getPriceType())
                .priceAmount(req.getPriceAmount())
                .currency(currency)
                .expiresAt(req.getExpiresAt())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Listing saved = listingRepository.save(entity);

        for (ListingMediaInputDto m : mediaItems) {
            listingMediaRepository.save(ListingMedia.builder()
                    .listingId(saved.getId())
                    .mediaSlot(m.getMediaSlot())
                    .mediaType(m.getMediaType())
                    .mediaKey(m.getMediaKey())
                    .contentType(m.getContentType())
                    .createdAt(now)
                    .build());
        }

        return toDto(saved);
    }

    public ListingResponseDto findById(UUID id) {
        Listing entity = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id));
        return toDto(entity);
    }

    public PageResponseDto<ListingResponseDto> findBySeller(UUID sellerUserId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toDtoPage(listingRepository.findAllBySellerUserId(sellerUserId, pageable));
    }

    public PageResponseDto<ListingResponseDto> findByLot(UUID lotId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toDtoPage(listingRepository.findAllByLotId(lotId, pageable));
    }

    public PageResponseDto<ListingResponseDto> findByStatus(String status, int page, int size) {
        if (!VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Must be one of: " + VALID_STATUSES);
        }
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toDtoPage(listingRepository.findAllByStatus(status, pageable));
    }

    @Transactional
    public ListingResponseDto patch(UUID id, ListingPatchRequestDto req, AppUser caller) {
        Listing entity = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id));
        if (!caller.getId().equals(entity.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your listing");
        }
        if (!Set.of("DRAFT", "PAUSED").contains(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Price can only be updated on DRAFT or PAUSED listings");
        }
        if (req.getPriceType() != null) entity.setPriceType(req.getPriceType());
        if (req.getPriceAmount() != null) entity.setPriceAmount(req.getPriceAmount());
        if (req.getCurrency() != null) entity.setCurrency(req.getCurrency().trim());
        if (req.getExpiresAt() != null) entity.setExpiresAt(req.getExpiresAt());
        return toDto(listingRepository.save(entity));
    }

    public ListingResponseDto updateStatus(UUID id, String newStatus, AppUser caller) {
        if (newStatus == null || !VALID_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Must be one of: " + VALID_STATUSES);
        }
        Listing entity = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id));
        if (!caller.getId().equals(entity.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your listing");
        }
        String previousStatus = entity.getStatus();
        entity.setStatus(newStatus);
        if ("ACTIVE".equals(newStatus) && entity.getPublishedAt() == null) {
            entity.setPublishedAt(OffsetDateTime.now());
        }
        ListingResponseDto result = toDto(listingRepository.save(entity));
        auditService.record(caller.getId(), "LISTING_STATUS_CHANGED", id,
                Map.of("from", previousStatus, "to", newStatus));
        return result;
    }

    @Transactional
    public void delete(UUID id, AppUser caller) {
        Listing entity = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id));
        if (!caller.getId().equals(entity.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your listing");
        }
        List<String> mediaKeys = listingMediaRepository.findAllByListingId(id)
                .stream().map(ListingMedia::getMediaKey).toList();
        listingRepository.deleteById(id);
        firebaseStorageService.deleteObjects(mediaKeys);
    }

    public ListingMediaResponseDto addMedia(ListingMediaRequestDto req, AppUser caller) {
        Listing listing = listingRepository.findById(req.getListingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + req.getListingId()));
        if (!caller.getId().equals(listing.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your listing");
        }
        if (req.getMediaSlot() < 0 || req.getMediaSlot() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "mediaSlot must be 0..3");
        }
        if (listingMediaRepository.existsByListingIdAndMediaSlot(req.getListingId(), req.getMediaSlot())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Slot " + req.getMediaSlot() + " is already taken for this listing");
        }
        if (req.getMediaSlot() == 3 && !"VIDEO".equals(req.getMediaType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot 3 must be VIDEO");
        }
        if (req.getMediaSlot() < 3 && !"IMAGE".equals(req.getMediaType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slots 0-2 must be IMAGE");
        }
        String expectedPrefix = "listings/" + caller.getFirebaseUid() + "/" + listing.getLotId() + "/";
        if (!isValidMediaKey(req.getMediaKey(), expectedPrefix)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "mediaKey must be under " + expectedPrefix);
        }

        ListingMedia entity = ListingMedia.builder()
                .listingId(req.getListingId())
                .mediaSlot(req.getMediaSlot())
                .mediaType(req.getMediaType())
                .mediaKey(req.getMediaKey())
                .contentType(req.getContentType())
                .createdAt(OffsetDateTime.now())
                .build();

        return ListingMapper.toDto(listingMediaRepository.save(entity));
    }

    @Transactional
    public void removeMedia(UUID mediaId, AppUser caller) {
        ListingMedia media = listingMediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found: " + mediaId));
        Listing listing = listingRepository.findById(media.getListingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found for media: " + mediaId));
        if (!caller.getId().equals(listing.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your listing");
        }
        String mediaKey = media.getMediaKey();
        listingMediaRepository.deleteById(mediaId);
        firebaseStorageService.deleteObject(mediaKey);
    }

    public List<ListingMediaResponseDto> getMedia(UUID listingId) {
        return listingMediaRepository.findAllByListingId(listingId)
                .stream().map(ListingMapper::toDto).toList();
    }

    private ListingResponseDto toDto(Listing entity) {
        List<Listing> single = List.of(entity);
        Map<UUID, List<ListingMedia>> mediaByListing = fetchMediaMap(single);
        Map<UUID, CattleLot> lotsById = fetchLotMap(single);
        Map<UUID, CattleLotProfile> latestProfileByLot = fetchLatestProfileMap(lotsById.values());
        Map<UUID, Location> locationsById = fetchLocationMap(lotsById.values());
        return buildDto(entity, mediaByListing, lotsById, latestProfileByLot, locationsById);
    }

    private PageResponseDto<ListingResponseDto> toDtoPage(Page<Listing> page) {
        List<Listing> listings = page.getContent();
        Map<UUID, List<ListingMedia>> mediaByListing = fetchMediaMap(listings);
        Map<UUID, CattleLot> lotsById = fetchLotMap(listings);
        Map<UUID, CattleLotProfile> latestProfileByLot = fetchLatestProfileMap(lotsById.values());
        Map<UUID, Location> locationsById = fetchLocationMap(lotsById.values());
        return PageResponseDto.of(page.map(l ->
                buildDto(l, mediaByListing, lotsById, latestProfileByLot, locationsById)));
    }

    private Map<UUID, List<ListingMedia>> fetchMediaMap(Collection<Listing> listings) {
        Set<UUID> ids = listings.stream().map(Listing::getId).collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return listingMediaRepository.findAllByListingIdIn(ids).stream()
                .collect(Collectors.groupingBy(ListingMedia::getListingId));
    }

    private Map<UUID, CattleLot> fetchLotMap(Collection<Listing> listings) {
        Set<UUID> ids = listings.stream().map(Listing::getLotId).collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return cattleLotRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(CattleLot::getId, l -> l));
    }

    private Map<UUID, CattleLotProfile> fetchLatestProfileMap(Collection<CattleLot> lots) {
        Set<UUID> lotIds = lots.stream().map(CattleLot::getId).collect(Collectors.toSet());
        if (lotIds.isEmpty()) return Map.of();
        return cattleLotProfileRepository.findLatestByLotIdIn(lotIds).stream()
                .collect(Collectors.toMap(CattleLotProfile::getLotId, p -> p));
    }

    private Map<UUID, Location> fetchLocationMap(Collection<CattleLot> lots) {
        Set<UUID> ids = lots.stream().map(CattleLot::getLocationId).collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return locationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Location::getId, l -> l));
    }

    private ListingResponseDto buildDto(Listing entity,
                                        Map<UUID, List<ListingMedia>> mediaByListing,
                                        Map<UUID, CattleLot> lotsById,
                                        Map<UUID, CattleLotProfile> latestProfileByLot,
                                        Map<UUID, Location> locationsById) {
        List<ListingMediaResponseDto> media = mediaByListing.getOrDefault(entity.getId(), List.of())
                .stream().map(ListingMapper::toDto).toList();
        CattleLot lot = lotsById.get(entity.getLotId());
        LotSummaryDto lotSummary = (lot == null) ? null : buildLotSummary(
                lot,
                latestProfileByLot.get(lot.getId()),
                locationsById.get(lot.getLocationId()));
        return ListingMapper.toDto(entity, media, lotSummary);
    }

    private static boolean isValidMediaKey(String key, String expectedPrefix) {
        if (key == null) return false;
        String path = extractStoragePath(key);
        if (!path.startsWith(expectedPrefix)) return false;
        String suffix = path.substring(expectedPrefix.length());
        return !suffix.isBlank() && !suffix.contains("..") && !suffix.contains("//") && !suffix.startsWith("/");
    }

    // Accepts either a plain storage path ("listings/uid/lotId/0.jpg") or a
    // Firebase Storage download URL. For download URLs the object path is the
    // URL-decoded segment after "/o/", stripped of any query string.
    private static String extractStoragePath(String key) {
        if (!key.startsWith("https://firebasestorage.googleapis.com/")) return key;
        String[] parts = key.split("/o/", 2);
        if (parts.length < 2) return key;
        String encoded = parts[1].split("\\?", 2)[0];
        try {
            return java.net.URLDecoder.decode(encoded, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return key;
        }
    }

    // Pure builder — callers must pre-fetch lot, profile, location to avoid N+1.
    private LotSummaryDto buildLotSummary(CattleLot lot, CattleLotProfile profile, Location location) {
        return LotSummaryDto.builder()
                .lotId(lot.getId())
                .lotCode(lot.getLotCode())
                .headCount(lot.getHeadCount())
                .breed(profile != null ? profile.getBreed() : null)
                .sex(profile != null ? profile.getSex() : null)
                .purpose(profile != null ? profile.getPurpose() : null)
                .avgWeightKg(profile != null ? profile.getAvgWeightKg() : null)
                .avgAgeMonths(profile != null ? profile.getAvgAgeMonths() : null)
                .uf(location != null ? location.getUf() : null)
                .build();
    }
}
