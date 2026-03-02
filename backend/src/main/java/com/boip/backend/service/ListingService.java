package com.boip.backend.service;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.boip.backend.dto.ListingMediaInputDto;
import com.boip.backend.dto.ListingMediaRequestDto;
import com.boip.backend.dto.ListingMediaResponseDto;
import com.boip.backend.dto.ListingRequestDto;
import com.boip.backend.dto.ListingResponseDto;
import com.boip.backend.entity.Listing;
import com.boip.backend.entity.ListingMedia;
import com.boip.backend.mapper.ListingMapper;
import com.boip.backend.repository.ListingMediaRepository;
import com.boip.backend.repository.ListingRepository;

import lombok.RequiredArgsConstructor;

// I believe I have to change this because of the media 
// Media should be connected to the Listing, not independent

@Service
@RequiredArgsConstructor
public class ListingService {

    private static final Set<String> VALID_STATUSES =
            Set.of("DRAFT", "ACTIVE", "PAUSED", "SOLD", "CANCELLED");

    private final ListingRepository listingRepository;
    private final ListingMediaRepository listingMediaRepository;

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

    public List<ListingResponseDto> findBySeller(UUID sellerUserId) {
        return listingRepository.findAllBySellerUserId(sellerUserId)
                .stream().map(this::toDto).toList();
    }

    public List<ListingResponseDto> findByLot(UUID lotId) {
        return listingRepository.findAllByLotId(lotId)
                .stream().map(this::toDto).toList();
    }

    public ListingResponseDto updateStatus(UUID id, String newStatus) {
        if (newStatus == null || !VALID_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Must be one of: " + VALID_STATUSES);
        }
        Listing entity = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + id));
        entity.setStatus(newStatus);
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
        return ListingMapper.toDto(entity, media);
    }
}
