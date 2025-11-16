-- ============================================================================
-- Supabase Database Schema for AI Research Analysis Platform
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- USERS TABLE (synced with Supabase Auth)
-- ============================================================================
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index on email for quick lookups
create index if not exists idx_users_email on users(email);

-- ============================================================================
-- BOOKMARKS TABLE (papers saved by users)
-- ============================================================================
create table if not exists bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  paper_id text not null,
  paper_title text not null,
  paper_authors text[] not null default '{}',
  paper_abstract text,
  paper_url text,
  paper_year integer,
  paper_doi text,
  bookmarked_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for performance
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_bookmarks_paper_id on bookmarks(paper_id);
create index if not exists idx_bookmarks_created_at on bookmarks(created_at desc);

-- Unique constraint: one bookmark per user per paper
create unique index if not exists idx_bookmarks_user_paper on bookmarks(user_id, paper_id);

-- ============================================================================
-- ANALYSES TABLE (cached analysis results)
-- ============================================================================
create table if not exists analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  bookmark_id uuid not null references bookmarks(id) on delete cascade,
  analysis_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes
create index if not exists idx_analyses_user_id on analyses(user_id);
create index if not exists idx_analyses_bookmark_id on analyses(bookmark_id);
create unique index if not exists idx_analyses_bookmark_unique on analyses(bookmark_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table bookmarks enable row level security;
alter table analyses enable row level security;

-- USERS: Users can only see their own profile
create policy "Users can view their own profile"
  on users
  for select
  using (auth.uid() = id);

-- USERS: Users can update their own profile
create policy "Users can update their own profile"
  on users
  for update
  using (auth.uid() = id);

-- BOOKMARKS: Users can only see their own bookmarks
create policy "Users can view their own bookmarks"
  on bookmarks
  for select
  using (auth.uid() = user_id);

create policy "Users can create bookmarks"
  on bookmarks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on bookmarks
  for delete
  using (auth.uid() = user_id);

-- ANALYSES: Users can only see analyses for their bookmarks
create policy "Users can view their own analyses"
  on analyses
  for select
  using (auth.uid() = user_id);

create policy "Users can create analyses"
  on analyses
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on analyses
  for update
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS FOR MAINTENANCE
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Function to auto-create user profile when auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user when auth.users is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create triggers for updated_at
create trigger users_updated_at_trigger
  before update on users
  for each row
  execute function update_timestamp();

create trigger analyses_updated_at_trigger
  before update on analyses
  for each row
  execute function update_timestamp();
