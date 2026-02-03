-- V3: núcleo do lote + versionamento de atributos (profile)
-- Mantém híbrido com tabela cattle (opcional no MVP)

create table cattle_lot (
  id uuid primary key default gen_random_uuid(),

  owner_user_id uuid not null references app_user(id),

  lot_code varchar(60) not null,          -- identificador do lote (por usuário)
  head_count int not null,                -- qtd cabeças

  location_id uuid not null references location(id), -- localização do lote (não herda do usuário)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_cattle_lot_owner_code unique (owner_user_id, lot_code)
);

create index idx_cattle_lot_owner on cattle_lot (owner_user_id);
create index idx_cattle_lot_location on cattle_lot (location_id);
create index idx_cattle_lot_created_at on cattle_lot (created_at desc);

create trigger trg_cattle_lot_updated_at
before update on cattle_lot
for each row execute function set_updated_at();


-- Perfil versionado do lote (raça, sexo, finalidade, peso, idade, descrição, etc.)
-- Regra de “perfil atual” fica no backend: usar o maior profile_version, por exemplo.
create table cattle_lot_profile (
  id uuid primary key default gen_random_uuid(),

  lot_id uuid not null references cattle_lot(id) on delete cascade,

  profile_version int not null,           -- 1,2,3... controlado pelo backend

  breed varchar(80),                      -- Raça
  sex varchar(8),                         -- Sexo (ex.: M/F/MIXED) -> backend valida
  purpose varchar(30),                    -- Finalidade -> backend valida

  avg_weight_kg numeric(8,2),             -- Peso médio do lote
  avg_age_months int,                     -- Idade média (meses)
  birth_year int,                         -- opcional

  description varchar(800),               -- Descrição

  created_at timestamptz not null default now(),

  constraint uq_lot_profile_version unique (lot_id, profile_version)
);

create index idx_lot_profile_lot on cattle_lot_profile (lot_id);
create index idx_lot_profile_lot_version on cattle_lot_profile (lot_id, profile_version desc);
create index idx_lot_profile_created_at on cattle_lot_profile (created_at desc);


-- Híbrido: animais individuais dentro do lote (opcional no MVP)
create table cattle (
  id uuid primary key default gen_random_uuid(),

  lot_id uuid not null references cattle_lot(id) on delete cascade,

  ear_tag varchar(64),
  weight_kg numeric(8,2),
  sex char(1),
  birth_date date,

  created_at timestamptz not null default now(),

  constraint uq_cattle_lot_ear_tag unique (lot_id, ear_tag)
);

create index idx_cattle_lot on cattle (lot_id);
create index idx_cattle_created_at on cattle (created_at desc);
