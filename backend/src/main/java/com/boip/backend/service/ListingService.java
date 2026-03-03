package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.ListingMediaInputDto;
import com.boip.backend.dto.ListingMediaRequestDto;
import com.boip.backend.dto.ListingMediaResponseDto;
import com.boip.backend.dto.ListingRequestDto;
import com.boip.backend.dto.ListingResponseDto;
import com.boip.backend.dto.LotSummaryDto;
import com.boip.backend.dto.PageResponseDto;
import com.boip.backend.entity.CattleLot;
import com.boip.backend.entity.CattleLotProfile;
import com.boip.backend.entity.Listing;
import com.boip.backend.entity.ListingMedia;
import com.boip.backend.mapper.ListingMapper;
import com.boip.backend.repository.CattleLotProfileRepository;
import com.boip.backend.repository.CattleLotRepository;
import com.boip.backend.repository.ListingMediaRepository;
import com.boip.backend.repository.ListingRepository;

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

    @Transactional
    public ListingResponseDto create(ListingRequestDto req) {
        List<ListingMediaInputDto> mediaItems = req.getMedia();

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
        }

        String currency = (req.getCurrency() == null || req.getCurrency().isBlank())
                ? "BRL"
                : req.getCurrency().trim();

        OffsetDateTime now = OffsetDateTime.now();

        Listing entity = Listing.builder()
                .lotId(req.getLotId())
                .sellerUserId(req.getSellerUserId())
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
        return PageResponseDto.of(listingRepository.findAllBySellerUserId(sellerUserId, pageable).map(this::toDto));
    }

    public PageResponseDto<ListingResponseDto> findByLot(UUID lotId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponseDto.of(listingRepository.findAllByLotId(lotId, pageable).map(this::toDto));
    }

    public PageResponseDto<ListingResponseDto> findByStatus(String status, int page, int size) {
        if (!VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Must be one of: " + VALID_STATUSES);
        }
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponseDto.of(listingRepository.findAllByStatus(status, pageable).map(this::toDto));
    }

    public ListingResponseDto updateStatus(UUID id, String newStatus) {
        if (newStatus == null || !VALID_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Must be one of: " + VALID_STATUSES);
        }
        Listing entity = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id));
        entity.setStatus(newStatus);
        if ("ACTIVE".equals(newStatus) && entity.getPublishedAt() == null) {
            entity.setPublishedAt(OffsetDateTime.now());
        }
        return toDto(listingRepository.save(entity));
    }

    public void delete(UUID id) {
        if (!listingRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id);
        }
        listingRepository.deleteById(id);
    }

    public ListingMediaResponseDto addMedia(ListingMediaRequestDto req) {
        if (!listingRepository.existsById(req.getListingId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + req.getListingId());
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

    public void removeMedia(UUID mediaId) {
        if (!listingMediaRepository.existsById(mediaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found: " + mediaId);
        }
        listingMediaRepository.deleteById(mediaId);
    }

    public List<ListingMediaResponseDto> getMedia(UUID listingId) {
        return listingMediaRepository.findAllByListingId(listingId)
                .stream().map(ListingMapper::toDto).toList();
    }

    private ListingResponseDto toDto(Listing entity) {
        List<ListingMediaResponseDto> media = listingMediaRepository
                .findAllByListingId(entity.getId())
                .stream().map(ListingMapper::toDto).toList();

        LotSummaryDto lotSummary = buildLotSummary(entity.getLotId());

        return ListingMapper.toDto(entity, media, lotSummary);
    }

    private LotSummaryDto buildLotSummary(UUID lotId) {
        CattleLot lot = cattleLotRepository.findById(lotId).orElse(null);
        if (lot == null) return null;

        CattleLotProfile profile = cattleLotProfileRepository
                .findTopByLotIdOrderByProfileVersionDesc(lotId)
                .orElse(null);

        return LotSummaryDto.builder()
                .lotId(lot.getId())
                .lotCode(lot.getLotCode())
                .headCount(lot.getHeadCount())
                .breed(profile != null ? profile.getBreed() : null)
                .sex(profile != null ? profile.getSex() : null)
                .purpose(profile != null ? profile.getPurpose() : null)
                .avgWeightKg(profile != null ? profile.getAvgWeightKg() : null)
                .avgAgeMonths(profile != null ? profile.getAvgAgeMonths() : null)
                .build();
    }
}
