create extension if not exists pgcrypto;
create extension if not exists citext;

create table location (
  id uuid primary key default gen_random_uuid(),
  municipality varchar(120) not null,
  uf char(2) not null,
  ibge_code varchar(7) not null,

  created_at timestamptz not null default now(),

  constraint uq_location_ibge unique (ibge_code),
  constraint chk_location_uf_format check (uf ~ '^[A-Z]{2}$')
);

create index idx_location_uf_municipality on location (uf, municipality);

create table app_user (
  id uuid primary key default gen_random_uuid(),

  first_name varchar(80) not null,
  last_name  varchar(120) not null,

  email citext not null,
  phone varchar(20) not null,

  person_doc varchar(14) not null,
  doc_type varchar(4) not null, -- CPF | CNPJ

  has_car boolean not null,
  car_number varchar(30),

  location_id uuid not null references location(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_user_email unique (email),
  constraint uq_user_doc unique (person_doc),

  constraint chk_user_doc_type check (doc_type in ('CPF','CNPJ')),
  constraint chk_user_doc_len check (
    (doc_type = 'CPF'  and length(person_doc) = 11) or
    (doc_type = 'CNPJ' and length(person_doc) = 14)
  ),

  constraint chk_user_car_number_required check (
    (has_car = false and car_number is null) or
    (has_car = true  and car_number is not null and length(trim(car_number)) > 0)
  )
);

create index idx_app_user_location on app_user (location_id);
create index idx_app_user_created_at on app_user (created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_app_user_updated_at
before update on app_user
for each row execute function set_updated_at();
