package com.boip.backend.mapper;

import java.util.List;

import com.boip.backend.dto.ListingMediaResponseDto;
import com.boip.backend.dto.ListingResponseDto;
import com.boip.backend.dto.LotSummaryDto;
import com.boip.backend.entity.Listing;
import com.boip.backend.entity.ListingMedia;

public final class ListingMapper {

    private ListingMapper() {}

    public static ListingResponseDto toDto(Listing entity, List<ListingMediaResponseDto> media, LotSummaryDto lotSummary) {
        return ListingResponseDto.builder()
                .id(entity.getId())
                .lotId(entity.getLotId())
                .sellerUserId(entity.getSellerUserId())
                .status(entity.getStatus())
                .priceType(entity.getPriceType())
                .priceAmount(entity.getPriceAmount())
                .currency(entity.getCurrency())
                .publishedAt(entity.getPublishedAt())
                .expiresAt(entity.getExpiresAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .media(media)
                .lotSummary(lotSummary)
                .build();
    }

    public static ListingMediaResponseDto toDto(ListingMedia entity) {
        return ListingMediaResponseDto.builder()
                .id(entity.getId())
                .listingId(entity.getListingId())
                .mediaSlot(entity.getMediaSlot())
                .mediaType(entity.getMediaType())
                .mediaKey(entity.getMediaKey())
                .contentType(entity.getContentType())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
