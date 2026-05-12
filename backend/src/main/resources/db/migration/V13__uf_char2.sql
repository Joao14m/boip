-- Align location.uf to char(2) as declared by V1 and the JPA entity.
-- Same drift as listing.currency (fixed in V12): the column was rewritten to
-- varchar at some point (likely under ddl-auto=update). Flyway won't re-run
-- V1 to fix it, so we align it forward here.
-- No-op on databases where the column is already char(2).
ALTER TABLE location ALTER COLUMN uf TYPE char(2);
