package com.boip.backend.service;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FirebaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseStorageService.class);

    private final FirebaseApp firebaseApp;

    public void deleteObjects(Collection<String> mediaKeys) {
        if (mediaKeys == null || mediaKeys.isEmpty()) return;
        for (String key : mediaKeys) {
            deleteObject(key);
        }
    }

    // Best-effort: orphan media is recoverable later via an audit job, so we
    // never let a Storage failure roll back a DB delete that already succeeded.
    public void deleteObject(String mediaKey) {
        if (mediaKey == null || mediaKey.isBlank()) return;
        String path = extractStoragePath(mediaKey);
        try {
            Bucket bucket = StorageClient.getInstance(firebaseApp).bucket();
            Blob blob = bucket.get(path);
            if (blob == null) {
                log.debug("Storage object already absent: {}", path);
                return;
            }
            if (!blob.delete()) {
                log.warn("Storage delete returned false for object: {}", path);
            }
        } catch (IllegalArgumentException e) {
            log.warn("Storage bucket not configured; skipping delete of {}", path);
        } catch (Exception e) {
            log.warn("Failed to delete storage object {}: {}", path, e.getMessage());
        }
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
            return URLDecoder.decode(encoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return key;
        }
    }
}