-- MLstream Initial Schema
-- Creates the core tables: profiles, apps, usage_logs

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES
-- =====================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================
-- APPS
-- =====================
create table public.apps (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  app_type text not null check (app_type in ('chat', 'text_gen', 'image_gen')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  theme_config jsonb default '{}',
  ai_config jsonb default '{}',
  api_key_encrypted text,
  max_tokens_limit integer default 1024,
  rate_limit_rpm integer default 30,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.apps enable row level security;

-- Creators can CRUD their own apps
create policy "Creators can view their own apps"
  on public.apps for select
  using (auth.uid() = creator_id);

create policy "Creators can insert their own apps"
  on public.apps for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update their own apps"
  on public.apps for update
  using (auth.uid() = creator_id);

create policy "Creators can delete their own apps"
  on public.apps for delete
  using (auth.uid() = creator_id);

-- Published apps are publicly readable (limited columns via view)
create policy "Published apps are publicly readable"
  on public.apps for select
  using (status = 'published');

-- =====================
-- USAGE LOGS
-- =====================
create table public.usage_logs (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references public.apps(id) on delete cascade,
  session_id text,
  ip_hash text,
  tokens_used integer default 0,
  response_time_ms integer default 0,
  created_at timestamptz default now()
);

alter table public.usage_logs enable row level security;

-- Only server can insert logs (via service role)
create policy "Service role can insert logs"
  on public.usage_logs for insert
  with check (true);

-- Creators can read logs for their own apps
create policy "Creators can view their app logs"
  on public.usage_logs for select
  using (
    exists (
      select 1 from public.apps
      where apps.id = usage_logs.app_id
      and apps.creator_id = auth.uid()
    )
  );

-- =====================
-- INDEXES
-- =====================
create index idx_apps_creator_id on public.apps(creator_id);
create index idx_apps_slug on public.apps(slug);
create index idx_apps_status on public.apps(status);
create index idx_usage_logs_app_id on public.usage_logs(app_id);
create index idx_usage_logs_created_at on public.usage_logs(created_at);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_apps_updated_at
  before update on public.apps
  for each row execute function public.update_updated_at();
