create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  owner text not null,
  business text not null,
  category text not null,
  city text not null,
  address text not null,
  phone text not null,
  promo text not null,
  promo_radius integer not null default 5,
  promo_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  category text not null,
  excerpt text not null,
  body text not null,
  cover_url text not null,
  status text not null check (status in ('Draft', 'Terbit')) default 'Draft',
  read_minutes integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null,
  distance numeric(5, 2) not null default 0,
  phone text not null,
  promo text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_targets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('private', 'group')),
  name text not null,
  meta text not null default '',
  color text not null default '#0f766e',
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references public.chat_targets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.articles enable row level security;
alter table public.businesses enable row level security;
alter table public.chat_targets enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles owner read" on public.profiles for select using (auth.uid() = id);
create policy "profiles owner write" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "transactions owner CRUD" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "published articles public read" on public.articles for select using (status = 'Terbit' or auth.uid() = user_id);
create policy "articles owner CRUD" on public.articles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "businesses public read" on public.businesses for select using (true);
create policy "businesses owner CRUD" on public.businesses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chat targets owner CRUD" on public.chat_targets for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "chat messages owner read" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_targets
      where chat_targets.id = chat_messages.target_id
      and chat_targets.owner_id = auth.uid()
    )
  );
create policy "chat messages owner insert" on public.chat_messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.chat_targets
      where chat_targets.id = chat_messages.target_id
      and chat_targets.owner_id = auth.uid()
    )
  );
