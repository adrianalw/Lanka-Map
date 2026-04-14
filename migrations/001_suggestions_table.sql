-- Run this in your Supabase SQL Editor
-- Creates the suggestions table for user-submitted location proposals

create table if not exists public.suggestions (
  id           uuid primary key default gen_random_uuid(),
  location_name text not null,
  category      text,
  description   text,
  location_details text,
  submitter_email  text,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now()
);

-- Allow public inserts (anyone can suggest a location)
alter table public.suggestions enable row level security;

create policy "Anyone can insert suggestions"
  on public.suggestions for insert
  with check (true);

-- Only service role (admin API) can read/update/delete
create policy "Service role full access"
  on public.suggestions for all
  using (auth.role() = 'service_role');
