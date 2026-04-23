package com.boip.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.boip.backend.dto.ListingMediaRequestDto;
import com.boip.backend.dto.ListingMediaResponseDto;
import com.boip.backend.dto.ListingRequestDto;
import com.boip.backend.dto.ListingResponseDto;
import com.boip.backend.dto.PageResponseDto;
import com.boip.backend.dto.StatusUpdateRequestDto;
import com.boip.backend.service.ListingService;

import static com.boip.backend.auth.SecurityUtils.requireAppUser;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Validated
@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListingResponseDto create(@Valid @RequestBody ListingRequestDto req) {
        return listingService.create(req, requireAppUser());
    }

    @GetMapping("/{id}")
    public ListingResponseDto findById(@PathVariable UUID id) {
        return listingService.findById(id);
    }

    // Filter by seller, lot, or status (marketplace feed). All results are paginated.
    @GetMapping
    public PageResponseDto<ListingResponseDto> findBy(
            @RequestParam(required = false) UUID sellerUserId,
            @RequestParam(required = false) UUID lotId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        if (sellerUserId != null) return listingService.findBySeller(sellerUserId, page, size);
        if (lotId != null) return listingService.findByLot(lotId, page, size);
        String effectiveStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "ACTIVE";
        return listingService.findByStatus(effectiveStatus, page, size);
    }

    @PatchMapping("/{id}/status")
    public ListingResponseDto updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequestDto body) {
        return listingService.updateStatus(id, body.getStatus(), requireAppUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        listingService.delete(id, requireAppUser());
    }

    @PostMapping("/{id}/media")
    @ResponseStatus(HttpStatus.CREATED)
    public ListingMediaResponseDto addMedia(
            @PathVariable UUID id,
            @Valid @RequestBody ListingMediaRequestDto req) {
        req.setListingId(id);
        return listingService.addMedia(req, requireAppUser());
    }

    @GetMapping("/{id}/media")
    public List<ListingMediaResponseDto> getMedia(@PathVariable UUID id) {
        return listingService.getMedia(id);
    }

    @DeleteMapping("/media/{mediaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMedia(@PathVariable UUID mediaId) {
        listingService.removeMedia(mediaId, requireAppUser());
    }

}
