-- SQL to create products table for Oumy's Beauty
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text,
  description text,
  price numeric,
  image text,
  category text,
  stock int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security and basic open policies (adjust for your needs)
alter table public.products enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Allow public read'
  ) then
    create policy "Allow public read" on public.products for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Allow anon upsert'
  ) then
    create policy "Allow anon upsert" on public.products for all using (true) with check (true);
  end if;
end $$;
