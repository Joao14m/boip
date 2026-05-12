-- Align listing.currency to char(3) as declared by V4 and the JPA entity.
-- Local DB drifted to varchar at some point (likely a prior ddl-auto=update run
-- against the old `length = 3` annotation); Flyway won't re-run V4 to fix it.
-- This migration is a no-op on databases where the column is already char(3).
ALTER TABLE listing ALTER COLUMN currency TYPE char(3);
