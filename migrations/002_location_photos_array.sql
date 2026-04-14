-- Optional: adds a photos array column to support multiple images per location
-- Run this in your Supabase SQL Editor after migration 001

alter table public.locations
  add column if not exists photos text[] default '{}';

comment on column public.locations.photos is
  'Additional photo URLs beyond the primary photo_url';
