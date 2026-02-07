package com.boip.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boip.backend.entity.AppUser;

// Database access layer for the app_user table. How service/controller can create, fetch users and 
// check duplicates without writing SQL
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID>{
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPersonDoc(String personDoc);
}
