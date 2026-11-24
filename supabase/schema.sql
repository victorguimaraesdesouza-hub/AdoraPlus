-- Salmo — Sistema de Escala e Repertório
-- Schema PostgreSQL (compatível com Supabase Free Tier ou PostgreSQL 15+)

create extension if not exists "pgcrypto";

-- Enums de domínio
create type sex_enum as enum ('masculino', 'feminino');

create type uncao_enum as enum (
  'Sem Unção',
  'Aspirante',
  'Diácono(a)',
  'Presbítero(a)',
  'Pastor(a)',
  'Bispo(a)'
);

create type role_preset_enum as enum ('admin', 'editor', 'membro', 'personalizado');
create type service_status_enum as enum ('draft', 'confirmed');
create type song_source_enum as enum ('manual', 'google-drive', 'onedrive');
create type storage_provider_enum as enum ('google-drive', 'onedrive');

-- Configurações gerais da igreja / ministério (incluindo lista expansível de cargos)
create table if not exists app_settings (
  id smallint primary key default 1 check (id = 1),
  church_name text not null default 'Ministério de Louvor',
  cargos text[] not null default array[
    'Líder',
    'Ministro(a)',
    'Backing Vocal',
    'Solista',
    'Tecladista',
    'Baixista',
    'Baterista',
    'Violonista',
    'Guitarrista',
    'Metais'
  ],
  preferred_source storage_provider_enum,
  updated_at timestamptz not null default now()
);

-- Perfis de usuários (autenticação exclusiva via Google; nome preenchido manualmente)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  birth_date date not null,
  sex sex_enum not null,
  uncao uncao_enum not null default 'Sem Unção',
  cargos text[] not null default '{}',
  role_preset role_preset_enum not null default 'membro',
  permissions text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Escalas / Cultos
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  service_time time not null,
  call_time time,
  event text not null,
  location text not null default '',
  notes text not null default '',
  status service_status_enum not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_date on services(service_date);

-- Participantes escalados em cada culto
create table if not exists service_assignments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null,
  unique (service_id, profile_id, role)
);

create index if not exists idx_assignments_profile on service_assignments(profile_id);

-- Banco de músicas (referência externa no Google Drive / OneDrive ou cadastro manual)
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default '',
  musical_key text not null,
  bpm integer,
  source song_source_enum not null default 'manual',
  folder text,
  external_file_id text,
  reference_url text,
  added_at timestamptz not null default now()
);

-- Repertório vinculado à escala
create table if not exists service_songs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  musical_key text not null,
  position integer not null default 0,
  unique (service_id, song_id)
);

-- Conexões OAuth com Google Drive e OneDrive
create table if not exists storage_integrations (
  provider storage_provider_enum primary key,
  connected boolean not null default false,
  account_email text,
  folder_id text,
  folder_name text,
  auto_sync boolean not null default false,
  last_sync timestamptz,
  updated_at timestamptz not null default now()
);

-- Avisos gerais do ministério
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  notice_date date not null default current_date,
  pinned boolean not null default false,
  author_name text not null,
  created_at timestamptz not null default now()
);

-- Seed inicial de integrações e configurações
insert into app_settings (id) values (1) on conflict (id) do nothing;
insert into storage_integrations (provider) values ('google-drive'), ('onedrive') on conflict (provider) do nothing;
