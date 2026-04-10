-- Run this in your Supabase SQL editor

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (
    category in (
      'Beach','Temple','Wildlife','Hiking','Waterfall',
      'Historical','Viewpoint','Museum','Garden','Other'
    )
  ),
  lat float not null,
  lng float not null,
  description text not null default '',
  entry_fee text not null default 'Free',
  hours text not null default 'Open daily',
  photo_url text,
  created_at timestamptz not null default now()
);

-- Enable public read access
alter table locations enable row level security;

create policy "Public read" on locations
  for select using (true);

create policy "Service role full access" on locations
  for all using (auth.role() = 'service_role');

-- Storage bucket for location photos
insert into storage.buckets (id, name, public)
values ('location-photos', 'location-photos', true)
on conflict do nothing;

create policy "Public photo read" on storage.objects
  for select using (bucket_id = 'location-photos');

create policy "Service role photo upload" on storage.objects
  for insert with check (
    bucket_id = 'location-photos'
    and auth.role() = 'service_role'
  );

create policy "Service role photo delete" on storage.objects
  for delete using (
    bucket_id = 'location-photos'
    and auth.role() = 'service_role'
  );
