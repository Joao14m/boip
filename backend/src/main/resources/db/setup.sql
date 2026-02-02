-- Crie o usuário do app (pode rodar como postgres)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'boi_user') THEN
    CREATE USER boi_user WITH PASSWORD 'boi_pass';
  END IF;
END $$;

-- Crie a database do app
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'boi_market') THEN
    CREATE DATABASE boi_market OWNER boi_user;
  END IF;
END $$;

-- Depois de criada, conecte em boi_market e rode:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- CREATE EXTENSION IF NOT EXISTS citext;
-- GRANT ALL ON SCHEMA public TO boi_user;
