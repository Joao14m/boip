package com.boip.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.boip.backend.dto.ListingMediaRequestDto;
import com.boip.backend.dto.ListingMediaResponseDto;
import com.boip.backend.dto.ListingRequestDto;
import com.boip.backend.dto.ListingResponseDto;
import com.boip.backend.service.ListingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListingResponseDto create(@Valid @RequestBody ListingRequestDto req) {
        return listingService.create(req);
    }

    @GetMapping("/{id}")
    public ListingResponseDto findById(@PathVariable UUID id) {
        return listingService.findById(id);
    }

    // We can find by the seller or by the lot
    @GetMapping
    public List<ListingResponseDto> findBy(
            @RequestParam(required = false) UUID sellerUserId,
            @RequestParam(required = false) UUID lotId) {
        if (sellerUserId != null) return listingService.findBySeller(sellerUserId);
        if (lotId != null) return listingService.findByLot(lotId);
        return List.of();
    }

    // Status to add to front: "DRAFT", "ACTIVE", "PAUSED", "SOLD", "CANCELLED"
    @PatchMapping("/{id}/status")
    public ListingResponseDto updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return listingService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        listingService.delete(id);
    }

    // listingId comes from path; set on req before passing to service
    @PostMapping("/{id}/media")
    @ResponseStatus(HttpStatus.CREATED)
    public ListingMediaResponseDto addMedia(
            @PathVariable UUID id,
            @RequestBody ListingMediaRequestDto req) {
        req.setListingId(id);
        return listingService.addMedia(req);
    }

    @GetMapping("/{id}/media")
    public List<ListingMediaResponseDto> getMedia(@PathVariable UUID id) {
        return listingService.getMedia(id);
    }

    @DeleteMapping("/media/{mediaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMedia(@PathVariable UUID mediaId) {
        listingService.removeMedia(mediaId);
    }
}
