-- V2__seed_locations_min.sql
-- Seed mínimo de locations para DEV/testes (idempotente via UPSERT).

INSERT INTO public.location (municipality, uf, ibge_code)
VALUES
  ('Rio de Janeiro', 'RJ', '3304557'),
  ('Niterói',        'RJ', '3303302'),
  ('São Paulo',      'SP', '3550308'),
  ('Campinas',       'SP', '3509502'),
  ('Belo Horizonte', 'MG', '3106200')
ON CONFLICT (ibge_code) DO UPDATE
SET municipality = EXCLUDED.municipality,
    uf           = EXCLUDED.uf;

-- Comentários:
-- id é gerado por DEFAULT gen_random_uuid(), então não precisamos inserir id.
-- ibge_code é varchar(7), então inserimos como string (com aspas).
-- uq_location_ibge já existe, então ON CONFLICT (ibge_code) funciona.
-- Check uf exige A-Z{2} — os valores estão no formato correto.