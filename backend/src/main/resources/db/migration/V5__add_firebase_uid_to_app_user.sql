-- V5__add_firebase_uid_to_app_user.sql
-- Add Firebase UID to app_user for onboarding/auth mapping

alter table app_user
  add column if not exists firebase_uid varchar(128);

-- backfill (optional): if you already have users and want to avoid nulls, you can set a placeholder
-- update app_user set firebase_uid = id::text where firebase_uid is null;

-- alter table app_user
--  alter column firebase_uid set not null;

create unique index if not exists uq_app_user_firebase_uid
  on app_user (firebase_uid);
