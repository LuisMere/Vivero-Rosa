-- Vivero Rosa: pega este SQL en Supabase → SQL Editor → Run
-- Luego: Authentication → Users → Add user (correo + contraseña, confirma el email)

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select
  using (true);

drop policy if exists "Authenticated users can insert site content" on public.site_content;
create policy "Authenticated users can insert site content"
  on public.site_content for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update site content" on public.site_content;
create policy "Authenticated users can update site content"
  on public.site_content for update
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read site images" on storage.objects;
create policy "Public read site images"
  on storage.objects for select
  using (bucket_id = 'site-images');

drop policy if exists "Auth upload site images" on storage.objects;
create policy "Auth upload site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images');

drop policy if exists "Auth update site images" on storage.objects;
create policy "Auth update site images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images');

drop policy if exists "Auth delete site images" on storage.objects;
create policy "Auth delete site images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images');
