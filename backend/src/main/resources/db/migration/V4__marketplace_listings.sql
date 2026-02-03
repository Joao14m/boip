-- V4: anúncio/publicação + mídia do anúncio
-- Inclui expires_at e price_type (PER_HEAD/TOTAL) sem checks (backend valida)

create table listing (
  id uuid primary key default gen_random_uuid(),

  lot_id uuid not null references cattle_lot(id),

  seller_user_id uuid not null references app_user(id), -- publicador/vendedor (pode ser corretor)

  status varchar(12) not null,           -- backend controla (DRAFT/ACTIVE/PAUSED/SOLD/CANCELLED etc)

  price_type varchar(10) not null,       -- PER_HEAD | TOTAL (backend valida)
  price_amount numeric(14,2) not null,   -- preço conforme price_type
  currency char(3) not null default 'BRL',

  published_at timestamptz,              -- "Publicado em?"
  expires_at timestamptz,                -- expiração do anúncio (backend define)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_listing_id_seller unique (id, seller_user_id)
);

create index idx_listing_lot on listing (lot_id);
create index idx_listing_seller on listing (seller_user_id);
create index idx_listing_status on listing (status);
create index idx_listing_published_at on listing (published_at desc);
create index idx_listing_expires_at on listing (expires_at);

create trigger trg_listing_updated_at
before update on listing
for each row execute function set_updated_at();


-- Mídia com slots fixos (simplifica a regra “3 imagens + 1 vídeo” no backend)
-- Convenção sugerida:
-- slot 0,1,2 => imagens
-- slot 3     => vídeo
create table listing_media (
  id uuid primary key default gen_random_uuid(),

  listing_id uuid not null references listing(id) on delete cascade,

  media_slot smallint not null,           -- 0..3 (backend controla)
  media_type varchar(10) not null,        -- IMAGE | VIDEO (backend controla)

  media_key varchar(500) not null,        -- path/chave no storage
  content_type varchar(80),               -- opcional: image/jpeg, video/mp4

  created_at timestamptz not null default now(),

  constraint uq_listing_media_slot unique (listing_id, media_slot)
);

create index idx_listing_media_listing on listing_media (listing_id);
create index idx_listing_media_type on listing_media (media_type);
create index idx_listing_media_created_at on listing_media (created_at desc);
