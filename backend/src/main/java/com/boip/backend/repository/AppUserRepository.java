package com.boip.backend.repository;

import com.boip.backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

// Database access layer for the app_user table. How service/controller can create, fetch users and 
// check duplicates without writing SQL
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID>{
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPersonDoc(String personDoc);
    Optional<AppUser> findByFirebaseUid(String firebaseUid);
}
