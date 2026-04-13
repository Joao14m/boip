-- V8: enforce NOT NULL on firebase_uid
-- V5 added the column but left NOT NULL commented out; the AppUser entity
-- declares nullable=false, so Hibernate validate fails on a fresh DB.
-- Backfill any rows that somehow have a null uid before enforcing the constraint.

UPDATE app_user SET firebase_uid = id::text WHERE firebase_uid IS NULL;

ALTER TABLE app_user ALTER COLUMN firebase_uid SET NOT NULL;
