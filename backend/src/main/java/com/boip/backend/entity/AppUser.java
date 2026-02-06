package com.boip.backend.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
    private String firebaseUid;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 120)
    private String lastName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "person_doc", nullable = false, length = 14)
    private String personDoc;

    @Column(name = "doc_type", nullable = false, length = 4)
    private String docType;

    @Column(name = "has_car", nullable = false)
    private Boolean hasCar;

    @Column(name = "car_number", length = 30)
    private String carNumber;

    @Column(name = "location_id", nullable = false, columnDefinition = "uuid")
    private UUID locationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // resolve created_at/updated_at null no INSERT
    @PrePersist
    private void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // getters/setters (os que seu código usa)
    public UUID getId() { return id; }

    public String getFirebaseUid() { return firebaseUid; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPersonDoc(String personDoc) { this.personDoc = personDoc; }
    public void setDocType(String docType) { this.docType = docType; }
    public void setHasCar(Boolean hasCar) { this.hasCar = hasCar; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }
    public void setLocationId(UUID locationId) { this.locationId = locationId; }
}
