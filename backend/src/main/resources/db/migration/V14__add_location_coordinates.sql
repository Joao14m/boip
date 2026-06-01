-- V14__add_location_coordinates.sql
-- Add municipality-center coordinates to location so the marketplace feed can be
-- ordered by distance. These act as the fallback point both for a buyer's origin
-- (their home municipality) and for a listing's target (its lot's municipality)
-- when no precise lot pin exists. Columns are nullable so future municipalities
-- can be inserted before their coordinates are known.

ALTER TABLE location ADD COLUMN IF NOT EXISTS latitude  numeric(9,6);
ALTER TABLE location ADD COLUMN IF NOT EXISTS longitude numeric(9,6);

-- Seed centroids for the existing municipalities (matched by IBGE code).
UPDATE location SET latitude = -23.5505, longitude = -46.6333 WHERE ibge_code = '3550308'; -- São Paulo / SP
UPDATE location SET latitude = -22.9056, longitude = -47.0608 WHERE ibge_code = '3509502'; -- Campinas / SP
UPDATE location SET latitude = -22.9068, longitude = -43.1729 WHERE ibge_code = '3304557'; -- Rio de Janeiro / RJ
UPDATE location SET latitude = -22.8833, longitude = -43.1034 WHERE ibge_code = '3303302'; -- Niterói / RJ
UPDATE location SET latitude = -19.9167, longitude = -43.9345 WHERE ibge_code = '3106200'; -- Belo Horizonte / MG
