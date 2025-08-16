Supabase setup for Oumy's Beauty

1) Create a Supabase project at https://app.supabase.com

2) Add SQL to create the products table (run in SQL editor):

```sql
create table public.products (
  id text primary key,
  name text,
  description text,
  price numeric,
  image text,
  category text,
  stock int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

3) (Optional) Create a storage bucket named `product-photos` for images.

4) In Vercel, set the following Environment Variables for the project:
- VITE_SUPABASE_URL = <your project url>
- VITE_SUPABASE_ANON_KEY = <anon key>

5) Deploy the website and then, from the admin page (Auth required), use `Migrer vers Supabase` to push local products and `Importer depuis Supabase` to pull them to any device.
