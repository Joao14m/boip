-- V15__add_lot_coordinates.sql
-- Optional precise coordinates for a cattle lot (a seller's map pin). When set,
-- the marketplace feed measures distance to this exact point; when null it falls
-- back to the lot's municipality center (see V14 / the findActiveNearby query).
ALTER TABLE cattle_lot ADD COLUMN IF NOT EXISTS latitude  numeric(9,6);
ALTER TABLE cattle_lot ADD COLUMN IF NOT EXISTS longitude numeric(9,6);
