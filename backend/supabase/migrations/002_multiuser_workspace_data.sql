-- Menyempurnakan schema agar setiap akun UMKM punya workspace data sendiri.

alter table public.transactions add column if not exists updated_at timestamptz not null default now();
alter table public.articles add column if not exists author text not null default '';
alter table public.businesses add column if not exists updated_at timestamptz not null default now();

-- Slug artikel tidak boleh global karena banyak UMKM bisa memakai judul yang mirip.
alter table public.articles drop constraint if exists articles_slug_key;
create unique index if not exists articles_user_slug_unique on public.articles(user_id, slug);

create table if not exists public.stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  quantity numeric(14, 2) not null default 0 check (quantity >= 0),
  unit text not null,
  reorder_point numeric(14, 2) not null default 0 check (reorder_point >= 0),
  updated_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.report_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  body text not null,
  status text not null check (status in ('Draft', 'Perlu Follow Up', 'Selesai')) default 'Draft',
  priority text not null check (priority in ('Rendah', 'Sedang', 'Tinggi')) default 'Sedang',
  author text not null,
  created_on date not null default current_date,
  updated_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.export_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('finance_excel')),
  file_name text not null,
  created_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.stocks enable row level security;
alter table public.report_notes enable row level security;
alter table public.export_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'stocks' and policyname = 'stocks owner CRUD') then
    create policy "stocks owner CRUD" on public.stocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'report_notes' and policyname = 'report notes owner CRUD') then
    create policy "report notes owner CRUD" on public.report_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'export_logs' and policyname = 'export logs owner CRUD') then
    create policy "export logs owner CRUD" on public.export_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;